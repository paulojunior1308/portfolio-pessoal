import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2, FiSearch } from "react-icons/fi";
import Navbar from "../../services/navbar";

import api from "../../services/api";

import "./styles.css";

export default function ConsultaUsuario() {
  const [usuarios, setUsuarios] = useState([]);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [initialLoad, setInitialLoad] = useState(true);

  const navigate = useNavigate();

  const userName = localStorage.getItem("username");
  const accessToken = localStorage.getItem("accessToken");

  async function editUsuario(id) {
    try {
      navigate(`/usuario/${id}`);
    } catch (err) {
      alert("Erro ao editar o usuário");
    }
  }

  async function deleteUsuario(id) {
    if (!id) {
      alert("ID do usuário é nulo");
      return;
    }
    try {
      await api.delete(`api/usuarios/v1/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setUsuarios(usuarios.filter((usuario) => usuario.id !== id));
    } catch (err) {
      alert("Erro ao deletar o usuário");
    }
  }

  async function searchUsuarios() {
    if (search.trim() === "") {
      setUsuarios([]);
      setPage(0);
      fetchMoreUsuarios(true);
      return;
    }

    try {
      const response = await api.get(
        `api/usuarios/v1/findUsuariosByUserName/${search}`,
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
      setUsuarios(response.data._embedded.usuarioVOList);
      setPage(1);
    } catch (error) {
      alert("Erro ao buscar o usuário");
    }
  }

  const fetchMoreUsuarios = useCallback(
    async (reset = false) => {
      try {
        const response = await api.get("api/usuarios/v1", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            page: reset ? 0 : page,
            size: 4,
            direction: "asc",
          },
        });
        const usuarioVOList = response.data._embedded?.usuarioVOList || [];
        if (reset) {
          setUsuarios(usuarioVOList);
          setPage(1);
        } else {
          setUsuarios((prevUsuarios) => [...prevUsuarios, ...usuarioVOList]);
          setPage((prevPage) => prevPage + 1);
        }
      } catch (error) {
        alert("Erro ao buscar o usuário");
      }
    },
    [accessToken, page]
  );

  useEffect(() => {
    if (initialLoad) {
      fetchMoreUsuarios(true);
      setInitialLoad(false);
    }
  }, [fetchMoreUsuarios, initialLoad]);

  return (
    <div className="consulta-usuario-container">
      <div className="navbar">
        <Navbar />
      </div>
      <div className="consulta-usuario">
        <header className="header-consulta-usuario">
          <span>
            <strong>{userName.toUpperCase()}</strong>
          </span>
        </header>
        <div className="search">
          <input
            type="text"
            placeholder="Pesquisar usuário"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={searchUsuarios}>
            <FiSearch size={20} color="#fff" />
          </button>
        </div>
        <ul>
          {usuarios.map((usuario) => (
            <li key={usuario.id}>
              <strong>Usuario</strong>
              <p>{usuario.userName}</p>
              <strong>Nome</strong>
              <p>{usuario.fullName}</p>
              <button onClick={() => editUsuario(usuario.id)} type="button">
                <FiEdit size={20} color="#251fc5" />
              </button>
              <button onClick={() => deleteUsuario(usuario.id)} type="button">
                <FiTrash2 size={20} color="#251fc5" />
              </button>
            </li>
          ))}
        </ul>
        <button className="carregar" onClick={() => fetchMoreUsuarios(false)}>
          Carregar mais
        </button>
      </div>
    </div>
  );
}
