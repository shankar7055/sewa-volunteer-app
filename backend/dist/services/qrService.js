import QRCode from "qrcode";
// Generate QR code as data URL
export const generateQRCode = async (data) => {
    try {
        const qrCodeDataUrl = await QRCode.toDataURL(data, {
            errorCorrectionLevel: "H",
            margin: 1,
            width: 300,
        });
        return qrCodeDataUrl;
    }
    catch (error) {
        console.error("Error generating QR code:", error);
        throw new Error("Failed to generate QR code");
    }
};
//# sourceMappingURL=qrService.js.map