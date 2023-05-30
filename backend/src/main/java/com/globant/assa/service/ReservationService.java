package com.globant.assa.service;

import com.globant.assa.client.CognitoIdpClient;
import com.globant.assa.client.dto.assaclient.CheckOut;
import com.globant.assa.constants.Constants;
import com.globant.assa.controller.dto.ChangeRoomRequest;
import com.globant.assa.controller.dto.CheckInRequest;
import com.globant.assa.controller.dto.ReservationResponse;
import com.globant.assa.entity.Reservation;
import com.globant.assa.entity.UserReservation;
import com.globant.assa.exception.Error;
import com.globant.assa.exception.ValidationDataException;
import com.globant.assa.repository.ReservationRepository;
import com.globant.assa.repository.UserRepository;
import com.globant.assa.repository.UserReservationRepository;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AttributeType;
import software.amazon.awssdk.services.cognitoidentityprovider.model.UserType;

import javax.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Service
@Log4j2
public class ReservationService {

  @Autowired
  private CognitoIdpClient cognitoIdpClient;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private ReservationRepository reservationRepository;

  @Autowired
  private UserReservationRepository userReservationRepository;

  @Autowired
  private KeyService keyService;

  @Transactional
  public void createReservation(String userId,
                                CheckInRequest checkInRequest) {


    UserReservation userReservation = createUserReservation(userId, checkInRequest);
    userReservationRepository.save(userReservation);
    keyService.issueKeyByEmail(userReservation.getEmail());
  }

  @Transactional
  public void checkOut(String reservationId) {

    Reservation reservation = reservationRepository
        .findByExternalReference(reservationId);

    if( ObjectUtils.isEmpty(reservation) ) {
      throw new ValidationDataException(Error.RESERVATION_DOES_NOT_EXIST.getCode(),
          String.format(Error.RESERVATION_DOES_NOT_EXIST.getMessage(), reservationId));
    }

    if( !reservation.isActive() ) {
      throw new ValidationDataException(Error.RESERVATION_IS_NOT_ACTIVE.getCode(),
          String.format(Error.RESERVATION_IS_NOT_ACTIVE.getMessage(), reservationId));
    }

    keyService.checkOut(reservation);
  }

  @Transactional
  public void changeRoom(String userId,
                         ChangeRoomRequest changeRoomRequest) {

    Reservation reservation = reservationRepository
        .findByExternalReference(changeRoomRequest.getReservationId());
    if( ObjectUtils.isEmpty(reservation) ) {
      throw new ValidationDataException(Error.RESERVATION_DOES_NOT_EXIST.getCode(),
          String.format(Error.RESERVATION_DOES_NOT_EXIST.getMessage(), changeRoomRequest.getReservationId()));
    }
    log.info("Changing from: {} to: {}", reservation.getRoom(), changeRoomRequest.getRoom());
    if(reservation.getRoom().equals(changeRoomRequest.getRoom())) {
      throw new ValidationDataException(Error.ROOM_IS_THE_SAME.getCode(),
          String.format(Error.ROOM_IS_THE_SAME.getMessage(), changeRoomRequest.getRoom()));
    }

    if( !reservation.isActive() ) {
      throw new ValidationDataException(Error.RESERVATION_IS_NOT_ACTIVE.getCode(),
          String.format(Error.RESERVATION_IS_NOT_ACTIVE.getMessage(), changeRoomRequest.getReservationId()));
    }
    String currentRoom = reservation.getRoom();
    reservation.setRoom(changeRoomRequest.getRoom());
    reservation.setUpdateUser(userId);
    reservationRepository.save(reservation);
    UserReservation userReservation = userReservationRepository
        .findByReservationExternalReference(changeRoomRequest.getReservationId());
    String email = userReservation.getEmail();
    CheckOut checkOut = CheckOut
        .builder()
        .checkedOut(Boolean.TRUE)
        .build();
    keyService.issueKeyByEmail(email);

  }


