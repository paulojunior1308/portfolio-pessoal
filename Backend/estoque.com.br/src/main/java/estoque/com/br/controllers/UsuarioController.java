package estoque.com.br.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.jpa.domain.JpaSort;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import estoque.com.br.data.vo.UsuarioVO;
import estoque.com.br.model.Usuario;
import estoque.com.br.services.UsuarioService;
import estoque.com.br.util.MediaType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/usuarios/v1")
@Tag(name = "Usuario", description = "Endpoints para Usuarios")
public class UsuarioController {

    
    @Autowired
    private UsuarioService usuarioService;
    
    @GetMapping(produces = { MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML, MediaType.APPLICATION_YML })
	@Operation(summary = "Procurando todos os clientes", description = "Procurando todos os usuarios",
		tags = {"Usuario"},
		responses = {
				@ApiResponse(description = "Sucess", responseCode = "200",
					content = {
						@Content(
							mediaType = "application/json",
							array = @ArraySchema(schema = @Schema(implementation = UsuarioVO.class))
						)
					}
				),
				@ApiResponse(description = "Bad Request", responseCode = "400", content = @Content),
				@ApiResponse(description = "Unauthorized", responseCode = "401", content = @Content),
				@ApiResponse(description = "Not Found", responseCode = "404", content = @Content),
				@ApiResponse(description = "Internal Error", responseCode = "500", content = @Content),
			}
		)
    public ResponseEntity<PagedModel<EntityModel<UsuarioVO>>> findAll(
    		@RequestParam(value = "page", defaultValue = "0") Integer page,
    		@RequestParam(value = "size", defaultValue = "12") Integer size,
    		@RequestParam(value = "direction", defaultValue = "asc") String direction
    		){
    	var sortDirection = "desc".equalsIgnoreCase(direction) ? Direction.DESC : Direction.ASC;
    	
    	Pageable pageable = PageRequest.of(page, size, JpaSort.unsafe(sortDirection, "userName"));

    	return ResponseEntity.ok(usuarioService.findAll(pageable));
    }
        
    
    @GetMapping(value = "/findUsuariosByUserName/{userName}", produces = { MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML, MediaType.APPLICATION_YML })
	@Operation(summary = "Procurando usuasrios por nome", description = "Procurando usuarios por nome",
	tags = { "Usuario" },
	responses = {
			@ApiResponse(description = "Success", responseCode = "200",
					content = { @Content(mediaType = "application/json",
					array = @ArraySchema(schema = @Schema(implementation = UsuarioVO.class))
							)
			}),
			@ApiResponse(description = "Bad Request", responseCode = "400", content = @Content),
			@ApiResponse(description = "Unauthorized", responseCode = "401", content = @Content),
			@ApiResponse(description = "Not Found", responseCode = "404", content = @Content),
			@ApiResponse(description = "Internal Error", responseCode = "500", content = @Content)
	}
			)
	public ResponseEntity<PagedModel<EntityModel<UsuarioVO>>> findUsuariosByUserName (
			@PathVariable(value = "userName") String userName,
			@RequestParam(value = "page", defaultValue = "0") Integer page,
			@RequestParam(value = "size", defaultValue = "12") Integer size,
			@RequestParam(value = "direction", defaultValue = "asc") String direction)
	{

		var sortDirection = "desc".equalsIgnoreCase(direction) ? Direction.DESC : Direction.ASC;

		Pageable pageable = PageRequest.of(page, size, JpaSort.unsafe(sortDirection, "userName"));

		return ResponseEntity.ok(usuarioService.findUsuarioByUserName(userName, pageable));
	}
    
    
    @GetMapping(value = "/{id}",
			produces = { MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML, MediaType.APPLICATION_YML  })
		@Operation(summary = "Procurando usuario", description = "Procurando usuario",
			tags = {"Usuario"},
			responses = {
				@ApiResponse(description = "Success", responseCode = "200",
					content = @Content(schema = @Schema(implementation = UsuarioVO.class))
				),
				@ApiResponse(description = "No Content", responseCode = "204", content = @Content),
				@ApiResponse(description = "Bad Request", responseCode = "400", content = @Content),
				@ApiResponse(description = "Unauthorized", responseCode = "401", content = @Content),
				@ApiResponse(description = "Not Found", responseCode = "404", content = @Content),
				@ApiResponse(description = "Internal Error", responseCode = "500", content = @Content),
			}
		)
		public UsuarioVO findById(@PathVariable(value = "id") Long id) {
			return usuarioService.findById(id);
		}

    
    
