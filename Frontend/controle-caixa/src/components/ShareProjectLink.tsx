import React, { useState } from 'react';
import { generateShareToken, saveShareToken } from '../lib/tokenUtils';
import { Copy, Share2, X } from 'lucide-react';

interface ShareProjectLinkProps {
  projectId: string;
}

export const ShareProjectLink: React.FC<ShareProjectLinkProps> = ({ projectId }) => {
  const [shareUrl, setShareUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const generateLink = async () => {
    if (!projectId?.trim()) {
      setError('Selecione um projeto primeiro');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const token = generateShareToken();
      const success = await saveShareToken(projectId, token);
      
      if (success) {
        const url = `${window.location.origin}/dashboard/${projectId}?token=${token}`;
        setShareUrl(url);
        setShowModal(true);
      } else {
        setError('Erro ao gerar link de compartilhamento');
      }
    } catch (err) {
      setError('Erro ao gerar link de compartilhamento');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar link:', err);
    }
  };

  return (
    <>
      <button
        onClick={generateLink}
        disabled={isLoading}
        className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/20 disabled:opacity-50 transition-colors"
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <Share2 className="w-4 h-4 mr-2" />
        )}
        {isLoading ? 'Gerando...' : 'Compartilhar Projeto'}
      </button>

      {error && !showModal && (
        <p className="mt-2 text-sm text-red-600 text-center sm:text-left">{error}</p>
      )}

      {/* Modal de compartilhamento */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 m-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Link de Compartilhamento</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 p-2 border rounded-lg bg-gray-50 text-sm"
              />
              <button
                onClick={copyToClipboard}
                className={`w-full sm:w-auto px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors text-sm font-medium flex items-center justify-center gap-2
                  ${isCopied 
                    ? 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-400' 
                    : 'bg-primary text-white hover:bg-primary/90 focus:ring-primary/20'
                  }`}
              >
                {isCopied ? (
                  <>
                    <span>Copiado!</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    <span>Copiar Link</span>
                    <Copy className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <p className="text-sm text-gray-500">
              Este link permite acesso direto ao dashboard do projeto sem necessidade de login.
              Por segurança, compartilhe apenas com pessoas autorizadas.
            </p>

            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};