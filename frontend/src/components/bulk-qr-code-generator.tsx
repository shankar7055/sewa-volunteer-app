"use client"

import { QrCode } from "lucide-react"
import { useState } from "react"

import { Button } from "./ui/button"
import { useToast } from "./ui/use-toast"

import { generateAndDownloadBulkQRs } from "../lib/qr-utils"

interface BulkQRGeneratorProps {
  volunteers: Array<{ id: string; name: string; sewaCode: string }>
  size?: "default" | "sm" | "lg" | "icon"
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function BulkQRGenerator({ volunteers, size = "sm", variant = "outline" }: BulkQRGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleGenerateBulkQRs = async () => {
    if (volunteers.length === 0) {
      toast({
        variant: "destructive",
        title: "No volunteers selected",
        description: "Please select at least one volunteer to generate QR codes",
      })
      return
    }

    try {
      setIsGenerating(true)

      // Generate and download QR codes
      await generateAndDownloadBulkQRs(volunteers)

      toast({
        title: "Success",
        description: `Generated QR codes for ${volunteers.length} volunteers`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate QR codes",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleGenerateBulkQRs}
      disabled={isGenerating || volunteers.length === 0}
    >
      <QrCode className="mr-2 h-4 w-4" />
      {isGenerating ? "Generating..." : `Generate QR Codes (${volunteers.length})`}
    </Button>
  )
}
