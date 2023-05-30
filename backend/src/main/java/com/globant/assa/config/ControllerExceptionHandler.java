package com.globant.assa.config;


import com.globant.assa.controller.dto.ErrorMessage;
import com.globant.assa.exception.AssaClientException;
import com.globant.assa.exception.NotEntityFoundException;
import com.globant.assa.exception.ValidationDataException;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@ControllerAdvice
@Log4j2
public class ControllerExceptionHandler extends ResponseEntityExceptionHandler {

  @ExceptionHandler(value = { NotEntityFoundException.class } )
  protected ResponseEntity<Object> handleNotEntityFoundException(
      NotEntityFoundException ex, WebRequest request) {
    log.error(ex.getMessage());
    return handleExceptionInternal(ex, new ErrorMessage(ex.getCode(),
            ex.getMessage()),
        new HttpHeaders(), HttpStatus.NOT_FOUND, request);
  }

  @ExceptionHandler(value = { AssaClientException.class } )
  protected ResponseEntity<Object> handleAssaClientException(
      AssaClientException ex, WebRequest request) {
    log.error(ex.getMessage());
    return handleExceptionInternal(ex, new ErrorMessage(ex.getCode(),
            ex.getMessage()),
        new HttpHeaders(), HttpStatus.BAD_REQUEST, request);
  }

  @ExceptionHandler(value = { ValidationDataException.class } )
  protected ResponseEntity<Object> handleNotValidDataException(
      ValidationDataException ex, WebRequest request) {
    log.error(ex.getMessage());
    return handleExceptionInternal(ex, new ErrorMessage(ex.getCode(),
            ex.getMessage()),
        new HttpHeaders(), HttpStatus.BAD_REQUEST, request);
  }

  @ExceptionHandler(value = { Exception.class } )
  protected ResponseEntity<Object> handleException(
      RuntimeException ex, WebRequest request) {
    log.error(ex.getMessage(), ex);
    return handleExceptionInternal(ex, new ErrorMessage(HttpStatus.INTERNAL_SERVER_ERROR.value(),
            HttpStatus.INTERNAL_SERVER_ERROR.name()),
        new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR, request);
  }

}
