package estoque.com.br.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import estoque.com.br.model.Permission;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {

}
