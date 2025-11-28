"use client"

import { useState } from "react"
import Image from "next/image"
import { Check, CreditCard, Wallet, Smartphone, Building2, Sparkles, TrendingUp, QrCode } from "lucide-react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCoins } from "@fortawesome/free-solid-svg-icons"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

export interface TopupPackage {
  id: string
  price: number
  coins: number
  bonus?: number
  popular?: boolean
}

interface PaymentMethod {
  id: string
  name: string
  icon: React.ReactNode
  description: string
}

interface TopupFormProps {
  packages: TopupPackage[]
  initialUserPoints?: number | null
}

const paymentMethods: PaymentMethod[] = [
  // {
  //   id: "credit-card",
  //   name: "บัตรเครดิต/เดบิต",
  //   icon: <CreditCard className="h-5 w-5" />,
  //   description: "Visa, Mastercard, JCB",
  // },
  {
    id: "promptpay",
    name: "พร้อมเพย์",
    icon: (
      <Image
        src="/logo/promptpay.png"
        alt="PromptPay"
        width={200}
        height={65}
        className="h-12 sm:h-16 md:h-20 lg:h-24 w-auto object-contain rounded-lg fil bg-white"
        priority
      />
    ),
    description: "โอนเงินผ่านพร้อมเพย์",
  },
  // {
  //   id: "true-wallet",
  //   name: "ทรูวอลเล็ต",
  //   icon: <Wallet className="h-5 w-5" />,
  //   description: "TrueMoney Wallet",
  // },
  // {
  //   id: "bank-transfer",
  //   name: "โอนเงินผ่านธนาคาร",
  //   icon: <Building2 className="h-5 w-5" />,
  //   description: "โอนเงินผ่านธนาคาร",
  // },
]

