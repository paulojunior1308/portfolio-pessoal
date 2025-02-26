import { useState, useRef } from "react";

export default function CameraCapture({ onCapture }: { onCapture: (imageUrl: string) => void }) {
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [photo, setPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const constraints = {
        video: { facingMode: isFrontCamera ? "user" : "environment" },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Erro ao acessar a câmera:", error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    // Definir tamanho do canvas igual ao vídeo
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    // Desenhar a imagem no canvas
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Obter a URL da imagem capturada
    const imageUrl = canvas.toDataURL("image/png");
    setPhoto(imageUrl);
    onCapture(imageUrl);
    stopCamera(); // Desliga a câmera após a captura
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {photo ? (
        <img src={photo} alt="Foto capturada" className="w-full rounded-lg shadow-md" />
      ) : isCameraActive ? (
        <video ref={videoRef} autoPlay className="w-full rounded-lg shadow-md" />
      ) : (
        <button onClick={startCamera} className="btn btn-primary">
          Abrir Câmera
        </button>
      )}

      {isCameraActive && (
        <div className="flex gap-4">
          <button onClick={capturePhoto} className="btn btn-success">
            Tirar Foto
          </button>
          <button onClick={() => setIsFrontCamera(!isFrontCamera)} className="btn btn-secondary">
            Alternar Câmera
          </button>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
