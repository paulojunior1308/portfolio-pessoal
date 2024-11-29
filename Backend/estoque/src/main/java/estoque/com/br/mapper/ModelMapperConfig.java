package estoque.com.br.mapper;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.modelmapper.Converter;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.modelmapper.spi.MappingContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import estoque.com.br.data.vo.ClienteVO;
import estoque.com.br.data.vo.ItemOrcamentoVO;
import estoque.com.br.data.vo.OrcamentoVO;
import estoque.com.br.data.vo.PermissionVO;
import estoque.com.br.data.vo.ProdutoVO;
import estoque.com.br.data.vo.UsuarioVO;
import estoque.com.br.model.Cliente;
import estoque.com.br.model.ItemOrcamento;
import estoque.com.br.model.Orcamento;
import estoque.com.br.model.Permission;
import estoque.com.br.model.Produto;
import estoque.com.br.model.Usuario;

@Configuration
public class ModelMapperConfig {
    @Bean
    public ModelMapper modelMapper() {
        ModelMapper mapper = new ModelMapper();
        
        Converter<Collection<?>, List<?>> collectionToListConverter = new Converter<Collection<?>, List<?>>() {
            @Override
            public List<?> convert(MappingContext<Collection<?>, List<?>> context) {
                return new ArrayList<>(context.getSource());
            }
        };
        
        mapper.addConverter(collectionToListConverter);
        mapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);

        mapper.createTypeMap(Orcamento.class, OrcamentoVO.class)
              .addMappings(m -> {
            	  m.map(Orcamento::getId, OrcamentoVO::setKey);
                  m.map(src -> src.getCliente().getId(), (dest, v) -> dest.setClienteId((Long) v));
                  m.map(src -> src.getUsuario().getId(), (dest, v) -> dest.setVendedorId((Long) v));
              });

        mapper.createTypeMap(OrcamentoVO.class, Orcamento.class)
              .addMappings(m -> {
            	  m.map(OrcamentoVO::getKey, Orcamento::setId);
                  m.map(OrcamentoVO::getClienteId, (dest, v) -> dest.getCliente().setId((Long) v));
                  m.map(OrcamentoVO::getVendedorId, (dest, v) -> dest.getUsuario().setId((Long) v));
              });
            
        mapper.createTypeMap(ItemOrcamento.class, ItemOrcamentoVO.class)
        .addMappings(m -> {
        	m.map(ItemOrcamento::getId, ItemOrcamentoVO::setKey);
        	m.map(src -> src.getProduto().getId(), (dest, v) -> dest.setProdutoId((Long) v));
        	m.map(src -> src.getOrcamento().getId(), (dest, v) -> dest.setOrcamentoId((Long) v));
        });
        
        mapper.createTypeMap(ItemOrcamentoVO.class, ItemOrcamento.class)
        .addMappings(m -> {
        	m.map(ItemOrcamentoVO::getKey, ItemOrcamento::setId);
        	m.map(ItemOrcamentoVO::getProdutoId, (dest, v) -> dest.getProduto().setId((Long) v));
        	m.map(ItemOrcamentoVO::getOrcamentoId, (dest, v) -> dest.getOrcamento().setId((Long) v));
        });
            
        mapper.createTypeMap(Cliente.class, ClienteVO.class)
              .addMappings(m -> m.map(Cliente::getId, ClienteVO::setKey));

        mapper.createTypeMap(ClienteVO.class, Cliente.class)
              .addMappings(m -> m.map(ClienteVO::getKey, Cliente::setId));

        mapper.createTypeMap(Produto.class, ProdutoVO.class)
              .addMappings(m -> m.map(Produto::getId, ProdutoVO::setKey));

        mapper.createTypeMap(ProdutoVO.class, Produto.class)
              .addMappings(m -> m.map(ProdutoVO::getKey, Produto::setId));
        
        mapper.createTypeMap(Usuario.class, UsuarioVO.class)
        .addMappings(m -> {
            m.map(Usuario::getId, UsuarioVO::setKey);
            m.using(ctx -> {
                @SuppressWarnings("unchecked")
				List<Permission> sourcePermissions = (List<Permission>) ctx.getSource();
                List<PermissionVO> permissionVOList = new ArrayList<>();
                if (sourcePermissions != null) {
                    for (Permission permission : sourcePermissions) {
                        PermissionVO permissionVO = new PermissionVO();
                        permissionVO.setKey(permission.getId());
                        permissionVO.setDescription(permission.getDescription());
                        permissionVOList.add(permissionVO);
                    }
                }
                return permissionVOList;
            }).map(Usuario::getPermissions, UsuarioVO::setPermissions);
        });



        
        mapper.createTypeMap(Permission.class, PermissionVO.class)
        .addMappings(m -> m.map(Permission::getId, PermissionVO::setKey));
        
        mapper.createTypeMap(PermissionVO.class, Permission.class)
        .addMappings(m -> m.map(PermissionVO::getKey, Permission::setId));

        return mapper;
    }
}
