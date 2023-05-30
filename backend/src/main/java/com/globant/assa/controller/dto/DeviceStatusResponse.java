package com.globant.assa.controller.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;


@Getter
@Setter
@Builder
@ToString
public class DeviceStatusResponse {

  private String deviceId;
  private String deviceStatus;
  private String credentialStatus;
  private String registrationStatus;

}
