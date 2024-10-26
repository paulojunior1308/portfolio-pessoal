package estoque.com.br.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import estoque.com.br.model.Cliente;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

	@Query("SELECT c FROM Cliente c WHERE c.razaoSocial LIKE LOWER(CONCAT ('%',:razaoSocial,'%'))")
	Page<Cliente> findClientesByName(@Param("razaoSocial") String razaoSocial, Pageable pageable);

}
