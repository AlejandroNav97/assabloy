package com.globant.assa.entity;


import lombok.*;

import javax.persistence.*;

@Entity
@Table(name = "DEVICE")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class Device {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "DEVICE_ID")
  private Long id;

  @Column(name = "EXTERNAL_ID")
  private String externalId;

  @Column(name = "CREATE_USER")
  private String createUser;

  @Column(name = "UPDATE_USER")
  private String updateUser;

}
