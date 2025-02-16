import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductList from './pages/admin/ProductList';
import ProductForm from './pages/admin/ProductForm';
import Footer from './components/Footer';
import { useStore } from './store/useStore';
import { initializeAuth } from './lib/firebase/auth';

// Componente para rotas protegidas
const PrivateRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user } = useStore();
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

function App() {
  const { setUser } = useStore();

  useEffect(() => {
    // Inicializar listener de autenticação
    const unsubscribe = initializeAuth(setUser);
    return () => unsubscribe();
  }, [setUser]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/cart" element={<Cart />} />
            <Route
              path="/checkout"
              element={
                <PrivateRoute>
                  <Checkout />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <PrivateRoute adminOnly>
                  <ProductList />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/products/new"
              element={
                <PrivateRoute adminOnly>
                  <ProductForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/products/edit/:id"
              element={
                <PrivateRoute adminOnly>
                  <ProductForm />
                </PrivateRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-center" />
      </div>
    </Router>
  );
}

export default App;