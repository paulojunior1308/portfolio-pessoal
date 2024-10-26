import React from "react";
import { NavLink } from "react-router-dom";
import { FiPower } from "react-icons/fi";
import { jwtDecode } from "jwt-decode";

import "../../src/global.css";

const Navbar = () => {
  const token = localStorage.getItem("accessToken");

  let roles = [];
  if (token) {
    const decodedToken = jwtDecode(token);
    roles = decodedToken.roles || [];
  }

  return (
    <nav className="navbar">
      <ul>
        <li>
          <NavLink
            to="/home"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Home
          </NavLink>
        </li>

        {roles.includes("ROLE_ADMIN") && (
          <>
            <li>
              <NavLink
                to="/usuario/0"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Cadastrar Usuário
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/consultar-usuario"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Consultar Usuário
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/cliente/0"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Cadastrar Cliente
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/consultar-cliente"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Consultar Cliente
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/produto/0"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Cadastrar Produto
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/consultar-produto"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Consultar Produto
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/orcamento/0"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Cadastrar Orçamento
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/consultar-orcamento"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Consultar Orçamento
              </NavLink>
            </li>
          </>
        )}

        {roles.includes("ROLE_VENDEDOR") && (
          <>
            <li>
              <NavLink
                to="/cliente/0"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Cadastrar Cliente
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/consultar-cliente"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Consultar Cliente
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/consultar-produto"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Consultar Produto
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/orcamento/0"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Cadastrar Orçamento
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/consultar-orcamento"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Consultar Orçamento
              </NavLink>
            </li>
          </>
        )}

        {roles.includes("ROLE_CONTROLADOR_ESTOQUE") && (
          <>
            <li>
              <NavLink
                to="/produto/0"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Cadastrar Produto
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/consultar-produto"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Consultar Produto
              </NavLink>
            </li>
          </>
        )}

        <li>
          <NavLink to="/" className="logout">
            <FiPower />
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
