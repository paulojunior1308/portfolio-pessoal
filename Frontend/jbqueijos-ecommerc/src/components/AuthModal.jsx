import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import '../styles/AuthModal.css';

function AuthModal({ isOpen, onClose, message }) {
    
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <div className='auth-container'>
            <div className='auth-modal'>
                <div className='auth-modal-header'>
                    <h3 className='auth-modal-title'>Autenticação Necessária</h3>
                    <button 
                        onClick={onClose}
                        className='auth-modal-close-button'
                    >
                        <X className='auth-modal-close-icon'/>
                    </button>
                </div>

                <p className='auth-modal-message'>{message}</p>

                <div className='auth-modal-button-container'>
                    <button 
                        onClick={() => navigate('/login')}
                        className='auth-modal-button'
                    >
                        Fazer Login
                    </button>
                    <button 
                        onClick={() => navigate('/register')}
                        className='auth-modal-button-register'
                    >
                        Criar Conta
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AuthModal;