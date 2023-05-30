package com.globant.assa.service;

import com.globant.assa.client.AssaCredentialClient;
import com.globant.assa.client.AssaVisionlineClient;
import com.globant.assa.client.dto.assaclient.*;
import com.globant.assa.constants.Constants;
import com.globant.assa.entity.Reservation;
import com.globant.assa.entity.UserDevice;
import com.globant.assa.entity.UserReservation;
import com.globant.assa.repository.ReservationRepository;
import com.globant.assa.repository.UserDeviceRepository;
import com.globant.assa.repository.UserReservationRepository;
import com.globant.assa.util.CredentialStatus;
import com.globant.assa.util.DeviceStatus;
import com.globant.assa.util.Util;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@Log4j2
public class KeyService {

  @Autowired
  private AssaCredentialClient assaCredentialClient;

  @Autowired
  private AssaVisionlineClient assaVisionlineClient;

  @Autowired
  private UserReservationRepository userReservationRepository;

  @Autowired
  private ReservationRepository reservationRepository;

  @Autowired
  private UserDeviceRepository userDeviceRepository;

  @Value("${assavisionline.api.username}")
  private String username;

  @Value("${assavisionline.api.password}")
  private String password;

  public void issueKeyByEmail (String email) {
    log.info("Searching reservations for: {}", email);
    List<UserReservation> userReservations =
        userReservationRepository.findByEmailIgnoreCaseAndReservationActive(email, Boolean.TRUE);
    if(ObjectUtils.isEmpty(userReservations)){
      log.info("No reservations found for: {}", email);
      return;
    }
    UserReservation userReservation = userReservations.get(0);

    List<UserDevice> userDevices = userDeviceRepository
        .findByUserEmailIgnoreCaseAndStatusOrderByCreateTimeAsc(email, DeviceStatus.ACTIVE.toString());

    if(ObjectUtils.isEmpty(userDevices)){
      log.info("No devices found for: {}", email);
      return;
    }
    boolean override = true;
    for (UserDevice userDevice: userDevices){
      log.info("Device: {}", userDevice.getDevice().getExternalId());
      DoorOperation doorOperation = DoorOperation
          .builder()
          .doors(Arrays.asList(userReservation.getReservation().getRoom()))
          .operation(Constants.GUEST)
          .build();
      List<DoorOperation> doorOperations = new ArrayList<>();
      doorOperations.add(doorOperation);
      Card card = Card.
          builder().
          description(Constants.HOTEL_DESCRIPTION)
          .doorOperations(doorOperations)
          .endPointID(userDevice.getDevice().getExternalId())
          .startTime(Util.getTimeISO8601(userReservation.getReservation().getStartDate()))
          .expireTime(Util.getTimeISO8601(userReservation.getReservation().getEndDate()))
          .label(Constants.LABEL_ISSUE_KEY)
          .format(Constants.FORMAT_ISSUE_KEY)
          .build();
      log.info("Issuing keys for: {},{}", email ,userDevice.getDevice().getExternalId());
      Credential credential = issueKey(card, override);
      userDevice.setCredentialId(credential.getCredentialID());
      userDevice.setCredentialStatus(CredentialStatus.ISSUING.toString());
      userDeviceRepository.save(userDevice);
      override = false;
    }

  }

