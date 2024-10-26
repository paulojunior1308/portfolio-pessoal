import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../../services/navbar";

import api from "../../services/api";

import "./styles.css";

export default function NovoProduto() {
  const [id, setId] = useState(null);
  const [nomeProduto, setnomeProduto] = useState("");
  const [tipoProduto, settipoProduto] = useState("");
  const [quantidadeProduto, setQuantidadeProduto] = useState("");
  const [valor, setValor] = useState("");

  const { produtoId } = useParams();

  const userName = localStorage.getItem("username");
  const accessToken = localStorage.getItem("accessToken");

  const navigate = useNavigate();

  const loadProduto = useCallback(async () => {
    try {
      const response = await api.get(`api/produto/v1/${produtoId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setId(response.data.id);
      setnomeProduto(response.data.nomeProduto);
      settipoProduto(response.data.tipoProduto);
      setQuantidadeProduto(response.data.quantidadeProduto);
      setValor(response.data.valor);
    } catch (error) {
      alert("Erro ao carregar dados do produto");
      navigate("/consultar-produto");
    }
  }, [
    produtoId,
    accessToken,
    setId,
    setnomeProduto,
    settipoProduto,
    setQuantidadeProduto,
    setValor,
    navigate,
  ]);

  useEffect(() => {
    if (produtoId === "0") return;
    else loadProduto();
  }, [produtoId, loadProduto]);

  async function saveOrUpdate(e) {
    e.preventDefault();

    const data = {
      nomeProduto,
      tipoProduto,
      quantidadeProduto,
      valor,
    };

    try {
      if (produtoId === "0") {
        await api.post("api/produto/v1", data, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } else {
        data.id = id;
        await api.put(`api/produto/v1/${produtoId}`, data, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }
      navigate("/consultar-produto");
    } catch (error) {
      alert("Erro ao salvar dados do produto");
    }
  }

  return (
    <div className="novo-produto-home">
      <div>
        <Navbar />
      </div>
      <div className="novo-produto-container">
        <div className="content">
          <header className="header-novo-produto">
            <span>
              <strong>{userName.toUpperCase()}</strong>
            </span>
          </header>
          <form onSubmit={saveOrUpdate}>
            <div className="input-group">
              <p>Nome Produto</p>
              <input
                placeholder="Nome produto"
                value={nomeProduto}
                onChange={(e) => setnomeProduto(e.target.value)}
              />
            </div>
            <div className="input-group">
              <p>Tipo Produto</p>
              <input
                placeholder="KG, UN, PCT, CX"
                value={tipoProduto}
                onChange={(e) => settipoProduto(e.target.value)}
              />
            </div>
            <div className="input-group">
              <p>Quantidade</p>
              <input
                placeholder="Quantidade"
                value={quantidadeProduto}
                onChange={(e) => setQuantidadeProduto(e.target.value)}
              />
            </div>
            <div className="input-group">
              <p>Valor</p>
              <input
                placeholder="Valor unitário"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
              />
            </div>
            <button className="button" type="submit">
              {produtoId === "0" ? "Cadastrar" : "Atualizar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
