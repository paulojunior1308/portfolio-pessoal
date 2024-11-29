CREATE TABLE `itens_orcamento` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `orcamento_id` BIGINT,
    `produto_id` BIGINT,
    `quantidade` DECIMAL(10,2),
    `preco_unitario` DECIMAL(10, 2),
    CONSTRAINT fk_orcamento FOREIGN KEY (`orcamento_id`) REFERENCES orcamentos(id),
    CONSTRAINT fk_produto FOREIGN KEY (`produto_id`) REFERENCES produtos(id)
);
