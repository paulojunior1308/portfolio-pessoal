import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2, FiSearch } from "react-icons/fi";
import { jwtDecode } from "jwt-decode";

import Navbar from "../../services/navbar";

import api from "../../services/api";

import "./styles.css";

export default function ConsultaProduto() {
  const [produtos, setProdutos] = useState([]);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [initialLoad, setInitialLoad] = useState(true);

  const username = localStorage.getItem("username");
  const accessToken = localStorage.getItem("accessToken");
  
  const navigate = useNavigate();

  let roles = [];
  if(accessToken){
    const decodedToken = jwtDecode(accessToken);
    roles = decodedToken.roles || [];
  }

  async function editProduto(id) {
    try {
      navigate(`/produto/${id}`);
    } catch (error) {
      alert("Erro ao editar produto");
    }
  }

  async function deleteProduto(id) {
    if (!id) {
      alert("Código do produto é nulo");
      return;
    }
    try {
      await api.delete(`api/produto/v1/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setProdutos(produtos.filter((produto) => produto.id !== id));
    } catch (err) {
      alert(
        `Erro ao deletar produto: ${err.response.status} - ${err.response.data.message}`
      );
    }
  }

  async function searchProduto() {
    if (search.trim() === "") {
      setPage(0);
      setProdutos([]);
      fetchMoreProdutos(true);
      return;
    }
    try {
      const response = await api.get(
        `api/produto/v1/findProdutosByName/${search}`,
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
      setProdutos(response.data._embedded.produtoVOList);
      setPage(1);
    } catch (error) {
      alert("Erro ao buscar produto");
    }
  }

  const fetchMoreProdutos = useCallback(
    async (reset = false) => {
      try {
        const response = await api.get("api/produto/v1", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            page: reset ? 0 : page,
            size: 4,
            direction: "asc",
          },
        });
        const produtoVOList = response.data._embedded?.produtoVOList || [];
        if (reset) {
          setProdutos(produtoVOList);
          setPage(1);
        } else {
          setProdutos((prevProdutos) => [...prevProdutos, ...produtoVOList]);
          setPage((prevPage) => prevPage + 1);
        }
      } catch (error) {
        alert("Erro ao buscar mais produtos");
      }
    },
    [page, accessToken]
  );

  useEffect(() => {
    if (initialLoad) {
      fetchMoreProdutos(true);
      setInitialLoad(false);
    }
  }, [initialLoad, fetchMoreProdutos]);

  return (
    <div className="consulta-produto-container">
      <div className="navbar">
        <Navbar />
      </div>
      <div className="consulta-produto">
        <header className="header-consulta-produto">
          <span>
            <strong>{username.toUpperCase()}</strong>
          </span>
        </header>
        <div className="search">
          <input
            type="text"
            placeholder="Pesquisar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={searchProduto}>
            <FiSearch size={20} color="#fff" />
          </button>
        </div>
        <ul>
          {produtos.map((produto) => (
            <li key={produto.id}>
              <strong>Nome Produto: </strong>
              <p>{produto.nomeProduto}</p>
              <strong>Tipo Produto:</strong>
              <p>{produto.tipoProduto}</p>
              <strong>Quantidade:</strong>
              <p>{produto.quantidadeProduto}</p>
              <strong>Valor unitário:</strong>
              <p>R$ {produto.valor.toFixed(2)}</p>
              {roles.includes("ROLE_ADMIN") && (
                <div>
                <button onClick={() => editProduto(produto.id)} type="button">
                    <FiEdit size={20} color="#251fc5" />
                </button>
                <button onClick={() => deleteProduto(produto.id)} type="button">
                    <FiTrash2 size={20} color="#251fc5" />
                </button>
                </div>
              )}
              {roles.includes("ROLE_CONTROLADOR_ESTOQUE") && (
                <div>
                <button onClick={() => editProduto(produto.id)} type="button">
                    <FiEdit size={20} color="#251fc5" />
                </button>
                <button onClick={() => deleteProduto(produto.id)} type="button">
                    <FiTrash2 size={20} color="#251fc5" />
                </button>
                </div>
              )}
            </li>
          ))}
        </ul>
        <button className="carregar" onClick={() => fetchMoreProdutos(false)}>
          Carregar mais
        </button>
      </div>
    </div>
  );
}
