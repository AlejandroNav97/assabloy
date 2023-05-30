package com.globant.assa.repository;

import com.globant.assa.entity.UserReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserReservationRepository extends JpaRepository<UserReservation, Long> {

  UserReservation findByEmailIgnoreCaseAndReservationExternalReference(final String email,
                                                                       final String externalReference);


  List<UserReservation> findByEmailIgnoreCase(final String email);

  List<UserReservation> findByEmailIgnoreCaseAndReservationActive(final String email,
                                                                  final boolean active);

  UserReservation findByReservationExternalReference(final String externalReference);

}
