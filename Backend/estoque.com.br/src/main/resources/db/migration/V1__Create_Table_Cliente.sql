CREATE TABLE `clientes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `razao_social` varchar(100) NOT NULL,
  `inscricao_estadual` varchar(9) NOT NULL,
  `cnpj` varchar(18) NOT NULL,
  `endereco` varchar(255) NOT NULL,
  `telefone` varchar(15) NOT NULL,
  `email` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ;