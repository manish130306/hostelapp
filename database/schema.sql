CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(80) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(40) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hostel_blocks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL
);

CREATE TABLE floors (
  id SERIAL PRIMARY KEY,
  block_id INTEGER REFERENCES hostel_blocks(id) ON DELETE CASCADE,
  floor_number INTEGER NOT NULL
);

CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  block_id INTEGER REFERENCES hostel_blocks(id) ON DELETE CASCADE,
  floor_id INTEGER REFERENCES floors(id) ON DELETE CASCADE,
  room_number VARCHAR(20) UNIQUE NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0)
);

CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  roll_number VARCHAR(30) UNIQUE NOT NULL,
  student_name VARCHAR(120) NOT NULL,
  year_of_study VARCHAR(40) NOT NULL,
  room_id INTEGER REFERENCES rooms(id),
  date_of_joining DATE NOT NULL,
  contact_number VARCHAR(20),
  parent_contact VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active',
  vacating_date DATE,
  vacating_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quarters_residents (
    id SERIAL PRIMARY KEY,
    quarters_no VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(255),
    department VARCHAR(255),
    phone_no VARCHAR(20),
    ifhrms_no VARCHAR(50),
    ref_no_and_date TEXT,
    occupy_date DATE,
    eb_no VARCHAR(50) UNIQUE,
    quarters_type VARCHAR(1) NOT NULL CHECK (quarters_type IN ('A', 'C', 'D')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quarters_special_details (
    id SERIAL PRIMARY KEY,
    quarters_no VARCHAR(20) UNIQUE,
    special_notes TEXT,
    maintenance_issues TEXT,
    family_members_count INTEGER,
    vehicle_number VARCHAR(50),
    aadhaar_number VARCHAR(20),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    resident_status VARCHAR(20) DEFAULT 'Active' CHECK (resident_status IN ('Active', 'Vacated', 'Transferred', 'On Leave')),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (quarters_no) REFERENCES quarters_residents(quarters_no)
);

CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  actor VARCHAR(80) NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert C-Type Records (C1 to C18)
INSERT INTO quarters_residents (quarters_no, name, designation, department, phone_no, ifhrms_no, ref_no_and_date, occupy_date, eb_no, quarters_type) VALUES
('C1', 'Dr.V. Balaji', 'Doctor', 'Medicine', NULL, NULL, NULL, NULL, NULL, 'C'),
('C2', 'Dr.V. Slimbarasan', 'Doctor', 'Medicine', NULL, NULL, NULL, NULL, NULL, 'C'),
('C3', 'Dr.S.K. Jayaswarya', 'Doctor', 'Medicine', NULL, NULL, NULL, NULL, NULL, 'C'),
('C4', 'Dr.A. Marudhavanan', 'Doctor', 'Medicine', NULL, NULL, NULL, NULL, NULL, 'C'),
('C5', 'Dr.S. Balasubramanian', 'Doctor', 'Medicine', NULL, NULL, NULL, NULL, NULL, 'C'),
('C6', 'Dr.T. Karthikeyan', 'Doctor', 'Medicine', NULL, NULL, NULL, NULL, NULL, 'C'),
('C7', 'Dr.A.Mary Arul priya', 'Doctor', 'Medicine', NULL, NULL, NULL, NULL, NULL, 'C'),
('C8', 'Dr.A.Daivik', 'Doctor', 'Medicine', NULL, NULL, NULL, NULL, NULL, 'C'),
('C9', 'Dr.P.Gomathi', 'Doctor', 'Medicine', NULL, NULL, NULL, NULL, NULL, 'C'),
('C10', 'Dr.M.Srimuthalage', 'Doctor', 'Medicine', NULL, NULL, NULL, NULL, NULL, 'C'),
('C11', 'Dr.K.Shankar', 'Doctor', 'Medicine', NULL, NULL, NULL, NULL, NULL, 'C'),
('C12', 'Dr.S.Jeyakumar', 'Doctor', 'Medicine', NULL, NULL, NULL, NULL, NULL, 'C'),
('C13', 'Dr.P. Tamilarsi', 'Doctor', 'Medicine', NULL, NULL, NULL, NULL, NULL, 'C'),
('C14', 'Dr.M. Sathish', 'Doctor', 'Medicine', NULL, NULL, NULL, NULL, NULL, 'C'),
('C15', 'Dr.L.Mohanapriya', 'Doctor', 'Medicine', NULL, NULL, NULL, NULL, NULL, 'C'),
('C16', 'Dr.S. Mukilan', 'Doctor', 'Medicine', NULL, NULL, NULL, NULL, NULL, 'C'),
('C17', 'Dr.S. Vigneshwari', 'Doctor', 'Medicine', NULL, NULL, NULL, NULL, NULL, 'C'),
('C18', 'Dr.A.Gayatri', 'Doctor', 'Medicine', NULL, NULL, NULL, NULL, NULL, 'C');

-- Insert A-Type Records (A1 to A36) - With detailed data from user
INSERT INTO quarters_residents (quarters_no, name, designation, department, phone_no, ifhrms_no, ref_no_and_date, occupy_date, eb_no, quarters_type) VALUES
('A1','P.R.ARVIND','Junior Assistant','College','8056123012','19031159364','012/P&D/2022 &14.02.2022','2022-02-15','203-006-919','A'),
('A2','M.DEEPA','Assitant','College','9629133444','19030866491','012/P&D/2022 &31.01.2022',NULL,'203-006-920','A'),
('A3','B.MENAKA','Assitant','College','8675572755','19030537473','012/P&D/2022 &01.02.2022','2022-02-01','203-006-921','A'),
('A4','S.SHANKAR','Junior Assistant','Hospital','9965148617',NULL,'3980/P&D-3/2023 & 01.11.2023','2023-12-01','203-006-922','A'),
('A5','A.THIYARAJAN','Plaster Technician','Hospital','9487486642',NULL,'2956/P&D/2023 &06.01.2025',NULL,'203-006-923','A'),
('A6','M.BALAMURGAN','Magnetic Resonance Tomography','Hospital','8428324363',NULL,'1402/P&D4/2023 & 28.04.2023','2023-05-01','203-006-924','A'),
('A7','M.KUMAR','Dark Room Assistant','Hospital','9976463732',NULL,'2126/P&D-5/2023 & 04.12.2023','2023-12-04','203-006-925','A'),
('A8','M.MUTHU KRISHAN','Junior Assistant','Hospital','6379114265',NULL,'3508/P&D3/2025 &24.09.2025','2025-09-24','203-006-926','A'),
('A9','M.SETTU','Assitant','College','8110802547','19030928352','012/P&D/2022 &17.01.2022','2022-01-17','203-006-927','A'),
('A10','M.MUTHAMIZH','Junior Assistant','College','9092939360','19031164787','012/P&D/2022 &17.01.2022','2022-01-17','203-006-928','A'),
('A11','P.BOOBALAN','Hospital Worker','Hospital','9944860339',NULL,'012/P&D/2022 &31.01.2022','2022-02-01','203-006-929','A'),
('A12','G.SURESH','Junior Assistant','College','9789663966','19031164700','012/P&D/2022 &31.01.2022',NULL,'203-006-930','A'),
('A13','S.KALA','Junior Assistant','College','9486136535','19030503197','13103/P&D/2022 &17.06.2022','2022-06-14','203-006-931','A'),
('A14','P.SAKUNTHALA','Junior Assistant','College','6374436290','19030503071','13104/P&D/2022 &14.06.2022','2022-06-14','203-006-932','A'),
('A15','A.GEETHA','Steno Typist','College','8825471804','19030532255','012/P&D/2022 &31.01.2022','2022-02-01','203-006-933','A'),
('A16','D.SATHIS KUMAR','Junior Assistant','Hospital','7530018833',NULL,'012/P&D/2022 &31.01.2022','2022-02-01','203-006-934','A'),
('A17','R.A,LASKSHMI DEVI','Junior Assistant','College','9025791513','19031248269','3685/P&D3/2025 &30.10.2025','2025-11-01','203-006-935','A'),
('A18','R.PALANIAMMAL','Record Clerk','College','9042479295','19030732300','924/P&D/2/2023 & 16.03.2023','2023-03-16','203-006-936','A'),
('A19','S.SAMUNDESWARI','Junior Assistant','College','8675536090','19030506434','1320/P&D/2022 &30.06.2022','2022-07-01','203-006-937','A'),
('A20','K.REVATHI','Record Clerk','College','9865250520','19031062703','864/P&D2/2023 729.03.2023','2023-04-01','203-006-938','A'),
('A21','M.RADHAMANI','', '', '', '', '', '', '', 'A'),
('A22','A.ARUNSHANKAR','', '', '', '', '', '', '', 'A'),
('A23','P.ANANDHAN','', '', '', '', '', '', '', 'A'),
('A24','S.KOKILA','', '', '', '', '', '', '', 'A'),
('A25','N.PACHAMUTHU','', '', '', '', '', '', '', 'A'),
('A26','S.GUGANATHAN','', '', '', '', '', '', '', 'A'),
('A27','S.UMAMAHESWARI','', '', '', '', '', '', '', 'A'),
('A28','S.STELLARUBI','', '', '', '', '', '', '', 'A'),
('A29','S.SUBHA','', '', '', '', '', '', '', 'A'),
('A30','S.RAMESH','', '', '', '', '', '', '', 'A'),
('A31','S.SOMALATHA','', '', '', '', '', '', '', 'A'),
('A32','M.KALAIVANI','', '', '', '', '', '', '', 'A'),
('A33','R.PUSPAM','', '', '', '', '', '', '', 'A'),
('A34','R.SEVI','', '', '', '', '', '', '', 'A'),
('A35','M.PUSPHASHERILI','', '', '', '', '', '', '', 'A'),
('A36','S.VASANTHA','', '', '', '', '', '', '', 'A');

-- Insert D-Type Records (D1 to D8) - With detailed data from user
INSERT INTO quarters_residents (quarters_no, name, designation, department, phone_no, ifhrms_no, ref_no_and_date, occupy_date, eb_no, quarters_type) VALUES
('D1','Dr.M. Dhanasekaran','Associate Professor','Pharmacology','9840612986','19030460640','012/P&D/2022 & 17.01.2022','2022-01-17','203-006-909','D'),
('D2','Dr.R. Gunasekaran','Medical Superintendent','Emergency Medicine','9488573642','19030575560','306/P&D/2022 &15.02.2022','2022-02-15','203-006-910','D'),
('D3','Dr.S.Dhanalakshmi','Associate Professor','Community Medicine','9003058296','19030498864','1198/P&D-1/2025 & 01.04.2025','2025-03-01','203-006-911','D'),
('D4','Dr.P.Arul','Associate Professor','General Medicine','6380139951','19030402373','5032/P&D/2024 &26.10.2024','2024-11-01','203-006-912','D'),
('D5','Dr.P. Saravanan','Professor','Pharmacology','8838561198','19030512930','959/P&D/4/2023 &29.03.2023','2023-04-01','203-006-913','D'),
('D6','Dr.A.Leena Devi','Professor','Biochemistry','8525052300','19030730961','5096/P&D/2024 &21.11.2024','2024-12-01','203-006-914','D'),
('D7','Dr.M.Sumathi','Professor','Pathology','9843060785','19020701305','1134/P&D-5/2024 &05.03.2024','2024-03-04','203-006-915','D'),
('D8','Dr.M.Duraimurgan','Professor','Community Medicine','9894133089','19030417948','5121/P&D/2024 &21.11.2024','2024-12-01','203-006-916','D');