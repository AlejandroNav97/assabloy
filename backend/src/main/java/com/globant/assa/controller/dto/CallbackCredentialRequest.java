package com.globant.assa.controller.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class CallbackCredentialRequest {

  private String callbackType;
  private String systemId;
  private String endpointId;
  private String credentialId;
  private String credentialStatus;
  private String label;
  private String description;
  private Validity validity;

}
