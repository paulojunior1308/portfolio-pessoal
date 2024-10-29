package estoque.com.br.services;

import java.util.ArrayList;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.PagedModel;
import org.springframework.hateoas.server.mvc.WebMvcLinkBuilder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import estoque.com.br.controllers.OrcamentoController;
import estoque.com.br.data.vo.ItemOrcamentoVO;
import estoque.com.br.data.vo.OrcamentoVO;
import estoque.com.br.exceptions.RequiredObjectIsNullException;
import estoque.com.br.exceptions.ResourceNotFoundException;
import estoque.com.br.model.ItemOrcamento;
import estoque.com.br.model.Orcamento;
import estoque.com.br.repositories.ClienteRepository;
import estoque.com.br.repositories.OrcamentoRepository;
import estoque.com.br.repositories.ProdutoRepository;

@Service
public class OrcamentoService {
    private Logger logger = Logger.getLogger(OrcamentoService.class.getName());

    @Autowired
    OrcamentoRepository repository;

    @Autowired
    ProdutoRepository produtoRepository;

    @Autowired
    ClienteRepository clienteRepository;

    @Autowired
    PagedResourcesAssembler<OrcamentoVO> assembler;

    @Autowired
    private ModelMapper modelMapper;

    @Transactional
    public PagedModel<EntityModel<OrcamentoVO>> findAll(Pageable pageable) {
        logger.info("Procurando todos os orcamentos");
        var orcamentosPage = repository.findAll(pageable);
        var orcamentosVOs = orcamentosPage.map(p -> {
            OrcamentoVO orcamentoVO = modelMapper.map(p, OrcamentoVO.class);
            logger.log(Level.INFO, "Mapping Orcamento to OrcamentoVO: {0}", orcamentoVO);
            orcamentoVO.setItens(new ArrayList<>(orcamentoVO.getItens() != null ? orcamentoVO.getItens() : new ArrayList<>()));
            orcamentoVO.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(OrcamentoController.class).findById(p.getId())).withSelfRel());
            return orcamentoVO;
        });
        Link findAllLink = WebMvcLinkBuilder.linkTo(
                WebMvcLinkBuilder.methodOn(OrcamentoController.class)
                        .findAll(pageable.getPageNumber(), pageable.getPageSize(), "asc")).withSelfRel();
        return assembler.toModel(orcamentosVOs, findAllLink);
    }

    @Transactional
    public PagedModel<EntityModel<OrcamentoVO>> findOrcamentoById(Long id, Pageable pageable) {
        logger.info("Procurando orcamento por id");
        var orcamentoPage = repository.findOrcamentosById(id, pageable);
        var orcamentoVosPage = orcamentoPage.map(b -> {
            OrcamentoVO orcamentoVO = modelMapper.map(b, OrcamentoVO.class);
            logger.log(Level.INFO, "Mapping Orcamento to OrcamentoVO: {0}", orcamentoVO);
            orcamentoVO.setItens(new ArrayList<>(orcamentoVO.getItens() != null ? orcamentoVO.getItens() : new ArrayList<>()));
            orcamentoVO.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(OrcamentoController.class).findById(b.getId())).withSelfRel());
            return orcamentoVO;
        });
        Link link = WebMvcLinkBuilder.linkTo(
                WebMvcLinkBuilder.methodOn(OrcamentoController.class)
                        .findAll(pageable.getPageNumber(), pageable.getPageSize(), "asc")).withSelfRel();
        return assembler.toModel(orcamentoVosPage, link);
    }

    @Transactional
    public OrcamentoVO findById(Long id) {
        logger.info("Procurando um orcamento");
        var entity = repository.findByIdWithItens(id);
        
        if (entity == null) {
            throw new ResourceNotFoundException("Não foi encontrado esse ID!");
        }

        var vo = modelMapper.map(entity, OrcamentoVO.class);
        logger.log(Level.INFO, "Mapping Orcamento to OrcamentoVO: {0}", vo);
        vo.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(OrcamentoController.class).findById(id)).withSelfRel());
        return vo;
    }



    @Transactional
    public OrcamentoVO create(OrcamentoVO orcamento) {
        if (orcamento == null) {
            throw new RequiredObjectIsNullException();
        }
        logger.info("Criando um orcamento");


        var entity = modelMapper.map(orcamento, Orcamento.class);


        for (ItemOrcamento item : entity.getItens()) {
            item.setOrcamento(entity);
        }

        var vo = modelMapper.map(repository.save(entity), OrcamentoVO.class);


        vo.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(OrcamentoController.class).findById(vo.getKey())).withSelfRel());
        return vo;
    }


    @Transactional
    public OrcamentoVO update(OrcamentoVO orcamento) {
        if (orcamento == null) {
            throw new RequiredObjectIsNullException();
        }
        logger.info("Alterando o orcamento");

        var produtos = produtoRepository.findAllById(
            orcamento.getItens().stream()
                .map(ItemOrcamentoVO::getProdutoId)
                .collect(Collectors.toList())
        );
        
        var cliente = clienteRepository.findById(orcamento.getClienteId())
            .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado!"));

        var entity = repository.findById(orcamento.getKey())
            .orElseThrow(() -> new ResourceNotFoundException("ID Não encontrado!"));

        entity.setCliente(cliente);
        entity.setDataValidade(orcamento.getDataValidade());
        entity.setStatus(orcamento.getStatus());
        entity.setTotal(orcamento.getTotal());

        entity.getItens().clear();
        
        if (!orcamento.getItens().isEmpty()) {
            for (ItemOrcamentoVO vo : orcamento.getItens()) {
                ItemOrcamento item = new ItemOrcamento();
                item.setProduto(
                    produtos.stream()
                        .filter(p -> p.getId().equals(vo.getProdutoId()))
                        .findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado!"))
                );
                item.setQuantidade(vo.getQuantidade());
                item.setPrecoUnitario(vo.getPrecoUnitario());
                item.setOrcamento(entity);
                entity.getItens().add(item);
            }
        }

        var vo = modelMapper.map(repository.save(entity), OrcamentoVO.class);
        vo.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(OrcamentoController.class).findById(vo.getKey())).withSelfRel());
        return vo;
    }



    @Transactional
    public void delete(Long id) {
        logger.info("Deletando o orcamento");
        var entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ID não encontrado!"));
        repository.delete(entity);
    }
}
