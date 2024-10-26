package estoque.com.br.exceptions.handler;

import java.util.Date;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import estoque.com.br.exceptions.ExceptionResponse;
import estoque.com.br.exceptions.InvalidJwtAuthenticationException;
import estoque.com.br.exceptions.RequiredObjectIsNullException;
import estoque.com.br.exceptions.ResourceNotFoundException;

@ControllerAdvice
@RestController
public class CustomizedResponseEntityExceptionHandler extends ResponseEntityExceptionHandler {

  @ExceptionHandler(Exception.class)
    public final ResponseEntity<ExceptionResponse> handleAllExceptions(Exception ex, WebRequest request)
    {
      ExceptionResponse exceptionResponse = new ExceptionResponse(
        new Date(),
        ex.getMessage(),
        request.getDescription(false));

      return new ResponseEntity<>(exceptionResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

  @ExceptionHandler(ResourceNotFoundException.class)
    public final ResponseEntity<ExceptionResponse> handleNotFoundExceptions(Exception ex, WebRequest request)
    {
      ExceptionResponse exceptionResponse = new ExceptionResponse(
        new Date(),
        ex.getMessage(),
        request.getDescription(false));

      return new ResponseEntity<>(exceptionResponse, HttpStatus.NOT_FOUND);
    }

  @ExceptionHandler(RequiredObjectIsNullException.class)
  public final ResponseEntity<ExceptionResponse> handleBadRequestExceptions(Exception ex, WebRequest request)
  {
	  ExceptionResponse exceptionResponse = new ExceptionResponse(
			  new Date(),
			  ex.getMessage(),
			  request.getDescription(false));

	  return new ResponseEntity<>(exceptionResponse, HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(InvalidJwtAuthenticationException.class)
  public final ResponseEntity<ExceptionResponse> handleInvalidJwtAuthenticationException(Exception ex, WebRequest request)
  {
	  ExceptionResponse exceptionResponse = new ExceptionResponse(
			  new Date(),
			  ex.getMessage(),
			  request.getDescription(false));

	  return new ResponseEntity<>(exceptionResponse, HttpStatus.FORBIDDEN);
  }

}
