import { useState, useRef } from "react";

export default function ProductImagePicker() {
  const [product, setProduct] = useState<{ image: string | null }>({
    image: null,
  });

  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Inicia a câmera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setCameraActive(true);
    } catch (error) {
      console.error("Erro ao acessar a câmera:", error);
    }
  };

  // Captura a imagem da câmera
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageUrl = canvasRef.current.toDataURL("image/png");
        setProduct({ ...product, image: imageUrl });
        stopCamera();
      }
    }
  };

  // Para a câmera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setCameraActive(false);
  };

  // Alternar entre câmera frontal e traseira
  const toggleCamera = async () => {
    stopCamera();
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === "videoinput");
      
      if (videoDevices.length > 1) {
        const currentDeviceId = videoRef.current?.srcObject
          ? (videoRef.current.srcObject as MediaStream).getVideoTracks()[0].getSettings().deviceId
          : "";
        const nextDevice = videoDevices.find((device) => device.deviceId !== currentDeviceId);
        
        if (nextDevice) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: nextDevice.deviceId },
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          streamRef.current = stream;
        }
      }
    } catch (error) {
      console.error("Erro ao alternar câmera:", error);
    }
  };

  return (
    <div className="p-4">
      <label className="block text-sm font-medium text-gray-700">
        Imagem do Produto
      </label>

      {product.image ? (
        <img
          src={product.image}
          alt="Produto"
          className="w-48 h-48 object-cover rounded-md mt-2"
        />
      ) : (
        <p className="text-gray-500 text-sm">Nenhuma imagem selecionada</p>
      )}

      <div className="mt-4 space-x-2">
        {/* Botão para abrir a câmera */}
        <button type="button" onClick={startCamera} className="btn btn-secondary">
          Tirar Foto
        </button>

        {/* Input escondido para escolher do rolo de fotos */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                setProduct({ ...product, image: event.target?.result as string });
              };
              reader.readAsDataURL(file);
            }
          }}
          className="hidden"
          id="fileInput"
        />
        <button
          type="button"
          onClick={() => document.getElementById("fileInput")?.click()}
          className="btn btn-secondary"
        >
          Escolher do Rolo de Fotos
        </button>
      </div>

      {/* Elementos para câmera */}
      {cameraActive && (
        <div className="mt-4">
          <video ref={videoRef} autoPlay className="w-full max-w-sm border rounded-md" />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <div className="mt-2 space-x-2">
            <button type="button" onClick={captureImage} className="btn btn-primary">
              Capturar Imagem
            </button>
            <button type="button" onClick={toggleCamera} className="btn btn-primary">
              Alternar Câmera
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
