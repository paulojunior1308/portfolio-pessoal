import { useState } from "react";
import { useStore } from "../store/useStore";
import toast from "react-hot-toast";
import { db } from "../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function Profile() {
  const { user, updateUser } = useStore();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!user?.uid) {
      toast.error("Usuário não autenticado.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const updatedData: Record<string, any> = {};

      ["name", "phone", "address"].forEach((field) => {
        const value = formData.get(field)?.toString().trim();
        if (value) updatedData[field] = value;
      });

      if (Object.keys(updatedData).length === 0) {
        toast.error("Nenhuma alteração detectada.");
        setLoading(false);
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, updatedData);

      updateUser({ ...user, ...updatedData });

      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error("Erro ao atualizar perfil. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-playfair mb-4">Minha Conta</h1>
        <p className="text-gray-600">Faça login para acessar seu perfil.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-playfair mb-8">Minha Conta</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="font-playfair text-xl mb-6">Dados Pessoais</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nome
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={user.name}
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
                  defaultValue={user.email}
                  disabled
                  className="input bg-gray-50"
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
                  defaultValue={user.phone}
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
                  defaultValue={user.address}
                  className="input"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? "Salvando..." : "Salvar Alterações"}
              </button>
            </form>
          </div>
        </div>

        <div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="font-playfair text-xl mb-4">Últimos Pedidos</h2>
            <p className="text-gray-600">Nenhum pedido realizado ainda.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
