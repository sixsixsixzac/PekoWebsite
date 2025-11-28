import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

/**
 * Webhook endpoint for TMWEasy payment gateway
 * 
 * TMWEasy sends POST request with body parameters:
 * - data: JSON string containing payment data
 *   Example: {"id_pay":"754349","ref1":"testpay","amount_check":"1901","amount":"19.00","date_pay":"2024-07-29 14:14"}
 * - signature: MD5 hash of "data:api_key"
 * 
 * Signature format: MD5(data:api_key)
 * Response format: {"status":1} for success, {"status":0,"error":"..."} for errors
 * 
 * Webhook URLs:
 * - Local network: http://192.168.1.104:3000/api/topup/webhook
 * - Cloudflare tunnel (public): https://scale-manuals-accessories-demonstrated.trycloudflare.com/api/topup/webhook
 * - Production: https://yourdomain.com/api/topup/webhook
 * 
 * Note: The Cloudflare tunnel URL is publicly accessible from anywhere on the internet.
 * Configure this URL in your TMWEasy account settings.
 */
export async function POST(request: Request) {
  try {
    // Try to get data from form data first, then JSON body
    let dataString: string | null = null
    let signature: string | null = null

    const contentType = request.headers.get("content-type") || ""
    
    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      dataString = formData.get("data") as string
      signature = formData.get("signature") as string
    } else {
      // Try JSON body
      const jsonBody = await request.json()
      dataString = jsonBody.data
      signature = jsonBody.signature
    }

    if (!dataString || !signature) {
      return NextResponse.json(
        { status: 0, error: "Missing data or signature" },
        { status: 400 }
      )
    }

    // Get API key from environment variables
    // According to TMWEasy docs: signature = MD5(data:api_key)
    const apiKey = process.env.PAYMENT_API_KEY || process.env.PAYMENT_PASSWORD
    
    if (!apiKey) {
      console.error("Payment API key not configured")
      return NextResponse.json(
        { status: 0, error: "Server configuration error" },
        { status: 500 }
      )
    }

    // Verify signature according to TMWEasy specification: MD5(data:api_key)
    const signatureString = `${dataString}:${apiKey}`
    const expectedSignature = crypto
      .createHash("md5")
      .update(signatureString)
      .digest("hex")

    // Normalize signatures for comparison (lowercase, trim whitespace)
    const receivedSig = signature.toLowerCase().trim()
    const expectedSig = expectedSignature.toLowerCase()

    // Also try alternative formats as fallback (in case of API variations)
    const expectedSignatureAlt = crypto
      .createHash("md5")
      .update(`${dataString}${apiKey}`)
      .digest("hex")
    const expectedSigAlt = expectedSignatureAlt.toLowerCase()

    const expectedSignatureReversed = crypto
      .createHash("md5")
      .update(`${apiKey}:${dataString}`)
      .digest("hex")
    const expectedSigReversed = expectedSignatureReversed.toLowerCase()

    if (receivedSig !== expectedSig && receivedSig !== expectedSigAlt && receivedSig !== expectedSigReversed) {
      console.error("Invalid signature", {
        received: signature,
        receivedNormalized: receivedSig,
        expected: expectedSignature,
        expectedNormalized: expectedSig,
        expectedAlt: expectedSignatureAlt,
        expectedAltNormalized: expectedSigAlt,
        expectedReversed: expectedSignatureReversed,
        expectedReversedNormalized: expectedSigReversed,
        dataString: dataString.substring(0, 100) + (dataString.length > 100 ? "..." : ""),
        apiKeyLength: apiKey.length,
        signatureString: signatureString.substring(0, 100) + (signatureString.length > 100 ? "..." : ""),
      })
      return NextResponse.json(
        { status: 0, error: "Invalid signature" },
        { status: 401 }
      )
    }

    // Parse payment data
    let paymentData: {
      id_pay: string
      ref1: string
      amount_check: string
      amount: string
      date_pay: string
    }

    try {
      paymentData = JSON.parse(dataString)
    } catch (error) {
      console.error("Failed to parse payment data:", error)
      return NextResponse.json(
        { status: 0, error: "Invalid data format" },
        { status: 400 }
      )
    }

    const { id_pay, ref1, amount_check, amount, date_pay } = paymentData

    if (!id_pay || !ref1) {
      return NextResponse.json(
        { status: 0, error: "Missing required payment data" },
        { status: 400 }
      )
    }

    // Find transaction by id_pay (TMWEasy sends id_pay as the transaction reference)
    // Note: ref1 contains the user identifier (u_name)
    const transaction = await prisma.topupTransaction.findFirst({
      where: {
        refId: id_pay,
        status: "pending",
      },
      include: {
        user: {
          select: {
            id: true,
            point: true,
          },
        },
        package: {
          select: {
            coinAmount: true,
          },
        },
      },
    })

    if (!transaction) {
      console.error("Transaction not found", { id_pay, ref1 })
      return NextResponse.json(
        { status: 0, error: "Transaction not found" },
        { status: 404 }
      )
    }

    // Verify amount matches (amount_check is in satang, convert to baht)
    const expectedAmount = parseFloat(amount)
    const actualAmount = parseFloat(transaction.amountPaid.toString())
    
    // Allow small difference for floating point issues (0.01 baht = 1 satang)
    if (Math.abs(expectedAmount - actualAmount) > 0.01) {
      console.error("Amount mismatch", {
        expected: expectedAmount,
        actual: actualAmount,
        id_pay,
      })
      return NextResponse.json(
        { status: 0, error: "Amount mismatch" },
        { status: 400 }
      )
    }

    // Update transaction and add coins to user in a transaction
    await prisma.$transaction(async (tx) => {
      // Update transaction status to completed
      await tx.topupTransaction.update({
        where: { id: transaction.id },
        data: {
          status: "completed",
          updatedAt: new Date(),
        },
      })

      // Add coins to user's point balance
      await tx.userProfile.update({
        where: { id: transaction.userId },
        data: {
          point: {
            increment: transaction.coinsAdded,
          },
        },
      })
    })

    console.log("Payment webhook processed successfully", {
      id_pay,
      userId: transaction.userId,
      coinsAdded: transaction.coinsAdded,
      amount: actualAmount,
    })

    // Return success response as required by TMWEasy API
    return NextResponse.json({ status: 1 })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json(
      { status: 0, error: "Internal server error" },
      { status: 500 }
    )
  }
}

