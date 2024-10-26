package estoque.com.br.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import estoque.com.br.model.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

	@Query("SELECT u FROM Usuario u WHERE u.userName LIKE LOWER(CONCAT ('%',:userName,'%'))")
	Page<Usuario> findByUserName(@Param("userName") String userName, Pageable pageable);
	
	@Query("SELECT u FROM Usuario u WHERE u.userName LIKE LOWER(CONCAT ('%',:userName,'%'))")
	Usuario findByUsername(@Param("userName") String userName);
}