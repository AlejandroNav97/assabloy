package com.globant.assa.repository;

import com.globant.assa.entity.Device;
import com.globant.assa.entity.UserDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeviceRepository extends JpaRepository<Device, Long> {

 Device findByExternalId(String externalId);

}
