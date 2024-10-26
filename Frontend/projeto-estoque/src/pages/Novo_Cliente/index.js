import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../../services/navbar";

import api from "../../services/api";

import "./styles.css";

export default function NovoCliente() {
  const [id, setId] = useState(null);
  const [razaoSocial, setRazaoSocial] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [inscricaoEstadual, setInscricaoEstadual] = useState("");
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");

  const { clienteId } = useParams();

  const userName = localStorage.getItem("username");
  const accessToken = localStorage.getItem("accessToken");

  const navigate = useNavigate();

  const loadCliente = useCallback(async () => {
    try {
      const response = await api.get(`api/cliente/v1/${clienteId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setId(response.data.id);
      setRazaoSocial(response.data.razaoSocial);
      setCnpj(response.data.cnpj);
      setInscricaoEstadual(response.data.inscricaoEstadual);
      setEndereco(response.data.endereco);
      setTelefone(response.data.telefone);
      setEmail(response.data.email);
    } catch (error) {
      alert("Erro ao carregar dados do cliente");
      navigate("/consultar-cliente");
    }
  }, [
    clienteId,
    accessToken,
    setId,
    setRazaoSocial,
    setCnpj,
    setInscricaoEstadual,
    setEndereco,
    setTelefone,
    setEmail,
    navigate,
  ]);

  useEffect(() => {
    if (clienteId === "0") return;
    else loadCliente();
  }, [clienteId, loadCliente]);

  async function saveOrUpdate(e) {
    e.preventDefault();

    const data = {
      razaoSocial,
      cnpj,
      inscricaoEstadual,
      endereco,
      telefone,
      email,
    };

    try {
      if (clienteId === "0") {
        await api.post("api/cliente/v1", data, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } else {
        data.id = id;
        await api.put("api/cliente/v1", data, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }
      navigate("/consultar-cliente");
    } catch (error) {
      alert("Erro ao salvar dados do cliente");
    }
  }

  return (
    <div className="novo-cliente-home">
      <div>
        <Navbar />
      </div>
      <div className="novo-cliente-container">
        <div className="content">
          <header className="header-novo-cliente">
            <span>
              <strong>{userName.toUpperCase()}</strong>
            </span>
          </header>
          <form onSubmit={saveOrUpdate}>
            <div className="input-group">
              <p>Razão Social</p>
              <input
                placeholder="Razão Social"
                value={razaoSocial}
                onChange={(e) => setRazaoSocial(e.target.value)}
              />
            </div>
            <div className="input-group">
              <p>CNPJ</p>
              <input
                placeholder="XX.XXX.XXX/XXXX-XX"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
              />
            </div>
            <div className="input-group">
              <p>Inscrição Estadual</p>
              <input
                placeholder="XXX.XXX.XXX"
                value={inscricaoEstadual}
                onChange={(e) => setInscricaoEstadual(e.target.value)}
              />
            </div>
            <div className="input-group">
              <p>Endereço</p>
              <input
                placeholder="Rua/Av - Nº - CEP - Estado"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
              />
            </div>
            <div className="input-group">
              <p>Telefone</p>
              <input
                placeholder="(XX) XXXXX-XXXX"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </div>
            <div className="input-group">
              <p>Email</p>
              <input
                placeholder="email@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button className="button" type="submit">
              {clienteId === "0" ? "Cadastrar" : "Atualizar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
