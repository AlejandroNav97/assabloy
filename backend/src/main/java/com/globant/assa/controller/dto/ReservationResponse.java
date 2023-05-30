package com.globant.assa.controller.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@ToString
public class ReservationResponse {

  private String reservationId;
  private String room;
  @JsonFormat(pattern = "yyyy-MM-dd'T'hh:mm:ss a")
  private LocalDateTime startDate;
  @JsonFormat(pattern = "yyyy-MM-dd'T'hh:mm:ss a")
  private LocalDateTime endDate;
  private boolean active;

}
