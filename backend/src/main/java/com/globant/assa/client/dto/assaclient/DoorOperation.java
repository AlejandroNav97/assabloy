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
public class DoorOperation {

  private List<String> doors = null;
  private String operation;

}
