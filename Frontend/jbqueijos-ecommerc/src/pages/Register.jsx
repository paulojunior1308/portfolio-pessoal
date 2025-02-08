import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import '../styles/Register.css';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    cnpj: '',
    email: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await setDoc(doc(db, 'companies', user.uid), {
        companyName: formData.companyName,
        cnpj: formData.cnpj,
        email: formData.email,
        phone: formData.phone,
        createdAt: new Date().toISOString()
      });

      navigate('/catalog');
    } catch (err) {
      setError('Erro ao criar conta. Por favor, tente novamente.');
      console.error(err);
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Cadastro de Empresa</h2>
      {error && <p className="register-error">{error}</p>}
      <form onSubmit={handleSubmit} className="register-form">
        <div>
          <label className="form-group">Nome da Empresa</label>
          <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required />
        </div>
        <div>
          <label className="form-group">CNPJ</label>
          <input type="text" name="cnpj" value={formData.cnpj} onChange={handleChange} required />
        </div>
        <div>
          <label className="form-group">E-mail</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div>
          <label className="form-group">Telefone</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
        </div>
        <div>
          <label className="form-group">Senha</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <button type="submit" className="register-button">Cadastrar</button>
      </form>
    </div>
  );
}

export default Register;
