import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import '../styles/Profile.css';

function Profile() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    companyName: user?.companyName || '',
    cnpj: user?.cnpj || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const userRef = doc(db, 'companies', user.uid);
      await updateDoc(userRef, {
        companyName: formData.companyName,
        cnpj: formData.cnpj,
        phone: formData.phone
      });
      
      setSuccess(true);
    } catch (err) {
      setError('Erro ao atualizar informações. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container-conta">
      <h2 className="profile-title">Minha Conta</h2>
      
      {success && (
        <div className="success-message">
          Informações atualizadas com sucesso!
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label>Nome da Empresa</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>CNPJ</label>
          <input
            type="text"
            name="cnpj"
            value={formData.cnpj}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>E-mail</label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="disabled-input"
          />
          <small>O e-mail não pode ser alterado</small>
        </div>

        <div className="form-group">
          <label>Telefone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <button 
          type="submit" 
          className="save-button"
          disabled={loading}
        >
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  );
}

export default Profile;