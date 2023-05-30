package com.globant.assa.exception;

import lombok.Getter;

@Getter
public class AssaClientException extends RuntimeException{

  private int code;

  public AssaClientException(int code, String message) {
    super(message);
    this.code = code;
  }

}
