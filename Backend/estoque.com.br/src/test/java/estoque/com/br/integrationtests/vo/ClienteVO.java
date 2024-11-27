package estoque.com.br.integrationtests.vo;

import java.io.Serializable;
import java.util.Objects;

import org.springframework.hateoas.RepresentationModel;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonPropertyOrder({"id", "cnpj", "inscricaoEstadual", "razaoSocial", "endereco", "email", "telefone"})
public class ClienteVO extends RepresentationModel<ClienteVO> implements Serializable {

	private static final long serialVersionUID = 1L;


	private Long id;
	private String razaoSocial;
	private String inscricaoEstadual;
	private String cnpj;
	private String endereco;
	private String email;
	private String telefone;

	public ClienteVO() {}

	public Long getId() {
		return id;
	}

	public void setKey(Long id) {
		this.id = id;
	}

	public String getRazaoSocial() {
		return razaoSocial;
	}

	public void setRazaoSocial(String razaoSocial) {
		this.razaoSocial = razaoSocial;
	}

	public String getInscricaoEstadual() {
		return inscricaoEstadual;
	}

	public void setInscricaoEstadual(String inscricaoEstadual) {
		this.inscricaoEstadual = inscricaoEstadual;
	}

	public String getCnpj() {
		return cnpj;
	}

	public void setCnpj(String cnpj) {
		this.cnpj = cnpj;
	}

	public String getEndereco() {
		return endereco;
	}

	public void setEndereco(String endereco) {
		this.endereco = endereco;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getTelefone() {
		return telefone;
	}

	public void setTelefone(String telefone) {
		this.telefone = telefone;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = super.hashCode();
		result = prime * result + Objects.hash(cnpj, email, endereco, inscricaoEstadual, id, razaoSocial, telefone);
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (!super.equals(obj))
			return false;
		if (getClass() != obj.getClass())
			return false;
		ClienteVO other = (ClienteVO) obj;
		return Objects.equals(cnpj, other.cnpj) && Objects.equals(email, other.email)
				&& Objects.equals(endereco, other.endereco)
				&& Objects.equals(inscricaoEstadual, other.inscricaoEstadual) && Objects.equals(id, other.id)
				&& Objects.equals(razaoSocial, other.razaoSocial) && Objects.equals(telefone, other.telefone);
	}
}
