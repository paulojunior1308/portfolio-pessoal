import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';
import { createUser } from '../lib/firebase/auth';

export default function Register() {
  const navigate = useNavigate();
  const { setUser } = useStore();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;

    try {
      const userData = {
        name,
        email,
        phone,
        address,
      };

      // Cria o usuário no Firebase Authentication e no Firestore
      const user = await createUser(email, password, userData);

      // Atualiza o estado global do usuário
      setUser({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
      });

      toast.success('Cadastro realizado com sucesso!');
      navigate('/profile'); // Redireciona para a página de perfil
    } catch (error) {
      console.error(error);
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
                name="name"
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
                name="email"
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
                name="password"
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
                name="phone"
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
                name="address"
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