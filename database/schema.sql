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
    entry_date DATE,
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

CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  actor VARCHAR(80) NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO quarters_residents
(quarters_no, name, entry_date, designation, department, phone_no, ifhrms_no, ref_no_and_date, occupy_date, eb_no, quarters_type)
VALUES
('A1','P.R.ARVIND',NULL,'Junior Assistant','College','8056123012','19031159364','012/P&D/2022 &14.02.2022','2022-02-15','203-006-919','A'),
('A2','M.DEEPA',NULL,'Assitant','College','9629133444','19030866491','012/P&D/2022 &31.01.2022',NULL,'203-006-920','A'),
('A3','B.MENAKA',NULL,'Assitant','College','8675572755','19030537473','012/P&D/2022 &01.02.2022','2022-02-01','203-006-921','A'),
('A4','S.SHANKAR',NULL,'Junior Assistant','Hospital','9965148617',NULL,'3980/P&D-3/2023 & 01.11.2023','2023-12-01','203-006-922','A'),
('A5','A.THIYARAJAN',NULL,'Plaster Technician','Hospital','9487486642',NULL,'2956/P&D/2023 &06.01.2025',NULL,'203-006-923','A'),
('A6','M.BALAMURGAN',NULL,'Magnetic Resonance Tomography','Hospital','8428324363',NULL,'1402/P&D4/2023 & 28.04.2023','2023-05-01','203-006-924','A'),
('A7','M.KUMAR',NULL,'Dark Room Assistant','Hospital','9976463732',NULL,'2126/P&D-5/2023 & 04.12.2023','2023-12-04','203-006-925','A'),
('A8','M.MUTHU KRISHAN',NULL,'Junior Assistant','Hospital','6379114265',NULL,'3508/P&D3/2025 &24.09.2025','2025-09-24','203-006-926','A'),
('A9','M.SETTU',NULL,'Assitant','College','8110802547','19030928352','012/P&D/2022 &17.01.2022','2022-01-17','203-006-927','A'),
('A10','M.MUTHAMIZH',NULL,'Junior Assistant','College','9092939360','19031164787','012/P&D/2022 &17.01.2022','2022-01-17','203-006-928','A'),
('A11','P.BOOBALAN',NULL,'Hospital Worker','Hospital','9944860339',NULL,'012/P&D/2022 &31.01.2022','2022-02-01','203-006-929','A'),
('A12','G.SURESH',NULL,'Junior Assistant','College','9789663966','19031164700','012/P&D/2022 &31.01.2022',NULL,'203-006-930','A'),
('A13','S.KALA',NULL,'Junior Assistant','College','9486136535','19030503197','13103/P&D/2022 &17.06.2022','2022-06-14','203-006-931','A'),
('A14','P.SAKUNTHALA',NULL,'Junior Assistant','College','6374436290','19030503071','13104/P&D/2022 &14.06.2022','2022-06-14','203-006-932','A'),
('A15','A.GEETHA',NULL,'Steno Typist','College','8825471804','19030532255','012/P&D/2022 &31.01.2022','2022-02-01','203-006-933','A'),
('A16','D.SATHIS KUMAR',NULL,'Junior Assistant','Hospital','7530018833',NULL,'012/P&D/2022 &31.01.2022','2022-02-01','203-006-934','A'),
('A17','R.A,LASKSHMI DEVI',NULL,'Junior Assistant','College','9025791513','19031248269','3685/P&D3/2025 &30.10.2025','2025-11-01','203-006-935','A'),
('A18','R.PALANIAMMAL',NULL,'Record Clerk','College','9042479295','19030732300','924/P&D/2/2023 & 16.03.2023','2023-03-16','203-006-936','A'),
('A19','S.SAMUNDESWARI',NULL,'Junior Assistant','College','8675536090','19030506434','1320/P&D/2022 &30.06.2022','2022-07-01','203-006-937','A'),
('A20','K.REVATHI',NULL,'Record Clerk','College','9865250520','19031062703','864/P&D2/2023 729.03.2023','2023-04-01','203-006-938','A'),
('A21','M.RADHAMANI','2023-05-05','Magnetic Resonance Tomography','Hospital','9629452012',NULL,'1725/P&D4/2023 & 12.05.2023','2023-05-15','203-006-939','A'),
('A22','A.ARUNSHANKAR','2023-03-10','Record Clerk','College','9677909804','19031018092','867/P&D4/2023 & 31.03.2023','2023-04-01','203-006-940','A'),
('A23','P.ANANDHAN','2023-10-09','Record Clerk','College','9486595497','19030503023','3427/P&D4/2023 & 31.03.2023','2023-04-01','203-006-941','A'),
('A24','S.KOKILA','2023-04-19','Assitant','College','8489056677','19030988365','1394/P&D4/2023 & 28.04.2023','2023-05-01','203-006-942','A'),
('A25','N.PACHAMUTHU','2022-07-11','Assitant','College','9384605014','19020832960','1595/P&D2/2022 & 14.10.2022','2022-10-15','203-006-943','A'),
('A26','S.GUGANATHAN','2022-06-17','Steno Typist','College','9500603378','19031002113','1356/P&D2/2022 &29.07.2022','2022-08-01','203-006-944','A'),
('A27','S.UMAMAHESWARI','2023-03-15','Staff Nurse','Hospital','8220572609',NULL,'988/P&D4/2023 &31.03.2023','2023-04-01','203-006-945','A'),
('A28','S.STELLARUBI','2023-03-15','Staff Nurse','Hospital','8754770407',NULL,'987/P&D4/2023 & 29.03.2023','2023-04-01','203-006-946','A'),
('A29','S.SUBHA','2023-05-18','Staff Nurse','Hospital','8940446961',NULL,'1829/P&D4/2023 & 31.05.2023','2023-06-01','203-006-947','A'),
('A30','S.RAMESH','2021-12-30','Junior Assistant','College','9578764717','19031248245','3751/P&D2/2023 & 03.11.2023','2023-11-03','203-006-948','A'),
('A31','S.SOMALATHA','2023-05-26','DARK ROOM','Hospital','9901202773',NULL,'1944/P&D4/2023 &07.05.2023','2023-07-01','203-006-949','A'),
('A32','M.KALAIVANI','2021-12-30','Multipurpose Staff','Hospital',NULL,NULL,'012/P&D/2022 &31.01.2022','2022-02-01','203-006-950','A'),
('A33','R.PUSPAM','2023-05-19','Staff Nurse','Hospital','7598158202',NULL,'1827/P&D/4/2023 &31.05.2023','2023-06-01','203-006-951','A'),
('A34','R.SEVI','2023-05-05','Assitant','College','9751255090','19030547190','1656/P&D2/2023 & 12.05.2023','2023-05-15','203-006-952','A'),
('A35','M.PUSPHASHERILI','2023-04-12','Staff Nurse','Hospital','9677138798',NULL,'1369/P&D/4/2023 & 28.04.2023','2023-05-01','203-006-953','A'),
('A36','S.VASANTHA','2021-12-29','Sanitary Worker','Hospital',NULL,NULL,'3900/P&D5/2023 & 04.12.2023','2023-12-04','203-006-954','A');

