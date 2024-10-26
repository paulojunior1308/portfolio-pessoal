import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { limparSessao, expirado } from "./expirado"; // Importa suas funções

const SessionTimeout = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    let timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (expirado()) {
          limparSessao();
        }
        navigate("/"); // Redireciona para a página inicial
      }, 1800000); // 30 minutos em milissegundos
    };

    // Adiciona eventos de interação do usuário
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("scroll", resetTimer);
    window.addEventListener("click", resetTimer);

    resetTimer(); // Inicializa o timer quando o componente é montado

    return () => {
      clearTimeout(timeout); // Limpa o timer quando o componente é desmontado
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("scroll", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, [navigate]);

  return <>{children}</>; // Renderiza os filhos do componente
};

export default SessionTimeout;
