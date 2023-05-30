package com.globant.assa.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@AllArgsConstructor
@ToString
public enum Error {
  DEVICE_NOT_FOUND(101, "Device not found: %s"),
  CREDENTIAL_ID_NOT_FOUND(102, "Credential id not found: %s"),
  RESERVATION_ALREADY_EXISTS(103, "Reservation already exists: %s"),
  RESERVATION_DOES_NOT_EXIST(104, "Reservation does not exist: %s"),
  RESERVATION_END_DATE_IS_IN_THE_PAST(105, "Reservation end date cannot be in the past: %s"),
  ROOM_IS_THE_SAME(106, "Room %s is the same in the reservation."),
  RESERVATION_IS_NOT_ACTIVE(107, "Reservation is not active: %s"),
  DEVICE_IS_ACTIVE(108, "The device is active: %s");

  private final int code;
  private final String message;


}
