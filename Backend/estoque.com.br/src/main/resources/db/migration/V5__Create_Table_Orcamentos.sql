CREATE TABLE `orcamentos` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `data_criacao` datetime(6),
    `data_validade` datetime(6),
    `status` VARCHAR(20),
    `cliente_id` BIGINT,
    `usuario_id` BIGINT,
    `total` DECIMAL(10, 2),
    CONSTRAINT `fk_orcamento_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`),
    CONSTRAINT `fk_orcamento_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE CASCADE
);
