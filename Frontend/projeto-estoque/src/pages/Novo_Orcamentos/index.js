import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CgAdd } from "react-icons/cg";
import Navbar from "../../services/navbar";

import api from "../../services/api";

import "./styles.css";

export default function NovoOrcamento() {
  const [id, setId] = useState(null);
  const [clienteId, setClienteId] = useState("");
  const [dataCriacao, setDataCriacao] = useState("");
  const [dataValidade, setDataValidade] = useState("");
  const [status, setStatus] = useState("Pendente");
  const [vendedorId, setVendedorId] = useState("");
  const [itens, setItens] = useState([]);
  const [total, setTotal] = useState(0);
  const [produtos, setProdutos] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [precoUnitario, setPrecoUnitario] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [pesquisaProduto, setPesquisaProduto] = useState("");

  const { orcamentoId } = useParams();

  const userName = localStorage.getItem("username");
  const accessToken = localStorage.getItem("accessToken");

  const navigate = useNavigate();

  const loadOrcamento = useCallback(async () => {
    if (orcamentoId === "0") return;

    try {
      const response = await api.get(`api/orcamento/v1/${orcamentoId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const orcamento = response.data;

      const itemPromises = orcamento.itens.map(async (item) => {
        try {
          const produtoResponse = await api.get(
            `api/produto/v1/${item.produtoId}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          const produto = produtoResponse.data;

          return {
            ...item,
            nomeProduto: produto.nomeProduto || "Nome não encontrado",
            tipoProduto: produto.tipoProduto || "Tipo não disponível",
          };
        } catch (error) {
          return {
            ...item,
            nomeProduto: "Erro ao carregar produto",
            tipoProduto: "Indisponível",
          };
        }
      });

      const allItens = await Promise.all(itemPromises);

      const uniqueItens = allItens.filter(
        (item, index, self) =>
          index === self.findIndex((i) => i.produtoId === item.produtoId)
      );

      setItens(uniqueItens);
      setId(orcamento.id);
      setClienteId(orcamento.clienteId);
      setDataCriacao(orcamento.dataCriacao.split("T", 10)[0]);
      setDataValidade(orcamento.dataValidade.split("T", 10)[0]);
      setStatus(orcamento.status);
      setVendedorId(orcamento.vendedorId);
      setTotal(orcamento.total);
    } catch (error) {
      alert("Erro ao carregar dados do orçamento");
      navigate("/consultar-orcamento");
    }
  }, [orcamentoId, accessToken, navigate]);

  useEffect(() => {
    loadOrcamento();
  }, [loadOrcamento]);

  const loadProdutos = async () => {
    try {
      const response = await api.get("api/produto/v1", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setProdutos(response.data._embedded.produtoVOList);
    } catch (error) {
      alert("Erro ao carregar produtos");
    }
  };

  const addProduto = async () => {
    if (!produtoSelecionado || quantidade <= 0 || precoUnitario <= 0) {
      alert("Selecione um produto, insira a quantidade e o preço.");
      return;
    }

    if (quantidade > produtoSelecionado.quantidadeProduto) {
      alert("Quantidade solicitada não disponível no estoque.");
      setShowModal(false);
      return;
    }

    const newQuantidade = parseInt(quantidade);
    const newPrecoUnitario = parseFloat(precoUnitario);

    const existingItemIndex = itens.findIndex(
      (item) => item.produtoId === produtoSelecionado.id
    );
    let updatedItens;

    if (existingItemIndex > -1) {
      updatedItens = [...itens];
      updatedItens[existingItemIndex].quantidade += newQuantidade;
      updatedItens[existingItemIndex].precoUnitario = newPrecoUnitario;
    } else {
      updatedItens = [
        ...itens,
        {
          produtoId: produtoSelecionado.id,
          nomeProduto: produtoSelecionado.nomeProduto,
          tipoProduto: produtoSelecionado.tipoProduto,
          quantidade: newQuantidade,
          precoUnitario: newPrecoUnitario,
          valor: produtoSelecionado.valor,
        },
      ];
    }

    try {
      await api.put(
        `api/produto/v1/${produtoSelecionado.id}`,
        {
          quantidadeProduto:
            produtoSelecionado.quantidadeProduto - newQuantidade,
          nomeProduto: produtoSelecionado.nomeProduto,
          tipoProduto: produtoSelecionado.tipoProduto,
          valor: produtoSelecionado.valor,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setItens(updatedItens);
      setProdutoSelecionado(null);
      setQuantidade(1);
      setPrecoUnitario(0);
      setShowModal(false);

      calculateTotal(updatedItens);
    } catch (error) {
      alert("Erro ao atualizar a quantidade do produto no estoque.");
      setShowModal(false);
    }
  };

  const calculateTotal = (itens) => {
    const total = itens.reduce(
      (acc, item) => acc + item.quantidade * item.precoUnitario,
      0
    );
    setTotal(total);
  };
  const handleRemoveItem = async (index) => {
    const item = itens[index];
    const produtoId = item.produtoId;
    try {
      const response = await api.get(`api/produto/v1/${produtoId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const produtoAtual = response.data;
      if (
        !produtoAtual ||
        typeof produtoAtual.quantidadeProduto === "undefined"
      ) {
        alert("Produto atual não encontrado ou inválido.");
        return;
      }

      const quantidadeRestaurada =
        produtoAtual.quantidadeProduto + item.quantidade;
      await api.put(
        `api/produto/v1/${produtoId}`,
        {
          quantidadeProduto: quantidadeRestaurada,
          nomeProduto: item.nomeProduto,
          tipoProduto: item.tipoProduto,
          valor: item.precoUnitario,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const updatedItens = itens.filter((_, i) => i !== index);
      setItens(updatedItens);
      calculateTotal(updatedItens);
    } catch (error) {
      alert("Erro ao restaurar a quantidade de produtos no estoque.");
    }
  };

  const saveOrUpdate = async (e) => {
    e.preventDefault();

    const formataDataCriacao = new Date(dataCriacao)
      .toISOString()
      .split("T")[0];
    const formataDataValidade = new Date(dataValidade)
      .toISOString()
      .split("T")[0];

    const data = {
      id,
      clienteId,
      dataCriacao: formataDataCriacao,
      dataValidade: formataDataValidade,
      status,
      vendedorId,
      itens: [...itens],
      total,
    };

    try {
      if (status === "Reprovado") {
        const restorePromises = itens.map(async (item) => {
          const produtoResponse = await api.get(
            `api/produto/v1/${item.produtoId}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          const produtoAtual = produtoResponse.data;
          const quantidadeRestaurada = produtoAtual.quantidadeProduto + item.quantidade;

          return api.put(
            `api/produto/v1/${item.produtoId}`,
            {
              quantidadeProduto: quantidadeRestaurada,
              nomeProduto: item.nomeProduto,
              tipoProduto: item.tipoProduto,
              valor: item.precoUnitario,
            },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
        });

        await Promise.all(restorePromises);
      }

      if (orcamentoId === "0") {
        await api.post("api/orcamento/v1", data, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } else {
        await api.put("api/orcamento/v1", data, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }

      navigate("/consultar-orcamento");
    } catch (error) {
      alert("Erro ao salvar dados do orçamento");
    }
  };

  const handleSelecionaStatus = (event) => {
    setStatus(event.target.value);
  };

  const produtosFiltrados = Array.isArray(produtos)
    ? produtos.filter(
        (produto) =>
          typeof produto.nomeProduto === "string" &&
          produto.nomeProduto
            .toLowerCase()
            .includes(pesquisaProduto.toLowerCase())
      )
    : [];

  return (
    <div className="novo-orcamento-home">
      <div>
        <Navbar />
      </div>
      <div className="novo-orcamento-container">
        <div className="content">
          <header className="header-novo-orcamento">
            <span>
              <strong>{userName.toUpperCase()}</strong>
            </span>
          </header>
          <form onSubmit={saveOrUpdate}>
            <div className="input">
              <p>Código Cliente</p>
              <input
                placeholder="Código Cliente"
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
              />
            </div>
            <div className="input">
              <p>Data de Criação</p>
              <input
                type="date"
                value={dataCriacao}
                onChange={(e) => setDataCriacao(e.target.value)}
              />
            </div>
            <div className="input">
              <p>Data de Validade</p>
              <input
                type="date"
                value={dataValidade}
                onChange={(e) => setDataValidade(e.target.value)}
              />
            </div>
            <div className="input">
              <p>Status</p>
              <select
                id="status-select"
                value={status}
                onChange={handleSelecionaStatus}
              >
                <option value="Pendente">Pendente</option>
                <option value="Aprovado">Aprovado</option>
                <option value="Reprovado">Reprovado</option>
              </select>
            </div>

            <button
              className="button"
              type="button"
              onClick={() => {
                loadProdutos();
                setShowModal(true);
              }}
            >
              Pesquisar Produto
            </button>

            {showModal && (
              <div className="modal">
                <h3>Selecione um Produto</h3>
                <div className="search">
                  <input
                    type="text"
                    placeholder="Pesquisar Produto..."
                    value={pesquisaProduto}
                    onChange={(e) => setPesquisaProduto(e.target.value)}
                  />
                </div>
                <ul>
                  {produtosFiltrados.map((produto) => (
                    <li key={produto.id}>
                      <strong>Nome Produto: </strong>
                      <p>{produto.nomeProduto}</p>
                      <strong>Tipo Produto:</strong>
                      <p>{produto.tipoProduto}</p>
                      <strong>Quantidade:</strong>
                      <p>{produto.quantidadeProduto}</p>
                      <strong>Valor unitário:</strong>
                      <p>R$ {produto.valor.toFixed(2)}</p>
                      <button
                        type="button"
                        onClick={() => setProdutoSelecionado(produto)}
                      >
                        <CgAdd size={20} color="#251fc5" />
                      </button>
                    </li>
                  ))}
                </ul>
                {produtoSelecionado && (
                  <div>
                    <h4>
                      Produto Selecionado: {produtoSelecionado.nomeProduto}
                    </h4>
                    <input
                      type="number"
                      placeholder="Quantidade"
                      value={quantidade}
                      onChange={(e) => setQuantidade(e.target.value)}
                    />
                    <input
                      type="decimal"
                      placeholder="Valor Unitário"
                      value={precoUnitario}
                      onChange={(e) => setPrecoUnitario(e.target.value)}
                    />
                    <button
                      className="button"
                      type="button"
                      onClick={addProduto}
                    >
                      Adicionar ao Orçamento
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="itens-list">
              <h3>Itens do Orçamento</h3>
              {itens.length > 0 ? (
                itens.map((item, index) => (
                  <div key={index} className="item">
                    <div className="input-group-orcamento">
                      <strong>Código:</strong>
                      <p>{item.produtoId}</p>
                    </div>
                    <div className="input-group-orcamento">
                      <strong>Produto:</strong>
                      <p>{item.nomeProduto}</p>
                    </div>
                    <div className="input-group-orcamento">
                      <strong>Quantidade: </strong>
                      <p>{item.quantidade}</p>
                    </div>
                    <div className="input-group-orcamento">
                      <strong>Valor Unitário: </strong>
                      <p>R${item.precoUnitario.toFixed(2)}</p>
                    </div>
                    <div className="input-group-orcamento">
                      <strong>Subtotal: </strong>
                      <p>R${item.quantidade * item.precoUnitario}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                    >
                      Remover
                    </button>
                  </div>
                ))
              ) : (
                <p>Nenhum item adicionado.</p>
              )}
            </div>
            <div className="total">
              <h2>Total R$ {total.toFixed(2)}</h2>
            </div>
            <button className="button" type="submit">
              {orcamentoId === "0" ? "Criar Orçamento" : "Atualizar Orçamento"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
