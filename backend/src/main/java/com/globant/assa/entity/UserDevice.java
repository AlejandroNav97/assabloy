package com.globant.assa.entity;


import lombok.*;

import javax.persistence.*;

@Entity
@Table(name = "USER_DEVICE")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class UserDevice {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "USER_DEVICE_ID")
  private Long id;

  @ManyToOne (cascade = CascadeType.ALL)
  @JoinColumn(name = "USER_ID")
  private User user;

  @ManyToOne (cascade = CascadeType.ALL)
  @JoinColumn(name = "DEVICE_ID")
  private Device device;

  @Column(name = "STATUS")
  private String status;

  @Column(name = "REGISTRATION_STATUS")
  private String registrationStatus;

  @Column(name = "CREDENTIAL_STATUS")
  private String credentialStatus;

  @Column(name = "CREDENTIAL_ID")
  private String credentialId;

  @Column(name = "CREATE_USER")
  private String createUser;

  @Column(name = "UPDATE_USER")
  private String updateUser;

  @Column(name = "CREATE_TIME")
  private String createTime;

}
