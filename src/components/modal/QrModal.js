import React, { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import CustomText from "../basics/CustomText";
import CustomButton from "../basics/CustomButton";

export default function QrModal({
    isOpen,
    onClose,
    assembly,
}) {
    const qrRef = useRef();

    if (!isOpen || !assembly) return null;

    const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/join/${assembly.id}` : "";

    const handleDownloadQr = () => {
        const canvas = qrRef.current.querySelector("canvas");
        if (!canvas) return;

        const pngUrl = canvas
            .toDataURL("image/png")
            .replace("image/png", "image/octet-stream");
        let downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `QR_${assembly.name || "Asamblea"}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl max-w-[400px] p-8 flex flex-col items-center gap-6 shadow-xl w-full">
                <CustomText variant="TitleL" className="font-bold text-[#0E3C42] text-center">
                    QR de Acceso
                </CustomText>

                <CustomText variant="bodyM" className="text-center text-[#333333]">
                    Acerca tu cámara para escanear el código y unirte a la asamblea.
                </CustomText>

                <div
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-center w-full"
                    ref={qrRef}
                >
                    <QRCodeCanvas
                        value={publicUrl}
                        size={200}
                        level={"H"}
                        includeMargin={true}
                    />
                </div>

                <div className="flex gap-3 w-full mt-4">
                    <CustomButton
                        variant="secondary"
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 shadow-md transition-all rounded-full border border-gray-200"
                    >
                        <CustomText variant="labelL" className="text-[#0E3C42] font-bold">
                            Cerrar
                        </CustomText>
                    </CustomButton>
                    <CustomButton
                        variant="primary"
                        onClick={handleDownloadQr}
                        className="flex-1 px-4 py-2.5 shadow-md transition-all rounded-full"
                    >
                        <CustomText variant="labelL" className="text-[#000000] font-bold">
                            Descargar
                        </CustomText>
                    </CustomButton>
                </div>
            </div>
        </div>
    );
}