  private UserReservation createUserReservation(String userId, CheckInRequest checkInRequest) {

    if (checkInRequest.getEndDate().isBefore(LocalDateTime.now() ) ){
      throw new ValidationDataException(Error.RESERVATION_END_DATE_IS_IN_THE_PAST.getCode(),
          String.format(Error.RESERVATION_END_DATE_IS_IN_THE_PAST.getMessage(), checkInRequest.getEndDate()));
    }

    Reservation reservation = reservationRepository
        .findByExternalReference(checkInRequest.getReservationId());
    if(reservation != null) {
      throw new ValidationDataException(Error.RESERVATION_ALREADY_EXISTS.getCode(),
          String.format(Error.RESERVATION_ALREADY_EXISTS.getMessage(), checkInRequest.getReservationId()));
    }
    List<UserReservation> userReservations = userReservationRepository
        .findByEmailIgnoreCaseAndReservationActive(checkInRequest.getEmail(),
            Boolean.TRUE);

    if(!ObjectUtils.isEmpty(userReservations)) {
      throw new ValidationDataException(Error.RESERVATION_ALREADY_EXISTS.getCode(),
          String.format(Error.RESERVATION_ALREADY_EXISTS.getMessage(), checkInRequest.getEmail()));
    }
    if(reservation == null){
      reservation = Reservation
          .builder()
          .externalReference(checkInRequest.getReservationId())
          .room(checkInRequest.getRoom())
          .startDate(checkInRequest.getStartDate())
          .active(Boolean.TRUE)
          .endDate(checkInRequest.getEndDate())
          .createUser(userId)
          .updateUser(userId)
          .build();
    }
    UserReservation userReservation = userReservationRepository
        .findByEmailIgnoreCaseAndReservationExternalReference(
        checkInRequest.getEmail(),
        checkInRequest.getReservationId());
    if(userReservation == null) {
      userReservation = UserReservation
          .builder()
          .email(checkInRequest.getEmail())
          .reservation(reservation)
          .createUser(userId)
          .updateUser(userId)
          .build();
    }
    return userReservation;
  }


  public List<ReservationResponse> getReservations(String userId){
    List<ReservationResponse> reservations = new ArrayList<>();
    UserType userType = cognitoIdpClient.getUserTypeBtId(userId);
    AttributeType attributeType =
        userType
            .attributes()
            .stream()
            .filter(userAttribute -> userAttribute.name().equals(Constants.EMAIL))
            .findFirst().get();
    String email = attributeType.value();
    if (StringUtils.hasText(email)){
      List<UserReservation>  userReservations = userReservationRepository.findByEmailIgnoreCase(email);
      log.info("Reviewing active reservations");
      log.info(userReservations);
      for (UserReservation userReservation : userReservations){
        if(userReservation.getReservation().isActive()) {
          log.info("Reviewing reservation " + userReservation.getReservation().getExternalReference());
          log.info(userReservation.getReservation());
          if (userReservation.getReservation().getEndDate().isBefore(LocalDateTime.now() ) ){
            log.info(userReservation.getReservation().getExternalReference() + " checking out");
            keyService.checkOut(userReservation.getReservation());
            log.info(userReservation.getReservation().getExternalReference() + " checked out");
          }

        }
      }
      userReservations = userReservationRepository.findByEmailIgnoreCase(email);
      log.info("Reservations found:");
      log.info(userReservations);
      for (UserReservation userReservation : userReservations){
        ReservationResponse reservationResponse = ReservationResponse
            .builder()
            .reservationId(userReservation.getReservation().getExternalReference())
            .room(userReservation.getReservation().getRoom())
            .startDate(userReservation.getReservation().getStartDate())
            .endDate(userReservation.getReservation().getEndDate())
            .active(userReservation.getReservation().isActive())
            .build();
        reservations.add(reservationResponse);
      }
    }

    return reservations;
  }

}
