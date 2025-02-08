import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addProduct } from '../services/productService';
import '../styles/ProductManagement.css';

const initialFormData = {
  name: '',
  brand: '',
  price: '',
  unit: '',
  imageUrl: '',
  description: '',
  quantity: ''
};

function ProductManagement() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState(null);
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
    setError(null);
    setLoading(true);

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

      await addProduct(productData);
      navigate('/catalog');
    } catch (err) {
      setError('Error saving product. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-management">
      <h2 className="title-management">Product Management</h2>
      {error && <p className="error-management">{error}</p>}
      
      <form onSubmit={handleSubmit} className="form-management">
        <div>
          <label className='label-management'>Product Name</label>
          <input className='input-management' type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>

        <div>
          <label className='label-management'>Brand</label>
          <input className='input-management' type="text" name="brand" value={formData.brand} onChange={handleChange} required />
        </div>

        <div className="grid-management">
          <div>
            <label className='label-management'>Price (R$)</label>
            <input className='input-management' type="number" name="price" value={formData.price} onChange={handleChange} required step="0.01" min="0" />
          </div>

          <div>
            <label className='label-management'>Unit</label>
            <input className='input-management' type="text" name="unit" value={formData.unit} onChange={handleChange} required placeholder="kg, unit, etc" />
          </div>
        </div>

        <div>
          <label className='label-management'>Quantity in Stock</label>
          <input className='input-management' type="number" name="quantity" value={formData.quantity} onChange={handleChange} required min="0" />
        </div>

        <div>
          <label className='label-management'>Image URL</label>
          <input className='input-management' type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} required />
        </div>

        <div>
          <label className='label-management'>Description</label>
          <textarea className="description-management" name="description" value={formData.description} onChange={handleChange} required rows={3} />
        </div>

        <button type="submit" disabled={loading} className="submit-button-management">
          {loading ? 'Saving...' : 'Save Product'}
        </button>
      </form>
    </div>
  );
}

export default ProductManagement;
