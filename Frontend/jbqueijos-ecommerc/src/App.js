import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Register from './pages/Register';
import ProductManagement from './pages/ProductManagement';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectRoute';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route 
                  path="/cart" 
                  element={
                    <ProtectedRoute allowedRoles={['CLIENT']}>
                      <Cart />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/checkout" 
                  element={
                    <ProtectedRoute allowedRoles={['CLIENT']}>
                      <Checkout />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/product-management"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <ProductManagement />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;