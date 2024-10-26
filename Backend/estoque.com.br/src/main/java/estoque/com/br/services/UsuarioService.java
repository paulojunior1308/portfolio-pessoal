package estoque.com.br.services;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

import java.util.List;
import java.util.logging.Logger;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import estoque.com.br.controllers.UsuarioController;
import estoque.com.br.data.vo.UsuarioVO;
import estoque.com.br.exceptions.ResourceNotFoundException;
import estoque.com.br.model.Permission;
import estoque.com.br.model.Usuario;
import estoque.com.br.repositories.PermissionRepository;
import estoque.com.br.repositories.UsuarioRepository;

@Service
public class UsuarioService implements UserDetailsService {

    private Logger logger = Logger.getLogger(UsuarioService.class.getName());

    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder; 
    
    @Autowired
    private PermissionRepository permissionRepository;
    
    @Autowired
    PagedResourcesAssembler<UsuarioVO> assembler;
    
    @Autowired
    private ModelMapper modelMapper;


    public UsuarioService(UsuarioRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;  
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        logger.info("Finding one user by name " + username + "!");
        Usuario user = repository.findByUsername(username);
        
        List<GrantedAuthority> authorities = user.getPermissions().stream()
            .map(permission -> new SimpleGrantedAuthority(permission.getDescription()))
            .collect(Collectors.toList());

        logger.info("Authorities for " + username + ": " + authorities);
        
        return new org.springframework.security.core.userdetails.User(
            user.getUserName(),
            user.getPassword(),
            user.isEnabled(),
            user.isAccountNonExpired(),
            user.isCredentialsNonExpired(),
            user.isAccountNonLocked(),
            authorities
        );
    }
    
    public PagedModel<EntityModel<UsuarioVO>> findAll(Pageable pageable){
    	
    	logger.info("Procurando todos os usuários");
    	
    	var usuariosPage = repository.findAll(pageable);
    	
    	var usuariosVOs = usuariosPage.map(p -> modelMapper.map(p, UsuarioVO.class));
    	usuariosVOs.map(p -> p.add(linkTo(methodOn(UsuarioController.class).findById(p.getKey())).withSelfRel()));
    	
    	Link findAllLink = linkTo(
    			methodOn(UsuarioController.class)
    			.findAll(pageable.getPageNumber(),
    					pageable.getPageSize(),
    					"asc")).withSelfRel();
    	
    	return assembler.toModel(usuariosVOs, findAllLink);
    }

    public PagedModel<EntityModel<UsuarioVO>> findUsuarioByUserName(String userName, Pageable pageable) {
        logger.info("Procurando usuario por nome");

        var usuarioPage = repository.findByUserName(userName, pageable);

        // Verifica se a página está vazia
        if (usuarioPage.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado");
        }

        var usuarioVosPage = usuarioPage.map(b -> modelMapper.map(b, UsuarioVO.class));
        usuarioVosPage.map(
                b -> b.add(
                        linkTo(methodOn(UsuarioController.class)
                                .findById(b.getKey())).withSelfRel()));

        Link link = linkTo(
                methodOn(UsuarioController.class)
                        .findAll(pageable.getPageNumber(),
                                pageable.getPageSize(),
                                "asc")).withSelfRel();

        return assembler.toModel(usuarioVosPage, link);
    }

    
    
    public UsuarioVO findById(Long id) {
    	
    	logger.info("Procurando um usuario");
    	
    	var entity = repository.findById(id)
    			.orElseThrow(() -> new ResourceNotFoundException("Não foi encontrado esse ID!"));
    	
    	var vo = modelMapper.map(entity, UsuarioVO.class);
    	
    	return vo.add(linkTo(methodOn(UsuarioController.class).findById(id)).withSelfRel());
    }
    
    public UsuarioVO criarUsuario(Usuario usuario, Pageable pageable) {
        
        Usuario usuarioExistente = repository.findByUserName(usuario.getUserName(), pageable).getContent().stream().findFirst().orElse(null);
        if(usuarioExistente != null) {
            throw new IllegalArgumentException("Usuário já existe");
        }

        // Salva permissões sem ID no repositório
        List<Permission> permissions = usuario.getPermissions();
        for (Permission permission : permissions) {
            if (permission.getId() == null) {
                permissionRepository.save(permission);
            }
        }

        // Codifica a senha antes de salvar o usuário
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        Usuario usuarioSalvo = repository.save(usuario);

        // Mapeia o usuário salvo para UsuarioVO e adiciona o link self-relacional
        UsuarioVO usuarioVO = modelMapper.map(usuarioSalvo, UsuarioVO.class);
        usuarioVO.add(linkTo(methodOn(UsuarioController.class).findById(usuarioVO.getKey())).withSelfRel());

        return usuarioVO;
    }

    public UsuarioVO update(Long id, Usuario usuarioAtualizado) {
        Usuario usuarioExistente = repository.findById(id)
            .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));

        // Verifica se uma nova senha foi fornecida e, se sim, criptografa
        if (usuarioAtualizado.getPassword() != null && !usuarioAtualizado.getPassword().isEmpty()) {
            usuarioExistente.setPassword(passwordEncoder.encode(usuarioAtualizado.getPassword()));
        }

        // Atualiza outros campos do usuário
        usuarioExistente.setFullName(usuarioAtualizado.getFullName());
        usuarioExistente.setUserName(usuarioAtualizado.getUserName());

        // Atualiza permissões
        List<Permission> permissions = usuarioAtualizado.getPermissions();
        for (Permission permission : permissions) {
            if (permission.getId() == null) {
                // Salva novas permissões que ainda não existem no banco
                permissionRepository.save(permission);
            }
        }
        usuarioExistente.setPermissions(permissions);

        Usuario usuarioAtualizadoSalvo = repository.save(usuarioExistente);

        // Mapeia o usuário atualizado para UsuarioVO e adiciona o link self-relacional
        UsuarioVO usuarioVO = modelMapper.map(usuarioAtualizadoSalvo, UsuarioVO.class);
        usuarioVO.add(linkTo(methodOn(UsuarioController.class).findById(id)).withSelfRel());

        return usuarioVO;
    }


    
    public void delete(Long id) {
    	
    	logger.info("Deletando um usuario");
    	
    	var entity = repository.findById(id)
    			.orElseThrow(() -> new ResourceNotFoundException("ID não encontrado!"));
    	repository.delete(entity);
    }
}