export function TopupForm({ packages, initialUserPoints = null }: TopupFormProps) {
  // Default to first package with bonus, or first package if none have bonus
  const defaultPackageId = packages.find((pkg) => pkg.bonus)?.id || packages[0]?.id || ""
  const [selectedPackage, setSelectedPackage] = useState<string>(defaultPackageId)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("")
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [qrCodeImageUrl, setQrCodeImageUrl] = useState<string>("")
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const selectedPackageData = packages.find((pkg) => pkg.id === selectedPackage)
  const totalCoins = selectedPackageData
    ? selectedPackageData.coins + (selectedPackageData.bonus || 0)
    : 0

  const handlePurchase = async () => {
    if (!selectedPaymentMethod) {
      toast.error("กรุณาเลือกวิธีการชำระเงิน")
      return
    }

    if (!selectedPackageData) {
      toast.error("กรุณาเลือกแพ็กเกจ")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/topup/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId: selectedPackageData.id,
          amount: selectedPackageData.price,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการสร้าง QR Code")
      }

      if (data.success && data.qrCodeUrl) {
        setQrCodeImageUrl(data.qrCodeUrl)
        setQrCodeUrl(data.qrCodeUrl)
        setQrDialogOpen(true)
        toast.success("QR Code พร้อมสำหรับการชำระเงิน")
      } else {
        throw new Error("ไม่สามารถสร้าง QR Code ได้")
      }
    } catch (error) {
      console.error("Error creating payment:", error)
      toast.error(
        error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการสร้าง QR Code"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto max-w-6xl px-4 py-8 sm:py-10 lg:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">เติมเงิน</h1>
          <p className="text-muted-foreground">
            เลือกแพ็กเกจที่ต้องการและวิธีการชำระเงิน
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Package Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faCoins} className="text-yellow-600 dark:text-yellow-400 text-xs mr-1" />
                  เลือกแพ็กเกจ
                </CardTitle>
                <CardDescription>
                  เลือกจำนวนเงินที่ต้องการเติม
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedPackage}
                  onValueChange={setSelectedPackage}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                >
                  {packages.map((pkg) => {
                    const isSelected = selectedPackage === pkg.id
                    const totalCoinsForPkg = pkg.coins + (pkg.bonus || 0)
                    return (
                      <div key={pkg.id}>
                        <RadioGroupItem
                          value={pkg.id}
                          id={pkg.id}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={pkg.id}
                          className={`
                            relative flex flex-col rounded-xl border-2 p-3 cursor-pointer transition-all
                            ${isSelected 
                              ? "border-primary bg-primary/5 shadow-md scale-[1.02]" 
                              : "border-muted bg-card hover:border-primary/50 hover:bg-accent/50"
                            }
                            ${pkg.popular ? "ring-2 ring-yellow-500/20" : ""}
                          `}
                        >
                          {pkg.popular && (
                            <div className="absolute -top-2 -right-2">
                              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[10px] px-1.5 py-0.5">
                                <Sparkles className="h-2.5 w-2.5 mr-1" />
                                ยอดนิยม
                              </Badge>
                            </div>
                          )}
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <FontAwesomeIcon 
                                icon={faCoins} 
                                className={`text-xs mr-1 ${isSelected ? "text-yellow-600 dark:text-yellow-400" : "text-muted-foreground"}`} 
                              />
                              <span className={`text-xs font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                                {pkg.coins.toLocaleString()}
                              </span>
                            </div>
                            {pkg.bonus && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-700">
                                +{pkg.bonus}
                              </Badge>
                            )}
                          </div>
                          <div className="text-lg font-bold text-foreground mb-1">
                            {pkg.price.toLocaleString()}฿
                          </div>
                          {pkg.bonus && (
                            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              รวม {totalCoinsForPkg.toLocaleString()} เหรียญ
                            </div>
                          )}
                        </Label>
                      </div>
                    )
                  })}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>วิธีการชำระเงิน</CardTitle>
                <CardDescription>
                  เลือกวิธีการชำระเงินที่ต้องการ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedPaymentMethod}
                  onValueChange={setSelectedPaymentMethod}
                  className="grid grid-cols-1 gap-2.5"
                >
                  {paymentMethods.map((method) => {
                    const isSelected = selectedPaymentMethod === method.id
                    return (
                      <div key={method.id}>
                        <RadioGroupItem
                          value={method.id}
                          id={method.id}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={method.id}
                          className={`
                            flex flex-col items-center gap-2 sm:gap-3 rounded-lg border-2 p-3 sm:p-4 cursor-pointer transition-all text-center
                            ${isSelected 
                              ? "border-primary bg-primary/5 shadow-sm" 
                              : "border-muted bg-card hover:border-primary/50 hover:bg-accent/50"
                            }
                          `}
                        >
                          <div className={`flex-shrink-0 flex items-center justify-center ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                            {method.icon}
                          </div>
                          <div className="flex-1 w-full">
                            <div className={`text-xs font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                              {method.name}
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              {method.description}
                            </div>
                          </div>
                        </Label>
                      </div>
                    )
                  })}
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <FontAwesomeIcon icon={faCoins} className="text-primary text-xs mr-1" />
                  </div>
                  สรุปคำสั่งซื้อ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedPackageData && (
                  <>
                    {/* Package Info */}
                    <div className="space-y-3 p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          แพ็กเกจ
                        </span>
                        <span className="font-semibold text-foreground">
                          {selectedPackageData.price.toLocaleString()} ฿
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                          <FontAwesomeIcon icon={faCoins} className="text-yellow-600 dark:text-yellow-400 text-xs mr-1" />
                          เหรียญพื้นฐาน
                        </span>
                        <span className="font-medium text-foreground">
                          {selectedPackageData.coins.toLocaleString()}
                        </span>
                      </div>
                      {selectedPackageData.bonus && (
                        <div className="flex items-center justify-between pt-1 border-t border-border/50">
                          <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                            โบนัสพิเศษ
                          </span>
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                            +{selectedPackageData.bonus}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Total Coins */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          รวมเหรียญที่ได้รับ
                        </span>
                        <div className="flex items-center gap-1.5">
                          <FontAwesomeIcon icon={faCoins} className="text-yellow-600 dark:text-yellow-400 text-xs mr-1" />
                          <span className="text-2xl font-bold text-foreground">
                            {totalCoins.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-yellow-500/20">
                        <span className="text-xs text-muted-foreground">ยอดชำระ</span>
                        <span className="text-base font-semibold text-foreground">
                          {selectedPackageData.price.toLocaleString()} บาท
                        </span>
                      </div>
                    </div>

                    {/* Payment Method */}
                    {selectedPaymentMethod && (
                      <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded-full bg-green-500/20">
                            <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-muted-foreground mb-0.5">วิธีการชำระเงิน</div>
                            <div className="text-sm font-medium text-foreground truncate">
                              {paymentMethods.find((m) => m.id === selectedPaymentMethod)?.name}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Purchase Button */}
                    <Button
                      onClick={handlePurchase}
                      className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                      size="lg"
                      disabled={!selectedPaymentMethod || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          กำลังสร้าง QR Code...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faCoins} className="text-yellow-600 dark:text-yellow-400 text-xs mr-1" />
                          ยืนยันการเติมเงิน
                        </>
                      )}
                    </Button>

                    <div className="flex items-start gap-2 p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
                      <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        การเติมเงินจะดำเนินการทันทีหลังจากยืนยัน
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              สแกน QR Code เพื่อชำระเงิน
            </DialogTitle>
            <DialogDescription>
              สแกน QR Code นี้ด้วยแอปพลิเคชันพร้อมเพย์เพื่อชำระเงิน
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {qrCodeImageUrl && (
              <div className="relative w-full max-w-xs p-4 bg-white rounded-lg border-2 border-primary/20">
                <Image
                  src={qrCodeImageUrl}
                  alt="QR Code for payment"
                  width={300}
                  height={300}
                  className="w-full h-auto"
                  unoptimized
                />
              </div>
            )}
            <div className="w-full space-y-2">
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-sm font-medium mb-1">ยอดชำระ</p>
                <p className="text-2xl font-bold text-primary">
                  {selectedPackageData?.price.toLocaleString()} บาท
                </p>
              </div>
              {qrCodeUrl && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(qrCodeUrl)
                    toast.success("คัดลอกลิงก์ QR Code แล้ว")
                  }}
                >
                  คัดลอกลิงก์ QR Code
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              หลังจากชำระเงินเสร็จสิ้น ระบบจะอัปเดตเหรียญของคุณโดยอัตโนมัติ
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

