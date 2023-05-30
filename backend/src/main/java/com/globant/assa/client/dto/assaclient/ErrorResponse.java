package com.globant.assa.client.dto.assaclient;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ErrorResponse {

  private int code;
  private String message;
  private String developerMessage;

}
