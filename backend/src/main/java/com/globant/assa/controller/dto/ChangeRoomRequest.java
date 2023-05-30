package com.globant.assa.controller.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;


@Getter
@Setter
@Builder
@ToString
public class ChangeRoomRequest {

  private String reservationId;
  private String room;

}
