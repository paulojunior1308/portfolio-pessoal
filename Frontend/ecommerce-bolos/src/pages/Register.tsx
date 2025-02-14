import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const { setUser } = useStore();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement Firebase authentication
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay
      setUser({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        address: 'Rua Exemplo, 123',
        phone: '(11) 98765-4321'
      });
      toast.success('Cadastro realizado com sucesso!');
      navigate('/profile');
    } catch (error) {
      toast.error('Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-3xl font-playfair text-center">Criar Conta</h1>
          <p className="mt-2 text-center text-gray-600">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-wine hover:underline">
              Faça login
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome
              </label>
              <input
                type="text"
                id="name"
                required
                className="input"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                required
                className="input"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                type="password"
                id="password"
                required
                className="input"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Telefone
              </label>
              <input
                type="tel"
                id="phone"
                required
                className="input"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Endereço
              </label>
              <input
                type="text"
                id="address"
                required
                className="input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>
      </div>
    </div>
  );
}