INSERT INTO quarters_residents
(quarters_no, name, entry_date, designation, department, phone_no, ifhrms_no, ref_no_and_date, occupy_date, eb_no, quarters_type)
VALUES
('C1','Dr.V. Balaji',NULL,'Assistant Professor','Pharmacology','9345822444','19030640755','3213/P&D-2/2022 &01.11.2022','2022-09-08','203-006-891','C'),
('C2','Dr.V. Slimbarasan',NULL,'Junior Resident','Anaesthology','8807312482','19020990144','2972/P&D/2024 &26.10.2024','2024-11-01','203-006-892','C'),
('C3','Dr.S.K. Jayaswarya',NULL,'Tutor','Microbiology','9655030202','19030842665','3867/P&D-2/2022 & 30.05.2023','2024-06-01','203-006-893','C'),
('C4','Dr.A. Marudhavanan',NULL,'Junior Resident','Psychitary','9791411324','19030538547','3224/P&D-3/2026 &02.01.2026','2026-01-01','203-006-894','C'),
('C5','Dr.S. Balasubramanian',NULL,'Assistan Professor','Anaesthology','9789820258','19010922253','5122/P&D-3/2026 02.01.2026','2026-01-01','203-006-895','C'),
('C6','Dr.T. Karthikeyan',NULL,'Assistant Surgeon','Caustaly Medical Officer(Nhm)',NULL,NULL,'2900/P&D-3/2023 & 29.09.2023','2023-10-01','203-006-896','C'),
('C7','Dr.A.Mary Arul priya',NULL,'Assistant Professor','Bio-chemistry','9842259852','19040773236','0373/P&D/2022 & 28.02.2022','2022-03-01','203-006-897','C'),
('C8','Dr.A.Daivik',NULL,'Tutor','Community Medicine','9889811501','19040547602','2973/P&D-3/2023 &30.11.2023','2023-12-01','203-006-898','C'),
('C9','Dr.P.Gomathi',NULL,'Senior Resident','Anaesthology','9025754759','19030538769','0228/P&D/2025 & 20.01.2025','2025-02-01','203-006-899','C'),
('C10','Dr.M.Srimuthalage',NULL,'Tutor','Anatomy','9629145780','19010510846','0012/P&D/2022 & 31.01.2022','2022-02-01','203-006-900','C'),
('C11','Dr.K.Shankar',NULL,'Assistant professor','Community Medicine','9655370481','19010510461','1447/P&D/2022 & 30.06.2022','2022-07-01','203-006-901','C'),
('C12','Dr.S.Jeyakumar',NULL,'Junior Resident','Anaesthology','9566496046','19040529319','2813/P&D-3/2023 &22.08.2023','2023-08-09','203-006-902','C'),
('C13','Dr.P. Tamilarsi',NULL,'Assistan Professor','Pathology','9894113215','19040497007','2773/P&D-5/2024 &14.06.2024','2024-06-14','203-006-903','C'),
('C14','Dr.M. Sathish',NULL,'Assistan Surgeon','Orthopedics','9047207890','19040847864','2495/P&D/2024 &04.06.2024','2024-06-04','203-006-904','C'),
('C15','Dr.L.Mohanapriya',NULL,'Assistan Surgeon','Pathology(nhm)','8667087474','19040532096','1866/P&D-4/2023 &01.06.2023','2023-06-01','203-006-905','C'),
('C16','Dr.S. Mukilan',NULL,'Tutor','Community Medicine','9488345055','19040531854','2940/P&D-3/2023 29.08.2023','2023-08-29','203-006-906','C'),
('C17','Dr.S. Vigneshwari',NULL,'Tutor','Pathology','9443723445','19040913544','1215/P&D-1/2025 18.03.2025','2025-03-18','203-006-907','C'),
('C18','Dr.A.Gayatri',NULL,'Senior Resident','Obstetrics and Gynaecology','9008974497','19010953715','4197/P&D-3/2023 31.01.2024','2024-02-01','203-006-908','C');

