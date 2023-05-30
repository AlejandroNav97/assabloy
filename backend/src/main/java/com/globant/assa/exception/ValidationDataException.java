package com.globant.assa.exception;

import lombok.Getter;

@Getter
public class ValidationDataException extends RuntimeException{

  private int code;

  public ValidationDataException(int code, String message) {
    super(message);
    this.code = code;
  }

}
