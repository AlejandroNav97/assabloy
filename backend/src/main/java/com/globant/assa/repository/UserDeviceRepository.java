package com.globant.assa.repository;

import com.globant.assa.entity.UserDevice;
import com.globant.assa.util.CredentialStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserDeviceRepository extends JpaRepository<UserDevice, Long> {

  UserDevice findByStatusAndUserUsernameAndDeviceExternalId(
      final String status,
      final String username,
      final String externalId);

  UserDevice findByStatusAndDeviceExternalId(
      final String status,
      final String externalId);

  UserDevice findByCredentialId(
      final String credentialId);

  List<UserDevice> findByUserEmailIgnoreCaseAndCredentialStatusInOrderByCreateTimeAsc(
      final String email,
      final List<String> credentialStatus);

  List<UserDevice> findByUserEmailIgnoreCaseAndStatusOrderByCreateTimeAsc(
      final String email,
      final String status);

}
