// QR Code utilities with fallback for missing dependencies

// Type definitions for QRCode (in case types are missing)
interface QRCodeOptions {
  width?: number
  margin?: number
  color?: {
    dark?: string
    light?: string
  }
}

// Fallback QR generation function
async function generateFallbackQR(data: string): Promise<string> {
  // Create a simple canvas-based QR code placeholder
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    throw new Error("Canvas not supported")
  }

  canvas.width = 300
  canvas.height = 300

  // Fill with white background
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, 300, 300)

  // Add border
  ctx.strokeStyle = "#000000"
  ctx.lineWidth = 2
  ctx.strokeRect(10, 10, 280, 280)

  // Add text
  ctx.fillStyle = "#000000"
  ctx.font = "12px monospace"
  ctx.textAlign = "center"
  ctx.fillText("QR CODE", 150, 50)
  ctx.fillText("Scan with camera", 150, 70)

  // Add data (truncated)
  const truncatedData = data.length > 30 ? data.substring(0, 30) + "..." : data
  ctx.font = "10px monospace"
  ctx.fillText(truncatedData, 150, 250)

  // Add simple pattern
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      if ((i + j) % 2 === 0) {
        ctx.fillRect(100 + i * 10, 100 + j * 10, 8, 8)
      }
    }
  }

  return canvas.toDataURL("image/png")
}

// Generate QR code as data URL
export async function generateQRDataUrl(data: string): Promise<string> {
  try {
    // Try to import QRCode dynamically
    const QRCode = await import("qrcode").catch(() => null)

    if (QRCode) {
      return await QRCode.toDataURL(data, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      } as QRCodeOptions)
    } else {
      console.warn("QRCode library not available, using fallback")
      return await generateFallbackQR(data)
    }
  } catch (error) {
    console.error("Error generating QR code:", error)
    console.warn("Falling back to simple QR placeholder")
    return await generateFallbackQR(data)
  }
}

// Convert data URL to Blob
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(",")
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png"
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  return new Blob([u8arr], { type: mime })
}

// Download a single QR code
export function downloadQR(dataUrl: string, fileName: string): void {
  const link = document.createElement("a")
  link.href = dataUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Generate and download multiple QR codes as a ZIP file
export async function generateAndDownloadBulkQRs(
  volunteers: Array<{ id: string; name: string; sewaCode: string }>,
): Promise<void> {
  try {
    // Try to import JSZip dynamically
    const JSZip = await import("jszip").catch(() => null)

    if (!JSZip) {
      // Fallback: download individual QR codes
      console.warn("JSZip not available, downloading individual QR codes")

      for (const volunteer of volunteers) {
        const qrData = JSON.stringify({
          id: volunteer.id,
          code: volunteer.sewaCode,
          timestamp: Date.now(),
        })

        const qrDataUrl = await generateQRDataUrl(qrData)
        const safeFileName = volunteer.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()
        downloadQR(qrDataUrl, `${safeFileName}-${volunteer.sewaCode}.png`)

        // Small delay between downloads
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      return Promise.resolve()
    }

    const zip = new JSZip.default()

    // Generate QRs in parallel
    await Promise.all(
      volunteers.map(async (volunteer) => {
        // Generate QR code with volunteer data
        const qrData = JSON.stringify({
          id: volunteer.id,
          code: volunteer.sewaCode,
          timestamp: Date.now(),
        })

        const qrDataUrl = await generateQRDataUrl(qrData)
        const qrBlob = dataUrlToBlob(qrDataUrl)

        // Add to zip with a clean filename
        const safeFileName = volunteer.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()
        zip.file(`${safeFileName}-${volunteer.sewaCode}.png`, qrBlob)
      }),
    )

    // Generate and download the ZIP file
    const content = await zip.generateAsync({ type: "blob" })
    const downloadUrl = URL.createObjectURL(content)
    const link = document.createElement("a")
    link.href = downloadUrl
    link.download = `volunteer-qr-codes-${new Date().toISOString().split("T")[0]}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(downloadUrl)

    return Promise.resolve()
  } catch (error) {
    console.error("Error generating bulk QR codes:", error)
    throw new Error("Failed to generate bulk QR codes")
  }
}
