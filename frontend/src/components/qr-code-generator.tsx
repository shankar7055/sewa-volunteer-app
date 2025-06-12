"use client"

import { Download, QrCode } from "lucide-react"
import { useState } from "react"

import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { useToast } from "./ui/use-toast"

import { volunteersApi } from "../lib/api"
import { downloadQR } from "../lib/qr-utils"

interface QRCodeGeneratorProps {
  volunteerId: string
  volunteerName: string
  volunteerCode: string
  variant?: "button" | "icon"
  size?: "sm" | "md" | "lg"
}

export function QRCodeGenerator({
  volunteerId,
  volunteerName,
  volunteerCode,
  variant = "button",
  size = "md",
}: QRCodeGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const { toast } = useToast()

  const handleGenerateQR = async () => {
    try {
      setIsGenerating(true)

      // Generate QR code
      const dataUrl = await volunteersApi.generateQR(volunteerId)
      setQrCodeDataUrl(dataUrl)
      setShowDialog(true)

      toast({
        title: "Success",
        description: "QR code generated successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate QR code",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!qrCodeDataUrl) return

    const fileName = `volunteer-${volunteerCode}-qr.png`
    downloadQR(qrCodeDataUrl, fileName)

    toast({
      title: "Success",
      description: "QR code downloaded successfully",
    })
  }

  const buttonSizes = {
    sm: "h-7 px-2 text-xs",
    md: "h-9 px-3 text-sm",
    lg: "h-11 px-8 text-base",
  }

  if (variant === "icon") {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          className={buttonSizes[size]}
          onClick={handleGenerateQR}
          disabled={isGenerating}
        >
          <QrCode className="h-4 w-4" />
        </Button>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>QR Code - {volunteerName}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center space-y-4 p-4">
              {qrCodeDataUrl && (
                <div className="border p-4 rounded-lg bg-white">
                  <img
                    src={qrCodeDataUrl || "/placeholder.svg"}
                    alt="Volunteer QR Code"
                    className="w-64 h-64 object-contain"
                  />
                </div>
              )}
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-500">
                  QR Code for: <span className="font-medium">{volunteerName}</span>
                </p>
                <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{volunteerCode}</p>
              </div>
              <Button onClick={handleDownload} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download QR Code
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <>
      <Button
        variant="outline"
          size={size === "md" ? "default" : size}
        onClick={handleGenerateQR}
        disabled={isGenerating}
        className={buttonSizes[size]}
      >
        <QrCode className="mr-2 h-4 w-4" />
        {isGenerating ? "Generating..." : "Generate QR"}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code - {volunteerName}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4 p-4">
            {qrCodeDataUrl && (
              <div className="border p-4 rounded-lg bg-white">
                <img
                  src={qrCodeDataUrl || "/placeholder.svg"}
                  alt="Volunteer QR Code"
                  className="w-64 h-64 object-contain"
                />
              </div>
            )}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-500">
                QR Code for: <span className="font-medium">{volunteerName}</span>
              </p>
              <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{volunteerCode}</p>
            </div>
            <Button onClick={handleDownload} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
