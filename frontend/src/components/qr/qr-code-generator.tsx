"use client"

import { useState, useRef } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { Download, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

interface QRCodeGeneratorProps {
  value: string
  volunteerName: string
  volunteerId: string
}

export function QRCodeGenerator({ value, volunteerName, volunteerId }: QRCodeGeneratorProps) {
  const [size, setSize] = useState(256)
  const qrRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Download QR code as PNG
  const downloadQRCode = () => {
    if (!qrRef.current) return

    const canvas = qrRef.current.querySelector("canvas")
    if (!canvas) return

    const dataUrl = canvas.toDataURL("image/png")
    const link = document.createElement("a")

    link.href = dataUrl
    link.download = `qrcode-${volunteerId}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "QR Code Downloaded",
      description: "The QR code has been downloaded as a PNG file",
    })
  }

  // Print QR code
  const printQRCode = () => {
    if (!qrRef.current) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const canvas = qrRef.current.querySelector("canvas")
    if (!canvas) return

    const dataUrl = canvas.toDataURL("image/png")

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code - ${volunteerName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 20px;
            }
            .container {
              max-width: 400px;
              margin: 0 auto;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            h2 {
              margin-bottom: 5px;
            }
            p {
              color: #666;
              margin-top: 5px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>${volunteerName}</h2>
            <p>Volunteer ID: ${volunteerId}</p>
            <img src="${dataUrl}" alt="QR Code" />
            <p>Scan this code to record attendance</p>
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()

    // Add a slight delay to ensure content is loaded before printing
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center p-6">
        <div ref={qrRef} className="mb-4 rounded-lg border bg-white p-4">
          <QRCodeCanvas
            value={value}
            size={size}
            level="H"
            includeMargin
            imageSettings={{
              src: "/placeholder.svg?height=50&width=50",
              height: 24,
              width: 24,
              excavate: true,
            }}
          />
        </div>

        <div className="mb-4 text-center">
          <h3 className="text-lg font-medium">{volunteerName}</h3>
          <p className="text-sm text-muted-foreground">ID: {volunteerId}</p>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={downloadQRCode}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" onClick={printQRCode}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
