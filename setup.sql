-- ============================================================
-- PET ADOPTION AND CARE SYSTEM
-- Full Database Setup Script for pgAdmin (PostgreSQL)
-- Run this entire script in pgAdmin Query Tool
-- ============================================================

-- Step 1: Create all tables in dependency order

-- ─────────────────────────────────────────────────────────────
-- SHELTER  (independent — no foreign keys)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Shelter (
    shelter_id    VARCHAR(10)  PRIMARY KEY,
    shelter_name  VARCHAR(100) NOT NULL,
    address       VARCHAR(200),
    capacity      INT          CHECK (capacity > 0),
    phone         VARCHAR(15)  UNIQUE
);

-- ─────────────────────────────────────────────────────────────
-- PETS  (depends on Shelter)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Pets (
    pet_id           VARCHAR(10)  PRIMARY KEY,
    name             VARCHAR(50)  NOT NULL,
    breed            VARCHAR(50),
    age              INT          CHECK (age >= 0),
    gender           VARCHAR(10)  CHECK (gender IN ('Male','Female')),
    weight_kg        DECIMAL(5,2),
    intake_date      DATE         DEFAULT CURRENT_DATE,
    adoption_status  VARCHAR(20)  DEFAULT 'Available'
                                  CHECK (adoption_status IN ('Available','Adopted','Reserved')),
    microchip_id     VARCHAR(30)  UNIQUE,
    is_vaccinated    BOOLEAN      DEFAULT FALSE,
    shelter_id       VARCHAR(10)  REFERENCES Shelter(shelter_id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────────────────────────
-- PET SPECIES SUBCLASSES  (depend on Pets — specialization)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Dog (
    pet_id      VARCHAR(10) PRIMARY KEY REFERENCES Pets(pet_id) ON DELETE CASCADE,
    size        VARCHAR(20) CHECK (size IN ('Small','Medium','Large')),
    is_trained  BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS Cat (
    pet_id      VARCHAR(10) PRIMARY KEY REFERENCES Pets(pet_id) ON DELETE CASCADE,
    is_indoor   BOOLEAN DEFAULT TRUE,
    fur_length  VARCHAR(20) CHECK (fur_length IN ('Short','Medium','Long'))
);

CREATE TABLE IF NOT EXISTS Other_Animal (
    pet_id       VARCHAR(10) PRIMARY KEY REFERENCES Pets(pet_id) ON DELETE CASCADE,
    species_name VARCHAR(50) NOT NULL
);

-- ─────────────────────────────────────────────────────────────
-- PET PHOTOS  (multi-valued attribute of Pets)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Pet_Photos (
    photo_id   SERIAL       PRIMARY KEY,
    pet_id     VARCHAR(10)  NOT NULL REFERENCES Pets(pet_id) ON DELETE CASCADE,
    photo_url  VARCHAR(300) NOT NULL
);

-- ─────────────────────────────────────────────────────────────
-- ADOPTERS  (independent)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Adopters (
    adopter_id  VARCHAR(10)  PRIMARY KEY,
    first_name  VARCHAR(50)  NOT NULL,
    last_name   VARCHAR(50)  NOT NULL,
    email       VARCHAR(100) UNIQUE,
    phone       VARCHAR(15)  UNIQUE NOT NULL,
    address     VARCHAR(200),
    dob         DATE,
    id_proof    VARCHAR(100)
);

-- ─────────────────────────────────────────────────────────────
-- ADOPTER SUBCLASSES  (specialization — overlapping 'o')
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Individual (
    adopter_id  VARCHAR(10) PRIMARY KEY REFERENCES Adopters(adopter_id) ON DELETE CASCADE,
    occupation  VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS Organization (
    adopter_id   VARCHAR(10)  PRIMARY KEY REFERENCES Adopters(adopter_id) ON DELETE CASCADE,
    org_reg_no   VARCHAR(50)  NOT NULL
);

-- ─────────────────────────────────────────────────────────────
-- REFERENCES  (weak entity — depends on Adopters)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS References_Table (
    ref_id      SERIAL       PRIMARY KEY,
    adopter_id  VARCHAR(10)  NOT NULL REFERENCES Adopters(adopter_id) ON DELETE CASCADE,
    ref_name    VARCHAR(100) NOT NULL,
    ref_phone   VARCHAR(15)  NOT NULL
);

-- ─────────────────────────────────────────────────────────────
-- ADOPTION_APPLICATIONS  (weak entity — Adopters + Pets)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Adoption_Applications (
    application_id    VARCHAR(10)  PRIMARY KEY,
    application_date  DATE         NOT NULL DEFAULT CURRENT_DATE,
    status            VARCHAR(20)  DEFAULT 'Pending'
                                   CHECK (status IN ('Pending','Approved','Rejected')),
    notes             TEXT,
    adopter_id        VARCHAR(10)  NOT NULL REFERENCES Adopters(adopter_id) ON DELETE CASCADE,
    pet_id            VARCHAR(10)  NOT NULL REFERENCES Pets(pet_id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────────────────────
-- PET_CARE_PROVIDERS  (independent)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Pet_Care_Providers (
    provider_id    VARCHAR(10)  PRIMARY KEY,
    name           VARCHAR(100) NOT NULL,
    qualification  VARCHAR(100),
    phone          VARCHAR(15)  UNIQUE,
    email          VARCHAR(100),
    visiting_fee   DECIMAL(8,2)
);

-- ─────────────────────────────────────────────────────────────
-- PROVIDER SUBCLASSES  (disjoint 'd' specialization)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Veterinarian (
    provider_id     VARCHAR(10)  PRIMARY KEY REFERENCES Pet_Care_Providers(provider_id) ON DELETE CASCADE,
    vet_license_no  VARCHAR(50)  NOT NULL UNIQUE,
    specialization  VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS Groomer (
    provider_id      VARCHAR(10)  PRIMARY KEY REFERENCES Pet_Care_Providers(provider_id) ON DELETE CASCADE,
    tools_used       VARCHAR(200),
    grooming_styles  VARCHAR(200)
);

-- ─────────────────────────────────────────────────────────────
-- PROVIDER AVAILABILITY  (multi-valued attribute)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Provider_Availability (
    avail_id     SERIAL      PRIMARY KEY,
    provider_id  VARCHAR(10) NOT NULL REFERENCES Pet_Care_Providers(provider_id) ON DELETE CASCADE,
    day_of_week  VARCHAR(15) CHECK (day_of_week IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'))
);

-- ─────────────────────────────────────────────────────────────
-- APPOINTMENTS  (weak entity — Pets + Pet_Care_Providers)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Appointments (
    appointment_id    VARCHAR(10)  PRIMARY KEY,
    appointment_date  DATE         NOT NULL,
    service_type      VARCHAR(50)  NOT NULL,
    duration_mins     INT,
    notes             TEXT,
    pet_id            VARCHAR(10)  NOT NULL REFERENCES Pets(pet_id) ON DELETE CASCADE,
    provider_id       VARCHAR(10)  NOT NULL REFERENCES Pet_Care_Providers(provider_id) ON DELETE RESTRICT
);

-- ─────────────────────────────────────────────────────────────
-- MEDICAL_RECORDS  (weak entity — depends on Pets)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Medical_Records (
    record_id       SERIAL        PRIMARY KEY,
    record_date     DATE          NOT NULL DEFAULT CURRENT_DATE,
    diagnosis       TEXT,
    treatment       TEXT,
    follow_up_date  DATE,
    cost            DECIMAL(10,2),
    pet_id          VARCHAR(10)   NOT NULL REFERENCES Pets(pet_id) ON DELETE CASCADE,
    provider_id     VARCHAR(10)   REFERENCES Veterinarian(provider_id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────────────────────────
-- STAFF  (independent)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Staff (
    staff_id  VARCHAR(10)  PRIMARY KEY,
    name      VARCHAR(100) NOT NULL,
    role      VARCHAR(50),
    shift     VARCHAR(20)  CHECK (shift IN ('Morning','Evening','Night'))
);

-- ─────────────────────────────────────────────────────────────
-- STAFF SUBCLASSES  (disjoint 'd' specialization)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Volunteer (
    staff_id      VARCHAR(10) PRIMARY KEY REFERENCES Staff(staff_id) ON DELETE CASCADE,
    hours_per_week INT
);

CREATE TABLE IF NOT EXISTS Employee (
    staff_id  VARCHAR(10)    PRIMARY KEY REFERENCES Staff(staff_id) ON DELETE CASCADE,
    salary    DECIMAL(10,2),
    emp_id    VARCHAR(20)    UNIQUE
);

-- ─────────────────────────────────────────────────────────────
-- STAFF_PET  (M:N junction — Staff CARES FOR Pets)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Staff_Pet (
    staff_id  VARCHAR(10) REFERENCES Staff(staff_id) ON DELETE CASCADE,
    pet_id    VARCHAR(10) REFERENCES Pets(pet_id) ON DELETE CASCADE,
    PRIMARY KEY (staff_id, pet_id)
);

-- ─────────────────────────────────────────────────────────────
-- DONATION  (depends on Adopters)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Donation (
    donation_id    VARCHAR(10)   PRIMARY KEY,
    amount         DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    donation_date  DATE          NOT NULL DEFAULT CURRENT_DATE,
    purpose        VARCHAR(200),
    payment_mode   VARCHAR(30)   CHECK (payment_mode IN ('Cash','UPI','Bank Transfer','Cheque')),
    adopter_id     VARCHAR(10)   REFERENCES Adopters(adopter_id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────────────────────────
-- TRAINING_PROGRAMS  (independent)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Training_Programs (
    program_id      VARCHAR(10)  PRIMARY KEY,
    program_name    VARCHAR(100) NOT NULL,
    duration_weeks  INT          CHECK (duration_weeks > 0),
    trainer_name    VARCHAR(100)
);

-- ─────────────────────────────────────────────────────────────
-- DOG_TRAINING  (M:N junction — Dog ENROLLS IN Training)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Dog_Training (
    pet_id      VARCHAR(10) REFERENCES Dog(pet_id) ON DELETE CASCADE,
    program_id  VARCHAR(10) REFERENCES Training_Programs(program_id) ON DELETE CASCADE,
    PRIMARY KEY (pet_id, program_id)
);

-- ─────────────────────────────────────────────────────────────
-- APPLICATION_AUDIT  (for trigger logging)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Application_Audit (
    audit_id        SERIAL      PRIMARY KEY,
    application_id  VARCHAR(10),
    adopter_id      VARCHAR(10),
    pet_id          VARCHAR(10),
    logged_at       TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    action_type     VARCHAR(10)
);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Trigger 1: Auto-set pet status to 'Adopted' when application approved
CREATE OR REPLACE FUNCTION update_pet_status_on_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Approved' AND OLD.status <> 'Approved' THEN
        UPDATE Pets SET adoption_status = 'Adopted'
        WHERE pet_id = NEW.pet_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_approval_status ON Adoption_Applications;
CREATE TRIGGER trg_approval_status
AFTER UPDATE ON Adoption_Applications
FOR EACH ROW EXECUTE FUNCTION update_pet_status_on_approval();

-- Trigger 2: Block appointment for already-adopted pet
CREATE OR REPLACE FUNCTION prevent_appointment_for_adopted()
RETURNS TRIGGER AS $$
DECLARE v_status VARCHAR(20);
BEGIN
    SELECT adoption_status INTO v_status FROM Pets WHERE pet_id = NEW.pet_id;
    IF v_status = 'Adopted' THEN
        RAISE EXCEPTION 'Cannot schedule appointment: pet % is already adopted.', NEW.pet_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_pet_status ON Appointments;
CREATE TRIGGER trg_check_pet_status
BEFORE INSERT ON Appointments
FOR EACH ROW EXECUTE FUNCTION prevent_appointment_for_adopted();

-- Trigger 3: Log every new adoption application
CREATE OR REPLACE FUNCTION log_new_application()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO Application_Audit (application_id, adopter_id, pet_id, action_type)
    VALUES (NEW.application_id, NEW.adopter_id, NEW.pet_id, 'INSERT');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_application ON Adoption_Applications;
CREATE TRIGGER trg_log_application
AFTER INSERT ON Adoption_Applications
FOR EACH ROW EXECUTE FUNCTION log_new_application();

-- ============================================================
-- VIEWS
-- ============================================================

CREATE OR REPLACE VIEW Available_Pets AS
SELECT pet_id, name, breed, age, gender, adoption_status
FROM Pets WHERE adoption_status = 'Available';

CREATE OR REPLACE VIEW Pending_Applications_View AS
SELECT aa.application_id, aa.application_date,
       p.name AS pet_name, p.breed,
       ad.first_name || ' ' || ad.last_name AS adopter_name, ad.phone
FROM Adoption_Applications aa
JOIN Pets p ON aa.pet_id = p.pet_id
JOIN Adopters ad ON aa.adopter_id = ad.adopter_id
WHERE aa.status = 'Pending';

CREATE OR REPLACE VIEW Pet_Appointment_History AS
SELECT p.name AS pet_name, p.breed,
       a.appointment_date, a.service_type, a.duration_mins,
       pcp.name AS provider_name, pcp.visiting_fee
FROM Appointments a
JOIN Pets p ON a.pet_id = p.pet_id
JOIN Pet_Care_Providers pcp ON a.provider_id = pcp.provider_id;

-- ============================================================
-- SAMPLE DATA
-- ============================================================

-- Shelter
INSERT INTO Shelter VALUES ('SH001','Happy Paws Shelter','12 MG Road, Mumbai',50,'9000000001')
ON CONFLICT DO NOTHING;

-- Pets
INSERT INTO Pets VALUES
('P001','Buddy',   'Labrador',       2,'Male',  12.5,'2023-06-01','Available','MC001',TRUE, 'SH001'),
('P002','Tommy',   'Pomeranian',     3,'Male',   4.2,'2023-03-15','Adopted',  'MC002',TRUE, 'SH001'),
('P003','Whiskers','Persian Cat',    4,'Female', 3.8,'2023-08-20','Available','MC003',FALSE,'SH001'),
('P004','Rocky',   'German Shepherd',5,'Male',  30.0,'2022-11-10','Reserved', 'MC004',TRUE, 'SH001'),
('P005','Max',     'Beagle',         1,'Male',   9.0,'2024-01-05','Available','MC005',TRUE, 'SH001'),
('P006','Luna',    'Persian Cat',    2,'Female', 3.2,'2024-02-14','Available','MC006',FALSE,'SH001')
ON CONFLICT DO NOTHING;

-- Dog subclass
INSERT INTO Dog VALUES ('P001','Large',TRUE),('P002','Small',FALSE),
('P004','Large',TRUE),('P005','Medium',FALSE) ON CONFLICT DO NOTHING;

-- Cat subclass
INSERT INTO Cat VALUES ('P003',FALSE,'Long'),('P006',TRUE,'Medium') ON CONFLICT DO NOTHING;

-- Adopters
INSERT INTO Adopters VALUES
('AD001','Riya',  'Shah',  'riya@email.com', '9876543210','Andheri, Mumbai','1995-04-12','AADHAR-001'),
('AD002','Arjun', 'Mehta', 'arjun@email.com','9123456780','Pune',           '1990-07-22','AADHAR-002'),
('AD003','Sneha', 'Patel', 'sneha@email.com','9988001122','Thane',          '1998-01-30','AADHAR-003'),
('AD004','Karan', 'Joshi', 'karan@email.com','9765001234','Mumbai',         '1985-09-15','AADHAR-004')
ON CONFLICT DO NOTHING;

-- Individual subclass
INSERT INTO Individual VALUES ('AD001','Software Engineer'),('AD002','Teacher'),
('AD003','Doctor'),('AD004','Business Owner') ON CONFLICT DO NOTHING;

-- Organization subclass (AD004 is both Individual AND Organization — overlapping)
INSERT INTO Organization VALUES ('AD004','ORG-MH-2024') ON CONFLICT DO NOTHING;

-- References
INSERT INTO References_Table (adopter_id,ref_name,ref_phone) VALUES
('AD001','Priya Desai','9800011111'),
('AD001','Raj Mehta', '9800022222'),
('AD002','Sunita Shah','9800033333') ON CONFLICT DO NOTHING;

-- Pet_Care_Providers
INSERT INTO Pet_Care_Providers VALUES
('PR001','Dr. Priya Nair', 'BVSc, MVSc',    '9988776655','drpriya@vet.com',  800.00),
('PR002','Clean Paws Salon','Certified Groomer','9765432100','cleanpaws@mail.com',400.00),
('PR003','Dr. Ramesh Iyer','BVSc',           '9123001122','ramesh@vet.com',   700.00)
ON CONFLICT DO NOTHING;

-- Veterinarian subclass
INSERT INTO Veterinarian VALUES
('PR001','VET-MH-0012','Small Animal Surgery'),
('PR003','VET-MH-0045','General Practice') ON CONFLICT DO NOTHING;

-- Groomer subclass
INSERT INTO Groomer VALUES
('PR002','Clippers, Dryer, Combs','Puppy Cut, Teddy Bear Cut') ON CONFLICT DO NOTHING;

-- Provider Availability
INSERT INTO Provider_Availability (provider_id, day_of_week) VALUES
('PR001','Monday'),('PR001','Wednesday'),('PR001','Friday'),
('PR002','Tuesday'),('PR002','Thursday'),('PR002','Saturday'),
('PR003','Monday'),('PR003','Friday') ON CONFLICT DO NOTHING;

-- Adoption_Applications
INSERT INTO Adoption_Applications VALUES
('A001','2024-01-10','Pending', 'Interested in Buddy',  'AD001','P001'),
('A002','2024-01-12','Approved','Good home visit done', 'AD002','P002'),
('A003','2024-01-15','Pending', NULL,                   'AD002','P005'),
('A004','2024-01-20','Rejected','Space constraint',      'AD003','P004'),
('A005','2024-01-22','Pending', NULL,                   'AD004','P003')
ON CONFLICT DO NOTHING;

-- Appointments
INSERT INTO Appointments VALUES
('APT001','2024-01-05','Vaccination',    45, NULL,               'P001','PR001'),
('APT002','2024-01-12','Grooming',       60, 'Full bath + trim', 'P005','PR002'),
('APT003','2024-01-18','Checkup',        30, NULL,               'P003','PR001'),
('APT004','2024-01-25','Grooming',       45, NULL,               'P004','PR002'),
('APT005','2024-02-01','Vaccination',    30, 'Annual booster',   'P004','PR003')
ON CONFLICT DO NOTHING;

-- Medical_Records
INSERT INTO Medical_Records (record_date,diagnosis,treatment,follow_up_date,cost,pet_id,provider_id) VALUES
('2024-01-05','Healthy — routine vaccination','Rabies + Parvovirus vaccine','2025-01-05',800.00,'P001','PR001'),
('2024-01-18','Mild ear infection','Ear drops for 7 days','2024-01-25',700.00,'P003','PR001'),
('2024-02-01','Healthy — annual booster','Multi-vaccine administered',NULL,700.00,'P004','PR003')
ON CONFLICT DO NOTHING;

-- Staff
INSERT INTO Staff VALUES
('ST001','Anjali Rao',  'Caretaker','Morning'),
('ST002','Vikram Nair', 'Caretaker','Evening'),
('ST003','Meena Pillai','Manager',  'Morning')
ON CONFLICT DO NOTHING;

-- Volunteer subclass
INSERT INTO Volunteer VALUES ('ST001',20) ON CONFLICT DO NOTHING;

-- Employee subclass
INSERT INTO Employee VALUES ('ST002',28000.00,'EMP-2022-001'),
('ST003',45000.00,'EMP-2021-005') ON CONFLICT DO NOTHING;

-- Staff_Pet (M:N)
INSERT INTO Staff_Pet VALUES
('ST001','P001'),('ST001','P003'),('ST001','P005'),
('ST002','P002'),('ST002','P004'),('ST002','P006')
ON CONFLICT DO NOTHING;

-- Donation
INSERT INTO Donation VALUES
('DON001',2000.00,'2024-01-15','Food supplies',  'Cash',         'AD001'),
('DON002',5000.00,'2024-02-01','Medical fund',   'UPI',          'AD002'),
('DON003',1500.00,'2024-02-10','General support','Bank Transfer', 'AD004')
ON CONFLICT DO NOTHING;

-- Training_Programs
INSERT INTO Training_Programs VALUES
('TR001','Basic Obedience', 4,'Rohan Verma'),
('TR002','Advanced Agility',8,'Suresh Pillai')
ON CONFLICT DO NOTHING;

-- Dog_Training (M:N)
INSERT INTO Dog_Training VALUES
('P001','TR001'),('P001','TR002'),
('P004','TR001'),('P005','TR001')
ON CONFLICT DO NOTHING;

-- ============================================================
-- VERIFY ALL TABLES
-- ============================================================
SELECT 'Shelter'              AS table_name, COUNT(*) AS rows FROM Shelter
UNION ALL SELECT 'Pets',                COUNT(*) FROM Pets
UNION ALL SELECT 'Dog',                 COUNT(*) FROM Dog
UNION ALL SELECT 'Cat',                 COUNT(*) FROM Cat
UNION ALL SELECT 'Other_Animal',        COUNT(*) FROM Other_Animal
UNION ALL SELECT 'Adopters',            COUNT(*) FROM Adopters
UNION ALL SELECT 'Individual',          COUNT(*) FROM Individual
UNION ALL SELECT 'Organization',        COUNT(*) FROM Organization
UNION ALL SELECT 'References_Table',    COUNT(*) FROM References_Table
UNION ALL SELECT 'Adoption_Applications',COUNT(*) FROM Adoption_Applications
UNION ALL SELECT 'Pet_Care_Providers',  COUNT(*) FROM Pet_Care_Providers
UNION ALL SELECT 'Veterinarian',        COUNT(*) FROM Veterinarian
UNION ALL SELECT 'Groomer',             COUNT(*) FROM Groomer
UNION ALL SELECT 'Appointments',        COUNT(*) FROM Appointments
UNION ALL SELECT 'Medical_Records',     COUNT(*) FROM Medical_Records
UNION ALL SELECT 'Staff',               COUNT(*) FROM Staff
UNION ALL SELECT 'Volunteer',           COUNT(*) FROM Volunteer
UNION ALL SELECT 'Employee',            COUNT(*) FROM Employee
UNION ALL SELECT 'Staff_Pet',           COUNT(*) FROM Staff_Pet
UNION ALL SELECT 'Donation',            COUNT(*) FROM Donation
UNION ALL SELECT 'Training_Programs',   COUNT(*) FROM Training_Programs
UNION ALL SELECT 'Dog_Training',        COUNT(*) FROM Dog_Training
ORDER BY table_name;
