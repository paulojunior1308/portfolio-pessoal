import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import '../styles/Login.css';

function Login(){
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, formData.email, formData.password);
            navigate('/catalog');
        } catch (err) {
            setError('Erro ao fazer login. Por favor, tente novamente.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='login-container'>
            <div className='login-content'>
                <h2 className='login-title'>Login</h2>
                {error && (
                    <div className='error-message'>{error}</div>
                )}

                <form onSubmit={handleSubmit} className='login-form'>
                    <div>
                        <label className='login-label'>Email</label>
                        <input
                            type='email'
                            name='email'
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className='login-email'
                        />
                    </div>

                    <div>
                        <label className='login-label'>Senha</label>
                        <input
                            type='password'
                            name='password'
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className='login-password'
                        />
                    </div>

                    <button
                        type='submit'
                        disabled={loading}
                        className='login-button'
                    >
                        {loading ? 'Carregando...' : 'Entrar'}
                    </button>
                </form>

                <div className='login-register'>
                    <p className='login-register-text'>
                        Ainda não possui uma conta?{' '}
                        <Link to='/register' className='login-register-link'>
                            Cadastra-se aqui
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;