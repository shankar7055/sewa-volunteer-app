"use client"

import { QrCode } from "lucide-react"
import { useState } from "react"

import { Button } from "./ui/button"
import { useToast } from "./ui/use-toast"

import { volunteersApi } from "../lib/api"

interface QRCodeButtonProps {
  volunteerId: string
  volunteerCode: string
  size?: "default" | "sm" | "lg" | "icon"
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function QRCodeButton({ volunteerId, volunteerCode, size = "sm", variant = "outline" }: QRCodeButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleGenerateQR = async () => {
    try {
      setIsGenerating(true)
      const dataUrl = await volunteersApi.generateQR(volunteerId)

      // Create download link
      const fileName = `volunteer-${volunteerCode}-qr.png`
      const link = document.createElement("a")
      link.href = dataUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Success",
        description: "QR code downloaded",
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

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleGenerateQR}
      disabled={isGenerating}
      className={size === "icon" ? "h-7 px-2" : ""}
    >
      <QrCode className={size === "icon" ? "h-4 w-4" : "mr-2 h-4 w-4"} />
      {size !== "icon" && (isGenerating ? "Generating..." : "QR Code")}
    </Button>
  )
}
