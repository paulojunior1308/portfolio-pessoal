import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2, FiSearch } from "react-icons/fi";
import Navbar from "../../services/navbar";

import { expirado, limparSessao } from "../../services/expirado";

import api from "../../services/api";

import "./styles.css";

export default function ConsultaCliente() {
  const [clientes, setCliente] = useState([]);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [initialLoad, setInitialLoad] = useState(true);

  const accessToken = localStorage.getItem("accessToken");
  const userName = localStorage.getItem("username");

  const navigate = useNavigate();

  useEffect(() => {
    if (expirado()) {
      limparSessao();
      navigate('/');
    }
  }, [navigate]);

  async function editCliente(id) {
    try {
      navigate(`/cliente/${id}`);
    } catch (err) {
      alert("Erro ao editar cliente");
    }
  }

  async function deleteCliente(id) {
    if (!id) {
      alert("ID do cliente é nulo");
      return;
    }

    try {
      await api.delete(`api/cliente/v1/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setCliente(clientes.filter((cliente) => cliente.id !== id));
    } catch (err) {
      alert("Erro ao deletar cliente");
    }
  }

  async function searchClient() {
    if (search.trim() === "") {
      setCliente([]);
      setPage(0);
      fetchMoreClientes(true);
      return;
    }

    try {
      const response = await api.get(
        `api/cliente/v1/findClientesByName/${search}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            page: 0,
            size: 20,
            direction: "asc",
          },
        }
      );
      setCliente(response.data._embedded.clienteVOList);
      setPage(1);
    } catch (error) {
      alert("Erro ao buscar cliente");
    }
  }

  const fetchMoreClientes = useCallback(
    async (reset = false) => {
      try {
        const response = await api.get("api/cliente/v1", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            page: reset ? 0 : page,
            size: 4,
            direction: "asc",
          },
        });
        const clienteVOList = response.data._embedded?.clienteVOList || [];
        if (reset) {
          setCliente(clienteVOList);
          setPage(1);
        } else {
          setCliente((prevCliente) => [...prevCliente, ...clienteVOList]);
          setPage((prevPage) => prevPage + 1);
        }
      } catch (error) {
        alert("Erro ao buscar mais clientes");
      }
    },
    [page, accessToken]
  );

  useEffect(() => {
    if (initialLoad) {
      fetchMoreClientes(true);
      setInitialLoad(false);
    }
  }, [initialLoad, fetchMoreClientes]);

  return (
    <div className="consulta-cliente-container">
      <div className="navbar">
        <Navbar />
      </div>
      <div className="consulta-cliente">
        <header className="header-consulta-cliente">
          <span>
            <strong>{userName.toUpperCase()}</strong>
          </span>
        </header>
        <div className="search">
          <input
            type="text"
            placeholder="Pesquisar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={searchClient}>
            <FiSearch size={20} color="#fff" />
          </button>
        </div>
        <ul>
          {clientes.map((cliente) => (
            <li key={cliente.id}>
              <strong>Código:</strong>
              <p>{cliente.id}</p>
              <strong>Razão Social:</strong>
              <p>{cliente.razaoSocial}</p>
              <strong>CNPJ:</strong>
              <p>{cliente.cnpj}</p>
              <strong>Inscrição Estadual:</strong>
              <p>{cliente.inscricaoEstadual}</p>
              <strong>Telefone:</strong>
              <p>{cliente.telefone}</p>
              <strong>Email:</strong>
              <p>{cliente.email}</p>
              <strong>Endereço:</strong>
              <p>{cliente.endereco}</p>

              <button onClick={() => editCliente(cliente.id)} type="button">
                <FiEdit size={20} color="#251fc5" />
              </button>

              <button onClick={() => deleteCliente(cliente.id)} type="button">
                <FiTrash2 size={20} color="#251fc5" />
              </button>
            </li>
          ))}
        </ul>
        <button className="carregar" onClick={() => fetchMoreClientes(false)}>
          Carregar mais
        </button>
      </div>
    </div>
  );
}
