set foreign_key_checks=0;

-- --------------------------------------------------------

--
-- Seed data for users
--

TRUNCATE TABLE users;

INSERT INTO users (username, password, access_id) VALUES
('admin', '$2b$10$Qf/0VNBQiYr.pHN8IN9Yl.SrYQCpG4b2mrsX6dx85DkE7/fwsNWvy', 3),
('manager', '$2b$10$2ataQ4kjDbZaR9TDSUqXI.Mt.Gq/bDn1Te3MN939s3fJAtTrKJa9i', 2),
('vince', '$2b$10$HEj.issBvH6pxDEiBxtCr.c8fU7Cl4TC34K4/MGtTMdXqztLyqt8K', 3),
('user', '$2b$10$rnUz2cFk61G27KdixeR5G.rf78zaKzDZlebrs9ZK5tnnVGFWrnUPm', 1);

 -- pw admin
 -- pw 123456
 -- pw 654321
 -- pw 123123

-- --------------------------------------------------------

--
-- Seed data for access_levels
--

TRUNCATE TABLE access_levels;

INSERT INTO access_levels (access_id, type) VALUES
(1, 'Employee'),
(2, 'Manager'),
(3, 'Administrator');

-- --------------------------------------------------------

--
-- Seed data for customers
--

TRUNCATE TABLE customers;


-- --------------------------------------------------------

--
-- Seed data for rooms
--

TRUNCATE TABLE rooms;

INSERT INTO rooms (room_id, room_num, room_type_id, description, num_beds, clean, occupied, active) VALUES
(1, '101', 1, 'balcony', 2, 1, 0, 1),
(2, '102', 3, 'microwave, refridgerator', 1, 1, 0, 1),
(3, '103', 3, 'microwave, refridgerator', 2, 1, 0, 1),
(4, '104', 2, '60-inch TV', 2, 1, 0, 1),
(5, '105', 3, 'microwave, refridgerator, balcony', 1, 1, 0, 1),
(6, '106', 3, 'microwave, refridgerator', 1, 1, 0, 1),
(7, '107', 1, '', 2, 1, 0, 1),
(8, '108', 3, 'microwave, refridgerator', 1, 1, 0, 1),
(9, '109', 3, 'microwave, refridgerator, balcony', 1, 1, 0, 1);
-- --------------------------------------------------------

--
-- Seed data for room_types
--

TRUNCATE TABLE room_types;

INSERT INTO room_types (room_type_id, type, rate) VALUES
(1, '2 Queens', 109.99),
(2, 'King', 119.99),
(3, 'Suite', 129.99);

-- --------------------------------------------------------

--
-- Seed data for reservations
--

TRUNCATE TABLE reservations;
ALTER TABLE reservations AUTO_INCREMENT = 1001;


-- --------------------------------------------------------

--
-- Seed data for res_rooms
--

TRUNCATE TABLE res_rooms;
ALTER TABLE res_rooms AUTO_INCREMENT = 1001;

-- --------------------------------------------------------

--
-- Seed data for hotel_info
--

TRUNCATE TABLE hotel_info;

INSERT INTO hotel_info (hotel_name, address, city, state, zip, email, phone, image_url, active) VALUES
('Countryside', '12345 E Main St', 'Cleveland', 'Ohio', '44114', 'info@countrysidesuites.com', '216-555-1212', 'hotel.png', 1);

-- --------------------------------------------------------

--
-- Seed data for room_issues
--

TRUNCATE TABLE hotel_info;

INSERT INTO hotel_info (hotel_name, address, city, state, zip, email, phone, image_url, active) VALUES
('Countryside', '12345 E Main St', 'Cleveland', 'Ohio', '44114', 'info@countryside.com', '216-555-1212', 'hotel.png', 1);

-- --------------------------------------------------------

-- --------------------------------------------------------

set foreign_key_checks=1;