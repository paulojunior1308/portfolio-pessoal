import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../../services/navbar";
import api from "../../services/api";

import "./styles.css";

export default function NovoUsuario() {
  const [id, setId] = useState(null);
  const [userName, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [accountNonExpired, setAccountNonExpired] = useState(true);
  const [accountNonLocked, setAccountNonLocked] = useState(true);
  const [credentialsNonExpired, setCredentialsNonExpired] = useState(true);
  const [enabled, setEnabled] = useState(true);

  const { usuarioId } = useParams();

  const username = localStorage.getItem("username");
  const accessToken = localStorage.getItem("accessToken");
  
  const navigate = useNavigate();

  const loadUsuario = useCallback(async () => {
    try {
      const response = await api.get(`api/usuarios/v1/${usuarioId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setId(response.data.id);
      setUsername(response.data.userName);
      setFullName(response.data.fullName);

      setPermissions(
        Array.isArray(response.data.permissions)
          ? response.data.permissions.map(
              (permission) => permission.description
            )
          : []
      );

      setAccountNonExpired(response.data.accountNonExpired);
      setAccountNonLocked(response.data.accountNonLocked);
      setCredentialsNonExpired(response.data.credentialsNonExpired);
      setEnabled(response.data.enabled);
    } catch (error) {
      alert("Erro ao carregar dados do usuário: " + error);
      navigate("/consultar-usuario");
    }
  }, [navigate, accessToken, usuarioId]);

  useEffect(() => {
    if (usuarioId === "0") return;
    loadUsuario();
  }, [usuarioId, loadUsuario]);

  async function saveOrUpdate(e) {
    e.preventDefault();

    const permissionsData = Array.isArray(permissions) ? permissions : [];

    const data = {
      userName,
      fullName,
      permissions: permissionsData.map((permission) => ({
        description: permission,
      })),
      accountNonExpired,
      accountNonLocked,
      credentialsNonExpired,
      enabled,
    };

    if (password) {
      data.password = password;
    }

    try {
      const existingUserResponse = await api.get(
        `api/usuarios/v1/findUsuariosByUserName/${userName}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (existingUserResponse.data && id === null) {
        alert("Usuário já existe!");
        return;
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        if (id === null) {
          await api.post("api/usuarios/v1", data, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
        }
      } else {
        alert("Erro ao verificar se o usuário já existe.");
        return;
      }
    }

    if (id !== null) {
      await api.put(`api/usuarios/v1/${id}`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }

    navigate("/consultar-usuario");
  }

  return (
    <div className="novo-usuario-home">
      <div>
        <Navbar />
      </div>
      <div className="novo-usuario-container">
        <div className="content">
          <header className="header-novo-usuario">
            <span>
              <strong>{username.toUpperCase()}</strong>
            </span>
          </header>
          <form onSubmit={saveOrUpdate}>
            <div className="input-group">
              <p>Usuário</p>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nome de Usuário"
              />
            </div>
            <div className="input-group">
              <p>Senha</p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
              />
            </div>
            <div className="input-group">
              <p>Nome Completo</p>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nome Completo"
              />
            </div>
            <div className="input-group">
              <p>Permissões</p>
              <select
                value={permissions[0] || ""}
                onChange={(e) => setPermissions([e.target.value])}
              >
                <option value="" disabled>
                  Selecione a permissão
                </option>
                <option value="ROLE_ADMIN">Admin</option>
                <option value="ROLE_VENDEDOR">Vendedor</option>
                <option value="ROLE_CONTROLADOR_ESTOQUE">
                  Controlador de Estoque
                </option>
              </select>
            </div>
            <button className="button" type="submit">
              {usuarioId === "0" ? "Cadastrar" : "Atualizar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
