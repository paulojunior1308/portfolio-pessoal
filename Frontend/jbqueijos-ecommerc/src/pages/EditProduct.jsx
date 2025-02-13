import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { updateProduct } from '../services/productService';
import '../styles/EditProduct.css';

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    unit: '',
    imageUrl: '',
    description: '',
    quantity: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            name: data.name,
            brand: data.brand,
            price: data.price.toString(),
            unit: data.unit,
            imageUrl: data.imageUrl,
            description: data.description,
            quantity: data.quantity.toString()
          });
        } else {
          setError('Produto não encontrado');
        }
      } catch (err) {
        setError('Erro ao carregar produto');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const productData = {
        name: formData.name,
        brand: formData.brand,
        price: parseFloat(formData.price),
        unit: formData.unit,
        imageUrl: formData.imageUrl,
        description: formData.description,
        quantity: parseInt(formData.quantity, 10)
      };

      await updateProduct(id, productData);
      navigate('/edit-products');
    } catch (err) {
      setError('Erro ao salvar as alterações');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Carregando produto...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => navigate('/edit-products')} className="back-button">
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="edit-product-container">
      <h2 className="edit-product-title">Editar Produto</h2>
      
      <form onSubmit={handleSubmit} className="edit-form">
        <div>
          <label className="form-label">Nome do Produto</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">Marca</label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-grid">
          <div>
            <label className="form-label">Preço (R$)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Unidade</label>
            <input
              type="text"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              required
              placeholder="kg, unit, etc"
              className="form-input"
            />
          </div>
        </div>

        <div>
          <label className="form-label">Quantidade em Estoque</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
            min="0"
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">URL da Imagem</label>
          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">Descrição</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            className="form-textarea"
          />
        </div>

        <div className="button-container">
          <button
            type="button"
            onClick={() => navigate('/edit-products')}
            className="cancel-button"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="save-button"
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProduct;