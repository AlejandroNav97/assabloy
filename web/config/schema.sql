DROP DATABASE IF EXISTS assaabloyUI;
CREATE DATABASE assaabloyUI;
USE assaabloyUI;

set foreign_key_checks=0;

-- --------------------------------------------------------

CREATE TABLE users (
    user_id int(6) NOT NULL AUTO_INCREMENT,
    username varchar(20) NOT NULL UNIQUE,
    password varchar(255) NOT NULL,
    access_id int(3) NOT NULL,
    FOREIGN KEY (access_id) REFERENCES access_levels(access_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    active boolean DEFAULT 1,
    PRIMARY KEY (user_id)
);

-- --------------------------------------------------------

CREATE TABLE access_levels (
    access_id int(3) NOT NULL AUTO_INCREMENT,
    type varchar(30) NOT NULL,
    PRIMARY KEY (access_id)
);

-- --------------------------------------------------------

CREATE TABLE rooms (
    room_id int(6) NOT NULL AUTO_INCREMENT,
    room_num varchar(20) NOT NULL UNIQUE,
    room_type_id int(3) NOT NULL,
    FOREIGN KEY (room_type_id) REFERENCES room_types(room_type_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    description varchar(255),
    num_beds int(3) NOT NULL,
    clean boolean DEFAULT 0,
    occupied boolean DEFAULT 0,
    active boolean DEFAULT 1,
    PRIMARY KEY (room_id)
);

-- --------------------------------------------------------

CREATE TABLE room_types (
    room_type_id int(3) NOT NULL AUTO_INCREMENT,
    type varchar(30) NOT NULL,
    rate decimal(5,2) NOT NULL,
    PRIMARY KEY (room_type_id)
);

-- --------------------------------------------------------

CREATE TABLE customers (
    customer_id int(6) NOT NULL AUTO_INCREMENT,
    first_name varchar(30) NOT NULL,
    last_name varchar(30) NOT NULL,
    email varchar(50) NOT NULL,
    PRIMARY KEY (customer_id)
);

-- --------------------------------------------------------

CREATE TABLE reservations (
    reservation_id int(10) NOT NULL AUTO_INCREMENT,
    customer_id int(6) NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    user_id int(6) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    created_at datetime DEFAULT CURRENT_TIMESTAMP,
    comments varchar(255),
    active boolean DEFAULT 1,
    PRIMARY KEY (reservation_id)
);

-- --------------------------------------------------------

CREATE TABLE res_rooms (
    res_room_id int(10) NOT NULL AUTO_INCREMENT,
    reservation_id int(10) NOT NULL,
    FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id) ON DELETE CASCADE ON UPDATE CASCADE,
    room_type_id int(6) NOT NULL,
    FOREIGN KEY (room_type_id) REFERENCES room_types(room_type_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    check_in_date varchar(26) NOT NULL,
    check_out_date varchar(26) NOT NULL,
    checked_in boolean DEFAULT 0,
    checked_out boolean DEFAULT 0,
    adults int(3) NOT NULL,
    room_id int(6),
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    rate decimal(5,2) NOT NULL,
    confirmation_code varchar(20) NULL,
    comments varchar(255),
    active boolean DEFAULT 1,
    PRIMARY KEY (res_room_id)
);

-- --------------------------------------------------------

CREATE TABLE hotel_info (
    hotel_info_id int(6) NOT NULL AUTO_INCREMENT,
    hotel_name varchar(30) NOT NULL,
    address varchar(50) NOT NULL,
    city varchar(50) NOT NULL,
    state varchar(30) NOT NULL,
    zip varchar(20) NOT NULL,
    email varchar(50) NOT NULL,
    phone varchar(20) NOT NULL,
    image_url varchar(60) NOT NULL,
    active boolean DEFAULT 1,
    PRIMARY KEY (hotel_info_id)
);

-- --------------------------------------------------------

CREATE TABLE sessions (
    session_id varchar(128) COLLATE utf8mb4_bin NOT NULL,
    expires int(11) unsigned NOT NULL,
    data mediumtext COLLATE utf8mb4_bin,
    PRIMARY KEY (session_id)
);

-- --------------------------------------------------------

set foreign_key_checks=1;
