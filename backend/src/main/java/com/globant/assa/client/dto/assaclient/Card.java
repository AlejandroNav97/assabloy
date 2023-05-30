package com.globant.assa.client.dto.assaclient;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@Builder
@ToString
public class Card {

  private List<DoorOperation> doorOperations = null;
  private String label;
  private String endPointID;
  private String description;
  private String expireTime;
  private String startTime;
  private String format;

}