  public void issueKeyByDeviceId(String deviceId) {
    log.info("Searching device for: {}", deviceId);

    UserDevice userDevice = userDeviceRepository
        .findByStatusAndDeviceExternalId(DeviceStatus.ACTIVE.toString(),
        deviceId);

    if(ObjectUtils.isEmpty(userDevice)){
      log.info("No device found for: {}", deviceId);
      return;
    }

    String email = userDevice.getUser().getEmail();
    log.info("Email: {}", email);
    List<UserReservation> userReservations =
        userReservationRepository.findByEmailIgnoreCaseAndReservationActive(email, Boolean.TRUE);
    if(ObjectUtils.isEmpty(userReservations)){
      log.info("No reservations found for: {}", email);
      return;
    }
    UserReservation userReservation = userReservations.get(0);

    DoorOperation doorOperation = DoorOperation
        .builder()
        .doors(Arrays.asList(userReservation.getReservation().getRoom()))
        .operation(Constants.GUEST)
        .build();
    List<DoorOperation> doorOperations = new ArrayList<>();
    doorOperations.add(doorOperation);
    Card card = Card.
        builder().
        description(Constants.HOTEL_DESCRIPTION)
        .doorOperations(doorOperations)
        .endPointID(userDevice.getDevice().getExternalId())
        .startTime(Util.getTimeISO8601(userReservation.getReservation().getStartDate()))
        .expireTime(Util.getTimeISO8601(userReservation.getReservation().getEndDate()))
        .label(Constants.LABEL_ISSUE_KEY)
        .format(Constants.FORMAT_ISSUE_KEY)
        .build();
    log.info("Issuing keys for: {},{}", email ,userDevice.getDevice().getExternalId());
    List<UserDevice> currentDevices = userDeviceRepository
        .findByUserEmailIgnoreCaseAndCredentialStatusInOrderByCreateTimeAsc(email,
            Arrays.asList(CredentialStatus.ISSUING.toString(),
                CredentialStatus.ISSUED.toString()));
    log.info("currentDevices");
    log.info(currentDevices);
    boolean override = true;
    if(!ObjectUtils.isEmpty(currentDevices)) {
      log.info(" number of current devices: {}", currentDevices.size());
      override = false;
    }
    Credential credential = issueKey(card, override);
    userDevice.setCredentialId(credential.getCredentialID());
    userDevice.setCredentialStatus(CredentialStatus.ISSUING.toString());
    userDeviceRepository.save(userDevice);
  }

  public Credential issueKey(Card card , boolean override){
    log.info(card);
    Session session = assaVisionlineClient.createSession(User.builder()
        .username(username)
        .password(password)
        .build());
    Credential credential = assaVisionlineClient
        .issueKey(session, Constants.MOBILE_ACCESS, override, card);
    assaVisionlineClient.deleteSession(session);
    log.info("Credential id: {}", credential.getCredentialID());
    return credential;
  }

  public Door checkOut(String room, CheckOut checkOut){
    log.info(checkOut);
    log.info("Room : {}", room);
    Session session = assaVisionlineClient.createSession(User.builder()
        .username(username)
        .password(password)
        .build());
    Door door = assaVisionlineClient
        .checkOut(session, room, checkOut);
    assaVisionlineClient.deleteSession(session);
    log.info("Door id: {}", door.getId());
    return door;
  }

  public void checkOut (Reservation reservation) {
    log.info("Checkout reservation for: {}", reservation);
    UserReservation userReservation = userReservationRepository
        .findByReservationExternalReference(reservation.getExternalReference());

    List<UserDevice> userDevices = userDeviceRepository
        .findByUserEmailIgnoreCaseAndStatusOrderByCreateTimeAsc(userReservation.getEmail(), DeviceStatus.ACTIVE.toString());

    if(ObjectUtils.isEmpty(userDevices)){
      log.info("No device found for: {}", userReservation.getEmail());
    }

    else{
      log.info("Revoking keys for: {}", reservation.getRoom());
      for (UserDevice userDevice: userDevices){
        log.info(userDevice);
        log.info("Device: {}", userDevice.getDevice().getExternalId());
        //userDevice.setStatus(DeviceStatus.INACTIVE.toString());
        //userDevice.setRegistrationStatus(RegistrationStatus.TERMINATED.toString());
        userDevice.setCredentialStatus(CredentialStatus.REVOKING.toString());
        userDeviceRepository.save(userDevice);
        //log.info("Unregister Endpoint {} ", userDevice.getDevice().getExternalId());
        //assaCredentialClient.deleteEndpoint(userDevice.getDevice().getExternalId());
      }

      CheckOut checkOut = CheckOut
          .builder()
          .checkedOut(Boolean.TRUE)
          .build();
      checkOut(reservation.getRoom(), checkOut);
    }
    reservation.setActive(Boolean.FALSE);
    reservationRepository.save(reservation);
  }

}
