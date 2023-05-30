package com.globant.assa.exception;

import lombok.Getter;

@Getter
public class NotEntityFoundException extends RuntimeException {

  private int code;

  public NotEntityFoundException(int code, String message) {
    super(message);
    this.code = code;
  }

}
