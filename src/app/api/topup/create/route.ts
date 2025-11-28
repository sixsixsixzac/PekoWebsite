import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth/auth.config"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = parseInt(session.user.id)
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { packageId, amount, paymentMethod = "promptpay" } = body

    if (!packageId || !amount) {
      return NextResponse.json(
        { error: "Package ID and amount are required" },
        { status: 400 }
      )
    }

    // Get user data including u_name
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: userId },
      select: {
        uName: true,
        uuid: true,
      },
    })

    if (!userProfile) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Get package to get coin_amount
    const packageData = await prisma.topupPackage.findUnique({
      where: { id: parseInt(packageId) },
      select: {
        coinAmount: true,
      },
    })

    if (!packageData) {
      return NextResponse.json(
        { error: "Package not found" },
        { status: 404 }
      )
    }

    // Get payment gateway configuration from environment variables
    const apiUrl = process.env.APP_API_URL || "http://tmwallet.thaighost.net/api_pph.php"
    const apiId = process.env.APP_API_ID || "102796"
    const topupUser = process.env.PAYMENT_USERNAME
    const topupPassword = process.env.PAYMENT_PASSWORD
    const promptpayId = process.env.PROMPTPAY_ID
    const promptpayType = process.env.PROMPTPAY_TYPE || "03" // 01 = phone, 02 = national ID

    // Check which variables are missing and provide specific error message
    const missingVars: string[] = []
    if (!topupUser) missingVars.push("PAYMENT_USERNAME")
    if (!topupPassword) missingVars.push("PAYMENT_PASSWORD")
    if (!promptpayId) missingVars.push("PROMPTPAY_ID")
    
    if (missingVars.length > 0) {
      return NextResponse.json(
        { 
          error: "Payment gateway configuration is missing",
          details: `Please set the following environment variables: ${missingVars.join(", ")}`,
          missingVariables: missingVars
        },
        { status: 500 }
      )
    }

    // TypeScript type narrowing: at this point we know these are defined
    const username = topupUser!
    const password = topupPassword!
    const promptpay = promptpayId!

    // Check for existing pending transaction
    let existingTransaction = await prisma.topupTransaction.findFirst({
      where: {
        userId,
        status: "pending",
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Update existing transaction or create new one
    let transaction
    if (existingTransaction) {
      // Update existing transaction
      transaction = await prisma.topupTransaction.update({
        where: { id: existingTransaction.id },
        data: {
          packageId: parseInt(packageId),
          amountPaid: new Prisma.Decimal(amount),
          coinsAdded: packageData.coinAmount,
          paymentMethod: paymentMethod,
          updatedAt: new Date(),
        },
      })
    } else {
      // Create new transaction
      const transactionId = parseInt(apiId) || Date.now()
      transaction = await prisma.topupTransaction.create({
        data: {
          userId,
          packageId: parseInt(packageId),
          refId: apiId,
          transactionId: transactionId,
          paymentMethod: paymentMethod,
          amountPaid: new Prisma.Decimal(amount),
          coinsAdded: packageData.coinAmount,
          status: "pending",
        },
      })
    }

    // Get client IP address
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                     request.headers.get("x-real-ip") ||
                     "127.0.0.1"

    // Step 1: Create ID Pay
    // According to API docs: amount should be integer (no decimals)
    // const apiAmount = parseInt(amount.toString())
    const apiAmount = parseInt("1") // for testing
    const createPayUrl = `${apiUrl}?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&amount=${apiAmount}&ref1=${encodeURIComponent(userProfile.uName)}&con_id=${encodeURIComponent(apiId)}&ip=${encodeURIComponent(clientIp)}&method=create_pay`

    let idPay: string | null = null
    try {
      const createPayResponse = await fetch(createPayUrl)
      const createPayData = await createPayResponse.text()
      console.log("Create Pay Response:", createPayData)
      
      const createPayResult = JSON.parse(createPayData)
      
      if (createPayResult.status !== 1) {
        return NextResponse.json(
          { 
            error: "Failed to create payment",
            message: createPayResult.msg || "Unknown error from payment gateway"
          },
          { status: 500 }
        )
      }

      idPay = createPayResult.id_pay
      if (!idPay) {
        return NextResponse.json(
          { 
            error: "Failed to get payment ID",
            message: createPayResult.msg || "No id_pay returned from payment gateway"
          },
          { status: 500 }
        )
      }
    } catch (apiError) {
      console.error("Error calling create_pay API:", apiError)
      return NextResponse.json(
        { error: "Failed to connect to payment gateway", details: apiError instanceof Error ? apiError.message : "Unknown error" },
        { status: 500 }
      )
    }

    // Step 2: Get QR Code Details
    const detailPayUrl = `${apiUrl}?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&con_id=${encodeURIComponent(apiId)}&id_pay=${encodeURIComponent(idPay)}&type=${encodeURIComponent(promptpayType)}&promptpay_id=${encodeURIComponent(promptpay)}&method=detail_pay`

    let qrImageBase64: string | null = null
    let timeOut: number | null = null
    try {
      const detailPayResponse = await fetch(detailPayUrl)
      const detailPayData = await detailPayResponse.text()
      console.log("Detail Pay Response:", detailPayData)
      
      const detailPayResult = JSON.parse(detailPayData)
      
      if (detailPayResult.status !== 1) {
        return NextResponse.json(
          { 
            error: "Failed to get QR code",
            message: detailPayResult.msg || "Unknown error from payment gateway"
          },
          { status: 500 }
        )
      }

      qrImageBase64 = detailPayResult.qr_image_base64
      timeOut = detailPayResult.time_out
      
      if (!qrImageBase64) {
        return NextResponse.json(
          { 
            error: "Failed to generate QR code",
            message: detailPayResult.msg || "No QR code returned from payment gateway"
          },
          { status: 500 }
        )
      }
    } catch (apiError) {
      console.error("Error calling detail_pay API:", apiError)
      return NextResponse.json(
        { error: "Failed to get QR code from payment gateway", details: apiError instanceof Error ? apiError.message : "Unknown error" },
        { status: 500 }
      )
    }

    // Update transaction with id_pay
    await prisma.topupTransaction.update({
      where: { id: transaction.id },
      data: {
        refId: idPay,
      },
    })

    // Base64 data URL is already a valid URL that can be used directly in img tags or copied
    const qrCodeDataUrl = `data:image/png;base64,${qrImageBase64}`
    
    return NextResponse.json({
      success: true,
      qrCodeUrl: qrCodeDataUrl,
      timeOut: timeOut,
    })
  } catch (error) {
    console.error("Error creating topup payment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

