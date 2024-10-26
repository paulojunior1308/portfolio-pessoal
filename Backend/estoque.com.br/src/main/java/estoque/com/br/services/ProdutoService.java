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

import estoque.com.br.controllers.ProdutoController;
import estoque.com.br.data.vo.ProdutoVO;
import estoque.com.br.exceptions.RequiredObjectIsNullException;
import estoque.com.br.exceptions.ResourceNotFoundException;
import estoque.com.br.model.Produto;
import estoque.com.br.repositories.ProdutoRepository;

@Service
public class ProdutoService {

    private Logger logger = Logger.getLogger(ProdutoService.class.getName());

    @Autowired
    ProdutoRepository repository;

    @Autowired
    PagedResourcesAssembler<ProdutoVO> assembler;

    @Autowired
    private ModelMapper modelMapper;

    public PagedModel<EntityModel<ProdutoVO>> findAll(Pageable pageable) {

        logger.info("Procurando todos os produtos");

        var produtosPage = repository.findAll(pageable);

        var produtosVOs = produtosPage.map(p -> modelMapper.map(p, ProdutoVO.class));
        produtosVOs.map(p -> p.add(linkTo(methodOn(ProdutoController.class).findById(p.getKey())).withSelfRel()));

        Link findAllLink = linkTo(
                methodOn(ProdutoController.class)
                    .findAll(pageable.getPageNumber(),
                            pageable.getPageSize(),
                            "asc")).withSelfRel();

        return assembler.toModel(produtosVOs, findAllLink);
    }

    public PagedModel<EntityModel<ProdutoVO>> findProdutoByName(String nomeProduto, Pageable pageable) {

        logger.info("Procurando produto por nome");

        var produtoPage = repository.findProdutosByName(nomeProduto, pageable);

        var produtoVosPage = produtoPage.map(b -> modelMapper.map(b, ProdutoVO.class));
        produtoVosPage.map(
                    b -> b.add(
                        linkTo(methodOn(ProdutoController.class)
                                .findById(b.getKey())).withSelfRel()));

        Link link = linkTo(
                methodOn(ProdutoController.class)
                .findAll(pageable.getPageNumber(),
                        pageable.getPageSize(),
                        "asc")).withSelfRel();

        return assembler.toModel(produtoVosPage, link);
    }

    public ProdutoVO findById(Long id) {

        logger.info("Procurando um produto");

        var entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Não foi encontrado esse ID!"));
        var vo = modelMapper.map(entity, ProdutoVO.class);
        vo.add(linkTo(methodOn(ProdutoController.class).findById(id)).withSelfRel());
        return vo;
    }

    public ProdutoVO create(ProdutoVO produto) {

        if (produto == null) {
            throw new RequiredObjectIsNullException();
        }

        logger.info("Criando um produto");
        var entity = modelMapper.map(produto, Produto.class);
        var vo = modelMapper.map(repository.save(entity), ProdutoVO.class);
        vo.add(linkTo(methodOn(ProdutoController.class).findById(vo.getKey())).withSelfRel());
        return vo;
    }

    public ProdutoVO update(Long id, ProdutoVO produtoVO) {
        Produto produto = repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado com id: " + id));

        produto.setQuantidadeProduto(produtoVO.getQuantidadeProduto());
        produto.setNomeProduto(produtoVO.getNomeProduto());
        produto.setTipoProduto(produtoVO.getTipoProduto());
        produto.setValor(produtoVO.getValor());
        
        repository.save(produto);

        return new ProdutoVO();
    }

    public void delete(Long id) {

        logger.info("Deletando o produto");

        var entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ID não encontrado!"));
        repository.delete(entity);
    }
}