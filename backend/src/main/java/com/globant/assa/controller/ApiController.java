package com.globant.assa.controller;

import com.globant.assa.client.dto.assaclient.Card;
import com.globant.assa.client.dto.assaclient.Credential;
import com.globant.assa.controller.dto.*;
import com.globant.assa.service.KeyService;
import com.globant.assa.service.RegistrationService;
import com.globant.assa.service.ReservationService;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("api")
@Log4j2
public class ApiController {

  @Autowired
  private RegistrationService registrationService;

  @Autowired
  private ReservationService reservationService;

  @Autowired
  private KeyService keyService;

  @PostMapping("/registration")
  public ResponseEntity<RegistrationResponse> registration(Principal principal,
                                                           @RequestBody RegistrationRequest registrationRequest) {
    log.info("user: {}",principal.getName());
    log.info(registrationRequest);
    RegistrationResponse registrationResponse = registrationService
        .registration(principal.getName(),
            registrationRequest);
    log.info(registrationResponse);
    return new ResponseEntity<>(registrationResponse,
        HttpStatus.CREATED);
  }

  @PostMapping("/check-in")
  public ResponseEntity<Void> checkIn(Principal principal,
                                      @RequestBody CheckInRequest checkInRequest) {
    log.info("user: {}",principal.getName());
    log.info(checkInRequest);
    reservationService.createReservation(principal.getName(), checkInRequest);
    return new ResponseEntity<>(HttpStatus.CREATED);
  }

  @PatchMapping("/change-room")
  public ResponseEntity<Void> changeRoom(Principal principal,
                                      @RequestBody ChangeRoomRequest changeRoomRequest) {
    log.info("user: {}",principal.getName());
    log.info(changeRoomRequest);
    reservationService.changeRoom(principal.getName(), changeRoomRequest);
    return new ResponseEntity<>(HttpStatus.OK);
  }

  @PostMapping("/check-out")
  public ResponseEntity<Void> checkOut(Principal principal,
                                      @RequestBody CheckOutRequest checkOutRequest) {
    log.info(" user: {}",principal.getName());
    log.info(checkOutRequest);
    reservationService.checkOut(checkOutRequest.getReservationId());
    return new ResponseEntity<>(HttpStatus.OK);
  }

  @GetMapping("/device-status/{deviceId}")
  public ResponseEntity<DeviceStatusResponse> deviceStatus(Principal principal,
                                                           @PathVariable String deviceId) {
    log.info("user: {}",principal.getName());
    log.info("deviceStatus for: {}",deviceId);
    DeviceStatusResponse deviceStatusResponse= registrationService.deviceStatus(principal.getName(), deviceId);
    log.info(deviceStatusResponse);
    return new ResponseEntity<>(deviceStatusResponse,
        HttpStatus.OK);
  }

  @GetMapping("/reservations")
  public ResponseEntity<List<ReservationResponse>> reservations(Principal principal) {
    log.info("user: {}",principal.getName());
    log.info("reservations for: {}", principal.getName());
    List<ReservationResponse> reservations =
        reservationService.getReservations(principal.getName());
    log.info(reservations);
    return new ResponseEntity<>(reservations,
        HttpStatus.OK);
  }

  @PostMapping("/callbackEndpoint")
  public ResponseEntity<Void> callbackEndpoint(@RequestBody CallbackEndpointRequest callbackEndpointRequest) {
    log.info(callbackEndpointRequest);
    registrationService.updateDeviceRegistrationStatus(callbackEndpointRequest.getEndpointId(),
        callbackEndpointRequest.getEndpointStatus());
    return new ResponseEntity<>(HttpStatus.OK);
  }

  @PostMapping("/callbackCredential")
  public ResponseEntity<Void> callbackCredential(@RequestBody CallbackCredentialRequest callbackCredentialRequest) {
    log.info(callbackCredentialRequest);
    registrationService.updateDeviceCredentialStatus(callbackCredentialRequest.getCredentialId(),
        callbackCredentialRequest.getCredentialStatus());
    return new ResponseEntity<>(HttpStatus.OK);
  }

  @PostMapping("/issueKey")
  public ResponseEntity<Credential> issueKey(Principal principal,
                                                           @RequestBody Card card) {
    log.info("user: {}",principal.getName());
    log.info(card);
    Credential credential = keyService.issueKey(card, true);
    log.info(credential);
    return new ResponseEntity<>(credential,
        HttpStatus.OK);
  }

  @GetMapping("/version")
  public ResponseEntity<String> version(Principal principal) {
    return new ResponseEntity<>("1.09.10-A".concat(" now = ").concat(new Date().toString()),
        HttpStatus.OK);
  }

}
