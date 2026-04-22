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
-- ADOPTERS  (independent)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Adopters (
    adopter_id  VARCHAR(10)  PRIMARY KEY,
    first_name  VARCHAR(50)  NOT NULL,
    last_name   VARCHAR(50)  NOT NULL,
    email       VARCHAR(100) UNIQUE,
    phone       VARCHAR(15)  UNIQUE NOT NULL,
    address     VARCHAR(200)
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
-- APP_USERS  (for backend-backed authentication)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS App_Users (
    username       VARCHAR(50)  PRIMARY KEY,
    full_name      VARCHAR(100) NOT NULL,
    email          VARCHAR(100) UNIQUE,
    password_hash  TEXT         NOT NULL,
    role           VARCHAR(50)  NOT NULL DEFAULT 'Staff',
    created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
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
('P001','Buddy',   'Labrador',       2,'Male',  12.5,'2023-06-01','Available',TRUE, 'SH001'),
('P002','Tommy',   'Pomeranian',     3,'Male',   4.2,'2023-03-15','Adopted',  TRUE, 'SH001'),
('P003','Whiskers','Persian Cat',    4,'Female', 3.8,'2023-08-20','Available',FALSE,'SH001'),
('P004','Rocky',   'German Shepherd',5,'Male',  30.0,'2022-11-10','Reserved', TRUE, 'SH001'),
('P005','Max',     'Beagle',         1,'Male',   9.0,'2024-01-05','Available',TRUE, 'SH001'),
('P006','Luna',    'Persian Cat',    2,'Female', 3.2,'2024-02-14','Available',FALSE,'SH001')
ON CONFLICT DO NOTHING;

-- Dog subclass
INSERT INTO Dog VALUES ('P001','Large',TRUE),('P002','Small',FALSE),
('P004','Large',TRUE),('P005','Medium',FALSE) ON CONFLICT DO NOTHING;

-- Cat subclass
INSERT INTO Cat VALUES ('P003',FALSE,'Long'),('P006',TRUE,'Medium') ON CONFLICT DO NOTHING;

-- Adopters
INSERT INTO Adopters VALUES
('AD001','Riya',  'Shah',  'riya@email.com', '9876543210','Andheri, Mumbai'),
('AD002','Arjun', 'Mehta', 'arjun@email.com','9123456780','Pune'),
('AD003','Sneha', 'Patel', 'sneha@email.com','9988001122','Thane'),
('AD004','Karan', 'Joshi', 'karan@email.com','9765001234','Mumbai')
ON CONFLICT DO NOTHING;

-- Individual subclass
INSERT INTO Individual VALUES ('AD001','Software Engineer'),('AD002','Teacher'),
('AD003','Doctor'),('AD004','Business Owner') ON CONFLICT DO NOTHING;

-- Organization subclass (AD004 is both Individual AND Organization — overlapping)
INSERT INTO Organization VALUES ('AD004','ORG-MH-2024') ON CONFLICT DO NOTHING;

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

-- App_Users
INSERT INTO App_Users (username, full_name, email, password_hash, role) VALUES
('admin','Admin User','admin@pawsshelter.local','paws_admin_salt:442178fa0fc0cfb94e5fa573fa85e1b2c416d9252478ac04cfdab50d911077544901c05f760258de8455e51c44a89cfe4aa4ba4cf32de63c750f5591a69b7997','Administrator')
ON CONFLICT (username) DO NOTHING;

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
UNION ALL SELECT 'Adoption_Applications',COUNT(*) FROM Adoption_Applications
UNION ALL SELECT 'Pet_Care_Providers',  COUNT(*) FROM Pet_Care_Providers
UNION ALL SELECT 'Veterinarian',        COUNT(*) FROM Veterinarian
UNION ALL SELECT 'Groomer',             COUNT(*) FROM Groomer
UNION ALL SELECT 'Appointments',        COUNT(*) FROM Appointments
UNION ALL SELECT 'Staff',               COUNT(*) FROM Staff
UNION ALL SELECT 'Volunteer',           COUNT(*) FROM Volunteer
UNION ALL SELECT 'Employee',            COUNT(*) FROM Employee
UNION ALL SELECT 'Staff_Pet',           COUNT(*) FROM Staff_Pet
UNION ALL SELECT 'App_Users',           COUNT(*) FROM App_Users
ORDER BY table_name;
