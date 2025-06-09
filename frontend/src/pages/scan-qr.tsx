import { SEWA_AREAS } from "../types/volunteer"

export default function ScanQRPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">QR Scanner</h1>
        <p className="text-muted-foreground">Scan QR codes for volunteer check-in/check-out</p>
      </div>

      <div className="rounded-lg border p-8 text-center">
        <h3 className="text-lg font-semibold">QR Code Scanner</h3>
        <p className="text-muted-foreground mt-2">QR scanning functionality will be implemented here</p>

        <div className="mt-4">
          <p className="text-sm text-gray-500">Available Sewa Areas:</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-left">
            {Object.entries(SEWA_AREAS).map(([code, name]) => (
              <div key={code} className="text-sm">
                <span className="font-mono">{code}</span>: {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
