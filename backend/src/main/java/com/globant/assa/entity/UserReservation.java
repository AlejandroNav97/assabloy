package com.globant.assa.entity;


import lombok.*;

import javax.persistence.*;

@Entity
@Table(name = "USER_RESERVATION")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class UserReservation {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "USER_RESERVATION_ID")
  private Long id;

  @Column(name = "EMAIL")
  private String email;

  @ManyToOne (cascade = CascadeType.ALL)
  @JoinColumn(name = "RESERVATION_ID")
  private Reservation reservation;

  @Column(name = "CREATE_USER")
  private String createUser;

  @Column(name = "UPDATE_USER")
  private String updateUser;

}
