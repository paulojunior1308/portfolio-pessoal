package estoque.com.br.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import estoque.com.br.model.Orcamento;
import jakarta.transaction.Transactional;

public interface OrcamentoRepository extends JpaRepository<Orcamento, Long> {

	@Query("SELECT o FROM Orcamento o WHERE o.id =:id")
	Page<Orcamento> findOrcamentosById(@Param("id") Long id, Pageable pageable);
	
	@Query("SELECT o FROM Orcamento o LEFT JOIN FETCH o.itens WHERE o.id =:id")
	Orcamento findByIdWithItens(@Param("id") Long id);
	
	@Transactional
	void deleteByClienteId(Long clienteId);

}
