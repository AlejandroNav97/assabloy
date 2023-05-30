package com.globant.assa.controller.dto;

import java.time.format.DateTimeFormatter;
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
public class CheckInRequest {

  private String email;
  private String reservationId;
  private String room;
  @JsonFormat(pattern = "yyyy-MM-dd'T'hh:mm:ss")
  private LocalDateTime startDate;
  @JsonFormat(pattern = "yyyy-MM-dd'T'hh:mm:ss")
  private LocalDateTime endDate;

}