INSERT INTO quarters_residents
(quarters_no, name, entry_date, designation, department, phone_no, ifhrms_no, ref_no_and_date, occupy_date, eb_no, quarters_type)
VALUES
('D1','Dr.M. Dhanasekaran',NULL,'Associate Professor','Pharmacology','9840612986','19030460640','012/P&D/2022 & 17.01.2022','2022-01-17','203-006-909','D'),
('D2','Dr.R. Gunasekaran',NULL,'Medical Superintendent','Emergency Medicine','9488573642','19030575560','306/P&D/2022 &15.02.2022','2022-02-15','203-006-910','D'),
('D3','Dr.S.Dhanalakshmi',NULL,'Associate Professor','Community Medicine','9003058296','19030498864','1198/P&D-1/2025 & 01.04.2025','2025-03-01','203-006-911','D'),
('D4','Dr.P.Arul',NULL,'Associate Professor','General Medicine','6380139951','19030402373','5032/P&D/2024 &26.10.2024','2024-11-01','203-006-912','D'),
('D5','Dr.P. Saravanan',NULL,'Professor','Pharmacology','8838561198','19030512930','959/P&D/4/2023 &29.03.2023','2023-04-01','203-006-913','D'),
('D6','Dr.A.Leena Devi',NULL,'Professor','Biochemistry','8525052300','19030730961','5096/P&D/2024 &21.11.2024','2024-12-01','203-006-914','D'),
('D7','Dr.M.Sumathi',NULL,'Professor','Pathology','9843060785','19020701305','1134/P&D-5/2024 &05.03.2024','2024-03-04','203-006-915','D'),
('D8','Dr.M.Duraimurgan',NULL,'Professor','Community Medicine','9894133089','19030417948','5121/P&D/2024 &21.11.2024','2024-12-01','203-006-916','D');
