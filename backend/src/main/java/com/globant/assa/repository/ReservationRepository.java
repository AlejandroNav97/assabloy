package com.globant.assa.repository;

import com.globant.assa.entity.Device;
import com.globant.assa.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

  Reservation findByExternalReference(String externalReference);

}
