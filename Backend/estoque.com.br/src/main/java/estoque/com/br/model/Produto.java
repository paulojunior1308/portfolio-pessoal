package estoque.com.br.model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "produtos")
public class Produto implements Serializable{

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "nome_produto", nullable = false, length = 80)
	private String nomeProduto;

	@Enumerated(EnumType.STRING)
	@Column(name = "tipo_produto", nullable = false, length = 5)
	private TipoProduto tipoProduto;

	@Column(name = "quantidade_produto", nullable = false, precision = 10, scale = 3)
	private BigDecimal quantidadeProduto;

	@Column(name = "valor_produto", nullable = false, length = 10)
	private Double valor;

	public Produto() {}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
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
		return Objects.hash(id, nomeProduto, quantidadeProduto, tipoProduto, valor);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if ((obj == null) || (getClass() != obj.getClass())) {
			return false;
		}
		Produto other = (Produto) obj;
		return Objects.equals(id, other.id) && Objects.equals(nomeProduto, other.nomeProduto)
				&& quantidadeProduto == other.quantidadeProduto && tipoProduto == other.tipoProduto
				&& Objects.equals(valor, other.valor);
	}
}
