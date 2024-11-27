package estoque.com.br.integrationtests.vo;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

import org.springframework.hateoas.RepresentationModel;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.github.dozermapper.core.Mapping;

@JsonPropertyOrder({"id", "dataCriacao", "dataValidade", "status", "clienteId", "vendedorId", "itens", "total"})
public class OrcamentoVO extends RepresentationModel<OrcamentoVO> implements Serializable {

	private static final long serialVersionUID = 1L;

	@JsonProperty("id")
	@Mapping("id")
	private Long id;

	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private Date dataCriacao;
	
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private Date dataValidade;
    
    private String status;
    private Long clienteId;
    private String razaoSocial;
    private Long usuarioId;
    private List<ItemOrcamentoVO> itens;
    private Double total;

	public OrcamentoVO() {}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Date getDataCriacao() {
		return dataCriacao;
	}

	public void setDataCriacao(Date dataCriacao) {
		this.dataCriacao = dataCriacao;
	}

	public Date getDataValidade() {
		return dataValidade;
	}

	public void setDataValidade(Date dataValidade) {
		this.dataValidade = dataValidade;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public Long getClienteId() {
		return clienteId;
	}

	public void setClienteId(Long clienteId) {
		this.clienteId = clienteId;
	}

	public String getRazaoSocial() {
		return razaoSocial;
	}

	public void setRazaoSocial(String razaoSocial) {
		this.razaoSocial = razaoSocial;
	}

	public Long getUsuarioId() {
		return usuarioId;
	}

	public void setUsuarioId(Long usuarioId) {
		this.usuarioId = usuarioId;
	}
	
	public Long getVendedorId() {
		return usuarioId;
	}

	public void setVendedorId(Long vendedorId) {
		this.usuarioId = vendedorId;
	}

	public List<ItemOrcamentoVO> getItens() {
		return itens;
	}

	public void setItens(List<ItemOrcamentoVO> itens) {
		this.itens = itens;
	}

	public Double getTotal() {
		return total;
	}

	public void setTotal(Double total) {
		this.total = total;
	}

	@Override
	public String toString() {
		return "OrcamentoVO [key=" + id + ", dataCriacao=" + dataCriacao + ", dataValidade=" + dataValidade
				+ ", status=" + status + ", clienteId=" + clienteId + ", razaoSocial=" + razaoSocial + ", usuarioId="
				+ usuarioId + ", itens=" + itens + ", total=" + total + "]";
	}
}