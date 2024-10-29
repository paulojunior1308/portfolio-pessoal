import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2, FiSearch, FiPrinter } from "react-icons/fi";
import jsPDF from "jspdf";

import Navbar from "../../services/navbar";
import api from "../../services/api";
import logo from "../../image/Logo.png"

import "./styles.css";

export default function ConsultaOrcamento() {
  const [orcamento, setOrcamento] = useState([]);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [initialLoad, setInitialLoad] = useState(true);

  const userName = localStorage.getItem("username");
  const accessToken = localStorage.getItem("accessToken");

  const navigate = useNavigate();

  async function editOrcamento(id) {
    const orcamentoToEdit = orcamento.find((o) => o.id === id);
    if (orcamentoToEdit) {
      navigate(`/orcamento/${id}`, { state: { orcamento: orcamentoToEdit } });
    } else {
      alert("Orçamento não encontrado");
    }
  }

  async function deleteOrcamento(id) {
    if (!id) {
      alert("Código do produto é nulo");
      return;
    }
    try {
      await api.delete(`api/orcamento/v1/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setOrcamento((prevOrcamento) =>
        prevOrcamento.filter((item) => item.id !== id)
      );
    } catch (error) {
      alert("Erro ao deletar produto");
    }
  }

  async function searchOrcamento() {
    if (search.trim() === "") {
      setPage(0);
      setOrcamento([]);
      fetchMoreOrcamento(true);
      return;
    }

    try {
      const response = await api.get(`api/orcamento/v1/${search}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setOrcamento([response.data]);
      setPage(1);
    } catch (error) {
      alert("Erro ao buscar orçamento por ID");
    }
  }

  const fetchCliente = useCallback(
    async (clienteId) => {
      try {
        const response = await api.get(`api/cliente/v1/${clienteId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        return response.data;
      } catch (error) {
        alert("Erro ao buscar cliente pelo nome");
        return null;
      }
    },
    [accessToken]
  );

  const fetchProduto = useCallback(
    async (produtoId) => {
      try {
        const response = await api.get(`api/produto/v1/${produtoId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        return response.data;
      } catch (error) {
        alert("Erro ao buscar informações do produto:");
        return null;
      }
    },
    [accessToken]
  );

  const fetchProdutos = useCallback(
    async (orcamentoList) => {
      const updatedOrcamentoVOList = await Promise.all(
        orcamentoList.map(async (orcamento) => {
          const updatedItens = await Promise.all(
            orcamento.itens.map(async (item) => {
              const produto = await fetchProduto(item.produtoId);
              return { ...item, produto: produto || {} };
            })
          );
          return { ...orcamento, itens: updatedItens };
        })
      );

      setOrcamento((prevOrcamento) =>
        prevOrcamento.map((o) => {
          const updatedOrcamento = updatedOrcamentoVOList.find(
            (upd) => upd.id === o.id
          );
          return updatedOrcamento ? updatedOrcamento : o;
        })
      );
    },
    [fetchProduto]
  );

  const fetchMoreOrcamento = useCallback(
    async (reset = false) => {
      try {
        const response = await api.get("api/orcamento/v1", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            page: reset ? 0 : page,
            size: 4,
            direction: "asc",
          },
        });

        const orcamentoVOList = response.data._embedded?.orcamentoVOList || [];

        if (orcamentoVOList.length === 0) {
          alert("Não há mais orçamentos para carregar.");
          return;
        }

        const updatedOrcamentoVOList = await Promise.all(
          orcamentoVOList.map(async (orcamento) => {
            const cliente = await fetchCliente(orcamento.clienteId);
            return { ...orcamento, cliente };
          })
        );

        if (reset) {
          setOrcamento(updatedOrcamentoVOList);
          setPage(1);
        } else {
          setOrcamento((prevOrcamento) => [
            ...prevOrcamento,
            ...updatedOrcamentoVOList,
          ]);
          setPage((prevPage) => prevPage + 1);
        }

        fetchProdutos(updatedOrcamentoVOList);
      } catch (error) {
        alert("Erro ao buscar mais orçamentos");
      }
    },
    [page, accessToken, fetchCliente, fetchProdutos]
  );

  useEffect(() => {
    if (initialLoad) {
      fetchMoreOrcamento(true);
      setInitialLoad(false);
    }
  }, [initialLoad, fetchMoreOrcamento]);


  const orcamentoRefs = useRef({});
  
  const generatePDF = async (orcamento) => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Add watermark image
    const img = new Image();
    img.src = logo;
    
    img.onload = () => {
      pdf.setGState(new pdf.GState({ opacity: 0.3 }));
      pdf.addImage(img, "JPEG", 0, 0, pageWidth, pageHeight, "", "FAST");
      pdf.setGState(new pdf.GState({ opacity: 1 }));
      
      pdf.setFontSize(28);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("Roboto", "bold");
      pdf.text("Orçamento", 80, 20);
      

      pdf.setFontSize(22);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Data de criação: ${new Date(orcamento.dataCriacao).toLocaleDateString()}`, 10, 40);

      pdf.setFontSize(22);
      pdf.setTextColor(255, 0, 0);
      pdf.text(`Data de validade: ${new Date(orcamento.dataValidade).toLocaleDateString()}`, 10, 50);

      pdf.setFontSize(22);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Status: ${orcamento.status}`, 10, 60);
      pdf.text(`Cliente: ${orcamento.cliente ? orcamento.cliente.razaoSocial.toUpperCase() : "Cliente não disponível"}`, 10, 70);
      
      let y = 90;
      pdf.setFontSize(20);
      pdf.setTextColor(0, 102, 204);
      pdf.text("ITENS DO ORÇAMENTO:", 10, y);
      y += 10;
      
      orcamento.itens.forEach((item, index) => {
        if (y > pageHeight - 30) {
          pdf.addPage();
          pdf.setGState(new pdf.GState({ opacity: 0.9 }));
          pdf.addImage(img, "JPEG", 0, 0, pageWidth, pageHeight, "", "FAST");
          pdf.setGState(new pdf.GState({ opacity: 1 }));
          y = 20;
        }
  
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.rect(10, y - 5, pageWidth - 20, 30);
  
        pdf.setFontSize(18);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`Código: ${item.produtoId}`, 15, y);
        pdf.text(`Produto: ${item.produto ? item.produto.nomeProduto : "Produto não disponível"}`, 15, y + 8);
        pdf.text(`Quantidade: ${item.quantidade.toFixed(3)}`, 15, y + 16);
        pdf.text(`Preço Unitário: R$ ${item.precoUnitario.toFixed(2)}`, 15, y + 24);
        
        y += 35; // Adjust spacing for next item
      });
      
      if (y > pageHeight - 30) {
        pdf.addPage();
        pdf.setGState(new pdf.GState({ opacity: 0.3 }));
        pdf.addImage(img, "JPEG", 0, 0, pageWidth, pageHeight, "", "FAST");
        pdf.setGState(new pdf.GState({ opacity: 1 }));
        y = 20;
      }
      
      pdf.setFontSize(22);
      pdf.setFont("Roboto", "bold");
      pdf.setTextColor(255, 0, 0);
      pdf.text(`VALOR TOTAL: R$ ${orcamento.total.toFixed(2)}`, 10, y);
      
      pdf.save(`orcamento-${orcamento.id}.pdf`);
    };
  };
  

  return (
    <div className="consulta-orcamento-container">
      <div className="navbar">
        <Navbar />
      </div>
      <div className="consulta-orcamento">
        <header className="header-consulta-orcamento">
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
          <button onClick={searchOrcamento}>
            <FiSearch size={20} color="#fff" />
          </button>
        </div>
        <ul className="itens-produtos">
          {orcamento.map((orcamento) => (
            <li 
              key={orcamento.id} 
              ref={(el) => (orcamentoRefs.current[orcamento.id] = el)}
            >
              <strong>Orçamento: </strong>
              <p>{orcamento.id}</p>
              <strong>Data de criação: </strong>
              <p>{new Date(orcamento.dataCriacao).toISOString().split('T')[0].split('-').reverse().join('/')}</p>
              <strong>Data de validade: </strong>
              <p>{new Date(orcamento.dataValidade).toISOString().split('T')[0].split('-').reverse().join('/')}</p>
              <strong>Status: </strong>
              <p>{orcamento.status}</p>
              <strong>Cliente: </strong>
              <p>Código: {orcamento.clienteId || "Cliente não disponível"}</p>
              <p>Razão Social: {orcamento.cliente ? orcamento.cliente.razaoSocial : "Nome não disponível"}</p>
              <strong>Itens: </strong>
              {orcamento.itens && orcamento.itens.length > 0 ? (
                <ul className="itens">
                  {orcamento.itens.map((item) => (
                    <li className="item" key={item.id}>
                      <p>Código: {item.produtoId}</p>
                      <p>Produto: {item.produto ? item.produto.nomeProduto : "Produto não disponível"}</p>
                      <p>Quantidade: {item.quantidade.toFixed(3)}</p>
                      <p>Preço Unitário: R$ {item.precoUnitario.toFixed(2)}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nenhum item disponível</p>
              )}
              <strong>Valor Total: </strong>
              <p>R$ {orcamento.total.toFixed(2)}</p>
              {orcamento.status === "Pendente" && (
                <button onClick={() => generatePDF(orcamento)} type="button">
                  <FiPrinter size={20} color="#251fc5" />
                </button>
              )}
              <button onClick={() => editOrcamento(orcamento.id)} type="button" disabled={orcamento.status !== "Pendente"}>
                <FiEdit size={20} color={orcamento.status !== "Pendente" ? "#888" : "#251fc5"} />
              </button>
              <button onClick={() => deleteOrcamento(orcamento.id)} type="button" disabled={orcamento.status !== "Pendente"}>
                <FiTrash2 size={20} color={orcamento.status !== "Pendente" ? "#888" : "#251fc5"}/>
              </button>
            </li>
          ))}
        </ul>
        <button className="carregar" onClick={() => fetchMoreOrcamento()}>
          Carregar mais
        </button>
      </div>
    </div>
  );
}
