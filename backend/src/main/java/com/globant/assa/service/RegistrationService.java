package com.globant.assa.service;

import com.globant.assa.client.AssaCredentialClient;
import com.globant.assa.client.CognitoIdpClient;
import com.globant.assa.client.dto.assaclient.Endpoint;
import com.globant.assa.client.dto.assaclient.Invitation;
import com.globant.assa.controller.dto.DeviceStatusResponse;
import com.globant.assa.controller.dto.RegistrationRequest;
import com.globant.assa.controller.dto.RegistrationResponse;
import com.globant.assa.entity.Device;
import com.globant.assa.entity.User;
import com.globant.assa.entity.UserDevice;
import com.globant.assa.exception.Error;
import com.globant.assa.exception.NotEntityFoundException;
import com.globant.assa.exception.ValidationDataException;
import com.globant.assa.repository.DeviceRepository;
import com.globant.assa.repository.UserDeviceRepository;
import com.globant.assa.repository.UserRepository;
import com.globant.assa.util.CredentialStatus;
import com.globant.assa.util.DeviceStatus;
import com.globant.assa.util.RegistrationStatus;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;
import org.springframework.web.bind.annotation.PathVariable;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AttributeType;
import software.amazon.awssdk.services.cognitoidentityprovider.model.UserType;

import javax.transaction.Transactional;


@Service
@Log4j2
public class RegistrationService {

  @Autowired
  private AssaCredentialClient assaCredentialClient;

  @Autowired
  private CognitoIdpClient cognitoIdpClient;

  @Autowired
  private UserDeviceRepository userDeviceRepository;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private DeviceRepository deviceRepository;

  @Autowired
  private KeyService keyService;

  @Transactional
  public RegistrationResponse registration(String userId,
                                           RegistrationRequest registrationRequest) {

    log.info("Registration: {}, {} ", registrationRequest.getDeviceId(), userId);

    UserDevice userDevice = null;

    try {
      userDevice = userDeviceRepository
          .findByStatusAndDeviceExternalId(DeviceStatus.ACTIVE.toString(),
              registrationRequest.getDeviceId());
    }
    catch (Exception e){
      log.error(e.getMessage(), e);
      throw new ValidationDataException(Error.DEVICE_IS_ACTIVE.getCode(),
          String.format(Error.DEVICE_IS_ACTIVE.getMessage(), registrationRequest.getDeviceId()));
    }

    if(!ObjectUtils.isEmpty(userDevice) && !userId.equalsIgnoreCase(userDevice.getUser().getUsername()) ){
      log.info("User from request: {} != db user {} ", userId,
          userDevice.getUser().getUsername());
      log.info("delete Endpoint {} ", registrationRequest.getDeviceId());
      assaCredentialClient.deleteEndpoint(registrationRequest.getDeviceId());
      userDevice.setRegistrationStatus(RegistrationStatus.TERMINATED.toString());
      userDevice.setStatus(DeviceStatus.INACTIVE.toString());
      userDeviceRepository.save(userDevice);
    }

    log.info("Register: {}, {} ", registrationRequest.getDeviceId(), userId);
    Invitation invitation = assaCredentialClient
        .endpointInvitation(Endpoint
            .builder().endpointId(registrationRequest.getDeviceId()).build());
    userDevice = createUserDevice(userId, registrationRequest);
    userDeviceRepository.save(userDevice);
    return RegistrationResponse
        .builder()
        .deviceId(invitation.getEndpointId())
        .invitationCode(invitation.getInvitationCode())
        .build();
  }


  public DeviceStatusResponse deviceStatus(String userId,
                                           @PathVariable String deviceId){
    UserDevice userDevice = userDeviceRepository.findByStatusAndUserUsernameAndDeviceExternalId (
        DeviceStatus.ACTIVE.toString(),
        userId,
        deviceId);
    if(null == userDevice){
      throw new NotEntityFoundException(Error.DEVICE_NOT_FOUND.getCode(),
          String.format(Error.DEVICE_NOT_FOUND.getMessage(),deviceId));
    }
    return DeviceStatusResponse
        .builder()
        .deviceStatus(userDevice.getStatus())
        .registrationStatus(userDevice.getRegistrationStatus())
        .credentialStatus(userDevice.getCredentialStatus())
        .deviceId(userDevice.getDevice().getExternalId())
        .build();
  }

  @Transactional
  public void updateDeviceRegistrationStatus(String deviceId, String endpointStatus) {
    UserDevice userDevice = userDeviceRepository.findByStatusAndDeviceExternalId (
        DeviceStatus.ACTIVE.toString(),
        deviceId);
    if(null == userDevice){
      throw new NotEntityFoundException(Error.DEVICE_NOT_FOUND.getCode(),
          String.format(Error.DEVICE_NOT_FOUND.getMessage(),deviceId));
    }
    userDevice.setRegistrationStatus(endpointStatus);
    userDeviceRepository.save(userDevice);
    keyService.issueKeyByDeviceId(deviceId);
  }


  @Transactional
  public void updateDeviceCredentialStatus(String credentialId, String credentialStatus) {
    UserDevice userDevice = userDeviceRepository.findByCredentialId (credentialId);
    if(null == userDevice){
      throw new NotEntityFoundException(Error.CREDENTIAL_ID_NOT_FOUND.getCode(),
          String.format(Error.CREDENTIAL_ID_NOT_FOUND.getMessage(),credentialId));
    }
    userDevice.setCredentialStatus(credentialStatus);
    userDeviceRepository.save(userDevice);
  }

  private UserDevice createUserDevice(String userId, RegistrationRequest registrationRequest) {

    User user  = userRepository.findByUsername(userId);
    if(user == null){
      UserType userType = cognitoIdpClient.getUserTypeBtId(userId);
      AttributeType attributeType =
          userType
          .attributes()
          .stream()
          .filter(userAttribute -> userAttribute.name().equals("email"))
          .findFirst().get();
      user = User
          .builder()
          .username(userId)
          .email(attributeType.value())
          .createUser(userId)
          .updateUser(userId)
          .build();
    }

    Device device = deviceRepository.findByExternalId(registrationRequest.getDeviceId());
    if(device == null){
      device = Device
          .builder()
          .externalId(registrationRequest.getDeviceId())
          .createUser(userId)
          .updateUser(userId)
          .build();
    }

    UserDevice userDevice = userDeviceRepository.findByStatusAndUserUsernameAndDeviceExternalId(
        DeviceStatus.ACTIVE.toString(),
        userId,
        registrationRequest.getDeviceId());
    if(userDevice == null) {
      userDevice = UserDevice
          .builder()
          .status(DeviceStatus.ACTIVE.toString())
          .registrationStatus(RegistrationStatus.INVITATION_PENDING.toString())
          .credentialStatus(CredentialStatus.PENDING.toString())
          .createUser(userId)
          .updateUser(userId)
          .user(user)
          .device(device)
          .build();
    }

    return userDevice;
  }

}
