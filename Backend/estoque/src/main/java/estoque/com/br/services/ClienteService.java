package estoque.com.br.services;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

import java.util.logging.Logger;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.PagedModel;
import org.springframework.stereotype.Service;

import estoque.com.br.controllers.ClienteController;
import estoque.com.br.data.vo.ClienteVO;
import estoque.com.br.exceptions.RequiredObjectIsNullException;
import estoque.com.br.exceptions.ResourceNotFoundException;
import estoque.com.br.model.Cliente;
import estoque.com.br.repositories.ClienteRepository;
import estoque.com.br.repositories.OrcamentoRepository;

@Service
public class ClienteService {

    private Logger logger = Logger.getLogger(ClienteService.class.getName());

    @Autowired
    ClienteRepository repository;
    
    @Autowired
    OrcamentoRepository  orcamentoRepository;

    @Autowired
    PagedResourcesAssembler<ClienteVO> assembler;

    @Autowired
    private ModelMapper modelMapper;

    public PagedModel<EntityModel<ClienteVO>> findAll(Pageable pageable) {

        logger.info("Procurando todos os clientes");

        var clientesPage = repository.findAll(pageable);

        var clientesVOs = clientesPage.map(p -> modelMapper.map(p, ClienteVO.class));
        clientesVOs.map(p -> p.add(linkTo(methodOn(ClienteController.class).findById(p.getKey())).withSelfRel()));

        Link findAllLink = linkTo(
                methodOn(ClienteController.class)
                    .findAll(pageable.getPageNumber(),
                            pageable.getPageSize(),
                            "asc")).withSelfRel();

        return assembler.toModel(clientesVOs, findAllLink);
    }

    public PagedModel<EntityModel<ClienteVO>> findClienteByName(String razaoSocial, Pageable pageable) {

        logger.info("Procurando cliente por nome");

        var clientePage = repository.findClientesByName(razaoSocial, pageable);

        var clienteVosPage = clientePage.map(b -> modelMapper.map(b, ClienteVO.class));
        clienteVosPage.map(
                    b -> b.add(
                        linkTo(methodOn(ClienteController.class)
                                .findById(b.getKey())).withSelfRel()));

        Link link = linkTo(
                methodOn(ClienteController.class)
                .findAll(pageable.getPageNumber(),
                        pageable.getPageSize(),
                        "asc")).withSelfRel();

        return assembler.toModel(clienteVosPage, link);
    }

    public ClienteVO findById(Long id) {

        logger.info("Procurando um cliente");

        var entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Não foi encontrado esse ID!"));
        var vo = modelMapper.map(entity, ClienteVO.class);
        vo.add(linkTo(methodOn(ClienteController.class).findById(id)).withSelfRel());
        return vo;
    }

    public ClienteVO create(ClienteVO cliente) {

        if (cliente == null) {
            throw new RequiredObjectIsNullException();
        }

        logger.info("Criando um cliente");
        var entity = modelMapper.map(cliente, Cliente.class);
        var vo = modelMapper.map(repository.save(entity), ClienteVO.class);
        vo.add(linkTo(methodOn(ClienteController.class).findById(vo.getKey())).withSelfRel());
        return vo;
    }

    public ClienteVO update(ClienteVO cliente) {

        if (cliente == null) {
            throw new RequiredObjectIsNullException();
        }

        logger.info("Alterando o cliente");

        var entity = repository.findById(cliente.getKey())
                .orElseThrow(() -> new ResourceNotFoundException("ID Não encontrado!"));

        entity.setTelefone(cliente.getTelefone());
        entity.setEmail(cliente.getEmail());
        entity.setCnpj(cliente.getCnpj());
        entity.setEndereco(cliente.getEndereco());
        entity.setInscricaoEstadual(cliente.getInscricaoEstadual());
        entity.setRazaoSocial(cliente.getRazaoSocial());

        var vo =  modelMapper.map(repository.save(entity), ClienteVO.class);
        vo.add(linkTo(methodOn(ClienteController.class).findById(vo.getKey())).withSelfRel());
        return vo;
    }

    public void delete(Long id) {

        logger.info("Deletando o cliente");

        var entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ID não encontrado!"));
        orcamentoRepository.deleteByClienteId(entity.getId());
        repository.delete(entity);
    }
}