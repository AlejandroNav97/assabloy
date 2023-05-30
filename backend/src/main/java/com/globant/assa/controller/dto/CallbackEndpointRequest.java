package com.globant.assa.controller.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class CallbackEndpointRequest {

  private String callbackType;
  private String endpointId;
  private String endpointStatus;

}
