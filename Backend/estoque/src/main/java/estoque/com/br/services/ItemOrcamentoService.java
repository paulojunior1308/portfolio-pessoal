package estoque.com.br.services;

import java.util.List;
import java.util.logging.Logger;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import estoque.com.br.data.vo.ItemOrcamentoVO;
import estoque.com.br.exceptions.RequiredObjectIsNullException;
import estoque.com.br.exceptions.ResourceNotFoundException;
import estoque.com.br.model.ItemOrcamento;
import estoque.com.br.repositories.ItemOrcamentoRepository;
import estoque.com.br.repositories.ProdutoRepository;

@Service
public class ItemOrcamentoService {

    private Logger logger = Logger.getLogger(ItemOrcamentoService.class.getName());

    @Autowired
    ItemOrcamentoRepository repository;

    @Autowired
    ProdutoRepository produtoRepository;

    @Autowired
    private ModelMapper modelMapper;

    public List<ItemOrcamentoVO> findAll() {

        logger.info("Procurando todos os itens de orçamento");

        var itens = repository.findAll();
        return itens.stream()
                    .map(item -> modelMapper.map(item, ItemOrcamentoVO.class))
                    .collect(Collectors.toList());
    }

    public ItemOrcamentoVO findById(Long id) {

        logger.info("Procurando item de orçamento por ID");

        var entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Não foi encontrado esse ID!"));
        return modelMapper.map(entity, ItemOrcamentoVO.class);
    }

    public ItemOrcamentoVO create(ItemOrcamentoVO itemOrcamentoVO) {

        if (itemOrcamentoVO == null) {
            throw new RequiredObjectIsNullException();
        }

        logger.info("Criando item de orçamento");

        var produto = produtoRepository.findById(itemOrcamentoVO.getProdutoId())
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado!"));

        var entity = modelMapper.map(itemOrcamentoVO, ItemOrcamento.class);
        entity.setProduto(produto);
        
        var vo = modelMapper.map(repository.save(entity), ItemOrcamentoVO.class);
        return vo;
    }

    public ItemOrcamentoVO update(ItemOrcamentoVO itemOrcamentoVO) {

        if (itemOrcamentoVO == null) {
            throw new RequiredObjectIsNullException();
        }

        logger.info("Alterando item de orçamento");

        var entity = repository.findById(itemOrcamentoVO.getKey())
                .orElseThrow(() -> new ResourceNotFoundException("ID Não encontrado!"));

        var produto = produtoRepository.findById(itemOrcamentoVO.getProdutoId())
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado!"));

        entity.setProduto(produto);
        entity.setQuantidade(itemOrcamentoVO.getQuantidade());
        entity.setPrecoUnitario(itemOrcamentoVO.getPrecoUnitario());

        var vo = modelMapper.map(repository.save(entity), ItemOrcamentoVO.class);
        return vo;
    }

    public void delete(Long id) {

        logger.info("Deletando item de orçamento");

        var entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ID não encontrado!"));
        repository.delete(entity);
    }
   }