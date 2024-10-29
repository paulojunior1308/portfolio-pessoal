package estoque.com.br.data.vo;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

import org.springframework.hateoas.RepresentationModel;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.github.dozermapper.core.Mapping;

import estoque.com.br.model.TipoProduto;

@JsonPropertyOrder({"id", "usuarioId", "clienteId", "produtoIds", "aprovado"})
public class ProdutoVO extends RepresentationModel<ProdutoVO> implements Serializable {

	private static final long serialVersionUID = 1L;

	@JsonProperty("id")
	@Mapping("id")
	private Long key;
	private String nomeProduto;
	private TipoProduto tipoProduto;
	private BigDecimal quantidadeProduto;
	private Double valor;

	public ProdutoVO() {}

	public Long getKey() {
		return key;
	}

	public void setKey(Long key) {
		this.key = key;
	}

	public String getNomeProduto() {
		return nomeProduto;
	}

	public void setNomeProduto(String nomeProduto) {
		this.nomeProduto = nomeProduto;
	}

	public TipoProduto getTipoProduto() {
		return tipoProduto;
	}

	public void setTipoProduto(TipoProduto tipoProduto) {
		this.tipoProduto = tipoProduto;
	}

	public BigDecimal getQuantidadeProduto() {
		return quantidadeProduto;
	}

	public void setQuantidadeProduto(BigDecimal quantidadeProduto) {
		this.quantidadeProduto = quantidadeProduto;
	}

	public Double getValor() {
		return valor;
	}

	public void setValor(Double valor) {
		this.valor = valor;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = super.hashCode();
		result = prime * result + Objects.hash(key, nomeProduto, quantidadeProduto, tipoProduto, valor);
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (!super.equals(obj) || (getClass() != obj.getClass())) {
			return false;
		}
		ProdutoVO other = (ProdutoVO) obj;
		return Objects.equals(key, other.key) && Objects.equals(nomeProduto, other.nomeProduto)
				&& quantidadeProduto == other.quantidadeProduto && Objects.equals(tipoProduto, other.tipoProduto)
				&& Objects.equals(valor, other.valor);
	}
}
