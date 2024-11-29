package estoque.com.br.integrationtests.controller.cors.withjson;

import static io.restassured.RestAssured.given;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import java.math.BigDecimal;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Arrays;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.boot.test.context.SpringBootTest;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

import estoque.com.br.configs.TestConfigs;
import estoque.com.br.integrationtests.vo.AccountCredentialsVO;
import estoque.com.br.integrationtests.vo.ItemOrcamentoVO;
import estoque.com.br.integrationtests.vo.OrcamentoVO;
import estoque.com.br.integrationtests.vo.TokenVO;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.filter.log.LogDetail;
import io.restassured.filter.log.RequestLoggingFilter;
import io.restassured.filter.log.ResponseLoggingFilter;
import io.restassured.specification.RequestSpecification;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@TestMethodOrder(OrderAnnotation.class)
public class OrcamentoControllerCorsJsonTest {

    private static RequestSpecification specification;
    private static ObjectMapper objectMapper;

    private static OrcamentoVO orcamento;

    @BeforeAll
    public static void setup() {
        objectMapper = new ObjectMapper();
        objectMapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);

        orcamento = new OrcamentoVO();
    }

    @Test
    @Order(0)
    public void authorization() throws JsonProcessingException {
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
                .setBasePath("/api/orcamento/v1")
                .setPort(TestConfigs.SERVER_PORT)
                .addFilter(new RequestLoggingFilter(LogDetail.ALL))
                .addFilter(new ResponseLoggingFilter(LogDetail.ALL))
                .build();
    }

    @Test
    @Order(1)
    public void testCreate() throws JsonProcessingException {
        mockOrcamento();

        var content = given().spec(specification)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .header(TestConfigs.HEADER_PARAM_ORIGIN, TestConfigs.ORIGIN_ERUDIO)
                .body(orcamento)
                .when()
                .post()
                .then()
                .statusCode(200)
                .extract()
                .body()
                .asString();

        OrcamentoVO persistedOrcamento = objectMapper.readValue(content, OrcamentoVO.class);

        orcamento = persistedOrcamento;

        assertNotNull(persistedOrcamento);

        assertNotNull(persistedOrcamento.getId());
        assertNotNull(persistedOrcamento.getDataCriacao());
        assertNotNull(persistedOrcamento.getDataValidade());
        assertNotNull(persistedOrcamento.getStatus());
        assertNotNull(persistedOrcamento.getClienteId());
        assertNotNull(persistedOrcamento.getRazaoSocial());
        assertNotNull(persistedOrcamento.getUsuarioId());
        assertNotNull(persistedOrcamento.getItens());
        assertNotNull(persistedOrcamento.getTotal());

        assertEquals(LocalDate.parse("2024-10-31"), persistedOrcamento.getDataCriacao().toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
        assertEquals(LocalDate.parse("2024-10-31"), persistedOrcamento.getDataValidade().toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
        assertEquals("Pendente", persistedOrcamento.getStatus());
        assertEquals(Long.valueOf(1L), persistedOrcamento.getClienteId());
        assertEquals("Empresa a", persistedOrcamento.getRazaoSocial());
        assertEquals(Long.valueOf(3L), persistedOrcamento.getUsuarioId());
        assertEquals(new BigDecimal("23.00"), BigDecimal.valueOf(persistedOrcamento.getTotal()));

        assertEquals(1, persistedOrcamento.getItens().size());
        assertEquals("Produto a", persistedOrcamento.getItens().get(0));
    }

    private void mockOrcamento() {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");

        try {
            orcamento.setDataCriacao(sdf.parse("2024-10-31"));
            orcamento.setDataValidade(sdf.parse("2024-10-31"));
        } catch (ParseException e) {
            e.printStackTrace();
        }

        orcamento.setStatus("Pendente");
        orcamento.setClienteId(1L);
        orcamento.setRazaoSocial("Empresa a");
        orcamento.setUsuarioId(3L);

        ItemOrcamentoVO item = new ItemOrcamentoVO();
        item.setOrcamentoId(null); // Certifique-se de que o id do orcamento está definido corretamente se necessário
        item.setProdutoId(1L);
        item.setQuantidade(new BigDecimal("1.00"));
        item.setPrecoUnitario(23.00);

        orcamento.setItens(Arrays.asList(item));

        orcamento.setTotal(23.00);
    }

}
