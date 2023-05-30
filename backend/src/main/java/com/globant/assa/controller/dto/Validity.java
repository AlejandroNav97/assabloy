package com.globant.assa.controller.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.Date;

@Getter
@Setter
@ToString
public class Validity {

  private Date startDate;
  private Date endDate;

}
