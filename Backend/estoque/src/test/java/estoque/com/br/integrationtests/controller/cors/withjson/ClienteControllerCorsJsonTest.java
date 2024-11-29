package estoque.com.br.integrationtests.controller.cors.withjson;

import static io.restassured.RestAssured.given;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.boot.test.context.SpringBootTest;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import estoque.com.br.configs.TestConfigs;
import estoque.com.br.integrationtests.vo.AccountCredentialsVO;
import estoque.com.br.integrationtests.vo.ClienteVO;
import estoque.com.br.integrationtests.vo.TokenVO;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.filter.log.LogDetail;
import io.restassured.filter.log.RequestLoggingFilter;
import io.restassured.filter.log.ResponseLoggingFilter;
import io.restassured.specification.RequestSpecification;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@TestMethodOrder(OrderAnnotation.class)
public class ClienteControllerCorsJsonTest{
	
	private static RequestSpecification specification;
	private static ObjectMapper objectMapper;
	
	private static ClienteVO cliente;
	
	@BeforeAll
	public static void setup() {
		objectMapper = new ObjectMapper();
		objectMapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
		
		cliente = new ClienteVO();
	}

	@Test
	@Order(0)
	public void authorization() throws JsonMappingException, JsonProcessingException {
		AccountCredentialsVO user = new AccountCredentialsVO("paulo", "teste123");
		
		var accessToken = given()
				.basePath("/auth/signin")
					.port(TestConfigs.SERVER_PORT)
					.contentType(TestConfigs.CONTENT_TYPE_JSON)
				.body(user)
					.when()
				.post()
					.then()
						.statusCode(200)
							.extract()
							.body()
								.as(TokenVO.class)
						.getAccessToken();
		
		specification = new RequestSpecBuilder()
				.addHeader(TestConfigs.HEADER_PARAM_AUTHORIZATION, "Bearer " + accessToken)
				.setBasePath("/api/cliente/v1")
				.setPort(TestConfigs.SERVER_PORT)
					.addFilter(new RequestLoggingFilter(LogDetail.ALL))
					.addFilter(new ResponseLoggingFilter(LogDetail.ALL))
				.build();
	}
	
	@Test
	@Order(1)
	public void testCreate() throws JsonMappingException, JsonProcessingException {
		
		mockCliente();
		
		var content = given().spec(specification)
				.contentType(TestConfigs.CONTENT_TYPE_JSON)
					.header(TestConfigs.HEADER_PARAM_ORIGIN, TestConfigs.ORIGIN_ERUDIO)
					.body(cliente)
					.when()
					.post()
				.then()
					.statusCode(200)
						.extract()
						.body()
							.asString();
		
		ClienteVO persistedCliente = objectMapper.readValue(content, ClienteVO.class);
		
		cliente = persistedCliente;
		
		assertNotNull(persistedCliente);
		
		assertNotNull(persistedCliente.getId());
		assertNotNull(persistedCliente.getRazaoSocial());
		assertNotNull(persistedCliente.getInscricaoEstadual());
		assertNotNull(persistedCliente.getCnpj());
		assertNotNull(persistedCliente.getEndereco());
		assertNotNull(persistedCliente.getEmail());
		assertNotNull(persistedCliente.getTelefone());
		
		assertEquals("Empresa a", persistedCliente.getRazaoSocial());
		assertEquals("111111111", persistedCliente.getInscricaoEstadual());
		assertEquals("11.111.111/1111-11", persistedCliente.getCnpj());
		assertEquals("Endereço empresa a", persistedCliente.getEndereco());
		assertEquals("email@email", persistedCliente.getEmail());
		assertEquals("99999-9999", persistedCliente.getTelefone());
	}
	
	@Test
	@Order(2)
	public void testCreateWithWrongOrigin() throws JsonMappingException, JsonProcessingException {
		
		mockCliente();
		
		var content = given().spec(specification)
				.contentType(TestConfigs.CONTENT_TYPE_JSON)
					.header(TestConfigs.HEADER_PARAM_ORIGIN, TestConfigs.ORIGIN_SEMERU)
					.body(cliente)
					.when()
					.post()
				.then()
					.statusCode(403)
						.extract()
						.body()
							.asString();
		
		assertNotNull(content);
		assertEquals("Invalid CORS request", content);
	}
	
	@Test
	@Order(3)
	public void testFindById() throws JsonMappingException, JsonProcessingException {
		
		var content = given().spec(specification)
				.contentType(TestConfigs.CONTENT_TYPE_JSON)
					.header(TestConfigs.HEADER_PARAM_ORIGIN, TestConfigs.ORIGIN_ERUDIO)
					.pathParam("id", cliente.getId())
					.when()
					.get("{id}")
				.then()
					.statusCode(200)
						.extract()
						.body()
							.asString();
		
		ClienteVO persistedCliente = objectMapper.readValue(content, ClienteVO.class);
		cliente = persistedCliente;
		
		assertNotNull(persistedCliente);
		
		assertNotNull(persistedCliente.getId());
		assertNotNull(persistedCliente.getRazaoSocial());
		assertNotNull(persistedCliente.getInscricaoEstadual());
		assertNotNull(persistedCliente.getCnpj());
		assertNotNull(persistedCliente.getEndereco());
		assertNotNull(persistedCliente.getEmail());
		assertNotNull(persistedCliente.getTelefone());
		
		assertEquals("Empresa a", persistedCliente.getRazaoSocial());
		assertEquals("111111111", persistedCliente.getInscricaoEstadual());
		assertEquals("11.111.111/1111-11", persistedCliente.getCnpj());
		assertEquals("Endereço empresa a", persistedCliente.getEndereco());
		assertEquals("email@email", persistedCliente.getEmail());
		assertEquals("99999-9999", persistedCliente.getTelefone());
	}
	
	@Test
	@Order(4)
	public void testFindByWithWrongOrigin() throws JsonMappingException, JsonProcessingException {
		
		mockCliente();
		
		var content = given().spec(specification)
				.contentType(TestConfigs.CONTENT_TYPE_JSON)
					.header(TestConfigs.HEADER_PARAM_ORIGIN, TestConfigs.ORIGIN_SEMERU)
					.pathParam("id", cliente.getId())
					.when()
					.get("{id}")
				.then()
					.statusCode(403)
						.extract()
						.body()
							.asString();
		
		
		assertNotNull(content);
		assertEquals("Invalid CORS request", content);
		
	}
	
	private void mockCliente() {
		cliente.setRazaoSocial("Empresa a");
		cliente.setInscricaoEstadual("111111111");
		cliente.setCnpj("11.111.111/1111-11");
		cliente.setEndereco("Endereço empresa a");
		cliente.setEmail("email@email");
		cliente.setTelefone("99999-9999");
	}
}
