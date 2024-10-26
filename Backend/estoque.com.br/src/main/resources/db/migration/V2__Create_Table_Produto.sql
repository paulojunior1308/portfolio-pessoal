CREATE TABLE `produtos` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nome_produto` varchar(80) NOT NULL,
  `tipo_produto` varchar(5) NOT NULL,
  `quantidade_produto` varchar(18) NOT NULL,
  `valor_produto` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`)
) ;