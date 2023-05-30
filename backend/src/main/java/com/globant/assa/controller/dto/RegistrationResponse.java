package com.globant.assa.controller.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@Builder
@ToString
public class RegistrationResponse {

  private String deviceId;
  private String invitationCode;

}