    @PostMapping(produces = { MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML, MediaType.APPLICATION_YML },
            	consumes = { MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML, MediaType.APPLICATION_YML })
    @Operation(summary = "Criando usuario", description = "Criando usuario",
	tags = {"Usuario"},
	responses = {
		@ApiResponse(description = "Success", responseCode = "200",
			content = @Content(schema = @Schema(implementation = UsuarioVO.class))
		),
		@ApiResponse(description = "No Content", responseCode = "204", content = @Content),
		@ApiResponse(description = "Bad Request", responseCode = "400", content = @Content),
		@ApiResponse(description = "Unauthorized", responseCode = "401", content = @Content),
		@ApiResponse(description = "Not Found", responseCode = "404", content = @Content),
		@ApiResponse(description = "Internal Error", responseCode = "500", content = @Content),
	}
)
    public ResponseEntity<UsuarioVO> criarUsuario(@RequestBody Usuario usuario,
                                             @RequestParam(value = "page", defaultValue = "0") Integer page,
                                             @RequestParam(value = "size", defaultValue = "12") Integer size,
                                             @RequestParam(value = "direction", defaultValue = "asc") String direction) {

   var sortDirection = "desc".equalsIgnoreCase(direction) ? Direction.DESC : Direction.ASC;
   Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, "userName"));

   UsuarioVO usuarioCriado = usuarioService.criarUsuario(usuario, pageable);
   return ResponseEntity.ok(usuarioCriado);
}

    @PutMapping(value = "/{id}", produces = { MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML, MediaType.APPLICATION_YML },
            consumes = { MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML, MediaType.APPLICATION_YML })
 @Operation(summary = "Atualizando usuário", description = "Atualiza um usuário existente",
 tags = {"Usuario"},
 responses = {
     @ApiResponse(description = "Success", responseCode = "200",
         content = @Content(schema = @Schema(implementation = UsuarioVO.class))
     ),
     @ApiResponse(description = "No Content", responseCode = "204", content = @Content),
     @ApiResponse(description = "Bad Request", responseCode = "400", content = @Content),
     @ApiResponse(description = "Unauthorized", responseCode = "401", content = @Content),
     @ApiResponse(description = "Not Found", responseCode = "404", content = @Content),
     @ApiResponse(description = "Internal Error", responseCode = "500", content = @Content),
 }
 )
 public ResponseEntity<UsuarioVO> update(@PathVariable("id") Long id, @RequestBody Usuario usuarioAtualizado) {
     UsuarioVO usuarioAtualizadoRetorno = usuarioService.update(id, usuarioAtualizado);
     return ResponseEntity.ok(usuarioAtualizadoRetorno);
 }




	@DeleteMapping(value = "/{id}")
	@Operation(summary = "Deletando Usuario",
		description = "Deletando usuario passando por JSON, XML or YML",
		tags = {"Usuario"},
		responses = {
			@ApiResponse(description = "No Content", responseCode = "204", content = @Content),
			@ApiResponse(description = "Bad Request", responseCode = "400", content = @Content),
			@ApiResponse(description = "Unauthorized", responseCode = "401", content = @Content),
			@ApiResponse(description = "Not Found", responseCode = "404", content = @Content),
			@ApiResponse(description = "Internal Error", responseCode = "500", content = @Content),
		}
	)
	public ResponseEntity<?> delete(@PathVariable(value = "id") Long id) {
		usuarioService.delete(id);
		return ResponseEntity.noContent().build();
	}
}