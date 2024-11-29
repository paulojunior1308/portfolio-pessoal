package estoque.com.br.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;

@Configuration
public class OpenApiConfig {

	@Bean
	OpenAPI customOpenAPI() {
		return new OpenAPI()
				.info(new Info()
						.title("REST API's RESTFull com AWS, Java 23 e Spring Boot 3.3.4")
						.version("v1")
						.description("Descrições sobre a API")
						.termsOfService("https://github.com/paulojunior1308")
						.license(
								new License()
								.name("Apache 2.0")
								.url("https://github.com/paulojunior1308")
								)
						);
	}
}
