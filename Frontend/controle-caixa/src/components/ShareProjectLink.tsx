import React, { useState } from 'react';
import { generateShareToken, saveShareToken } from '../lib/tokenUtils';

interface ShareProjectLinkProps {
  projectId: string;
}

export const ShareProjectLink: React.FC<ShareProjectLinkProps> = ({ projectId }) => {
  const [shareUrl, setShareUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const generateLink = async () => {
    if (!projectId) {
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
      alert('Link copiado para a área de transferência!');
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
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
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
                className="w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 transition-colors text-sm font-medium"
              >
                Copiar Link
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