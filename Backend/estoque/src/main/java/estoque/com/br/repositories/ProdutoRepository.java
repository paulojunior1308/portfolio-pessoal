package estoque.com.br.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import estoque.com.br.model.Produto;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {

	@Query("SELECT p FROM Produto p WHERE p.nomeProduto LIKE LOWER(CONCAT ('%',:nomeProduto,'%'))")
	Page<Produto> findProdutosByName(@Param("nomeProduto") String nomeProduto, Pageable pageable);

}
