import { useState } from 'react';
import { createShareToken } from '../utils/shareToken';
import { Copy, Check } from 'lucide-react';

interface ShareProjectLinkProps {
  projectId: string;
}

export default function ShareProjectLink({ projectId }: ShareProjectLinkProps) {
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateLink = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const token = await createShareToken(projectId);
      const url = `${window.location.origin}/dashboard/${projectId}?token=${token}`;
      setShareUrl(url);
    } catch (error) {
      console.error('Erro ao gerar link:', error);
      alert('Não foi possível gerar o link de compartilhamento');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar link:', error);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {!shareUrl ? (
        <button
          onClick={generateLink}
          disabled={loading || !projectId}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/20 transition-colors disabled:opacity-50"
        >
          {loading ? 'Gerando...' : 'Gerar Link de Compartilhamento'}
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center justify-center p-2 border border-transparent text-sm font-medium rounded-lg text-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/20 transition-colors"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
      )}
    </div>
  );
}