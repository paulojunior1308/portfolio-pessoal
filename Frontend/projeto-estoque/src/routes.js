import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Home from "./pages/Home";

import NovoCliente from "./pages/Novo_Cliente";
import NovoProduto from "./pages/Novo_Produto";
import NovoOrcamento from "./pages/Novo_Orcamentos";
import NovoUsuario from "./pages/Novo_Usuario";

import ConsultaCliente from "./pages/Consulta_Cliente";
import ConsultaProduto from "./pages/Consulta_Produtos";
import ConsultaOrcamento from "./pages/Consulta_Orcamento";
import ConsultaUsuario from "./pages/Consulta_Usuario";

import Sessao from "./services/sessao";

export default function AppRoutes() {
  return (
    <BrowserRouter>
    <Sessao>
      <Routes>
        <Route path="/" exact={true} element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/consultar-cliente" element={<ConsultaCliente />} />
        <Route path="/cliente/:clienteId" element={<NovoCliente />} />
        <Route path="/consultar-produto" element={<ConsultaProduto />} />
        <Route path="/produto/:produtoId" element={<NovoProduto />} />
        <Route path="/orcamento/:orcamentoId" element={<NovoOrcamento />} />
        <Route path="/consultar-orcamento" element={<ConsultaOrcamento />} />
        <Route path="/usuario/:usuarioId" element={<NovoUsuario />} />
        <Route path="/consultar-usuario" element={<ConsultaUsuario />} />
      </Routes>
      </Sessao>
    </BrowserRouter>
  );
}
