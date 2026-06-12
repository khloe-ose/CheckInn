CREATE DATABASE IF NOT EXISTS checkinn_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE checkinn_db;

DROP TABLE IF EXISTS certificates;
DROP TABLE IF EXISTS attendance_logs;
DROP TABLE IF EXISTS participants;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'organizer') NOT NULL DEFAULT 'organizer',
  organization VARCHAR(160),
  phone VARCHAR(40),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  venue VARCHAR(180) NOT NULL,
  organizer_id INT NOT NULL,
  capacity INT NOT NULL,
  registration_deadline DATE NOT NULL,
  status ENUM('Draft', 'Published', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_events_organizer
    FOREIGN KEY (organizer_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  full_name VARCHAR(140) NOT NULL,
  email VARCHAR(160) NOT NULL,
  student_number VARCHAR(80) NOT NULL,
  course_department VARCHAR(140) NOT NULL,
  registration_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  qr_token VARCHAR(96) NOT NULL UNIQUE,
  qr_code LONGTEXT NOT NULL,
  attendance_status ENUM('registered', 'attended') NOT NULL DEFAULT 'registered',
  check_in_time DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_participants_event
    FOREIGN KEY (event_id) REFERENCES events(id)
    ON DELETE CASCADE,
  UNIQUE KEY uq_participant_email_event (event_id, email),
  UNIQUE KEY uq_participant_student_event (event_id, student_number)
);

CREATE TABLE attendance_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  participant_id INT NOT NULL,
  checked_in_by INT NULL,
  method ENUM('qr', 'manual') NOT NULL,
  notes VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_attendance_event
    FOREIGN KEY (event_id) REFERENCES events(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_attendance_participant
    FOREIGN KEY (participant_id) REFERENCES participants(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_attendance_user
    FOREIGN KEY (checked_in_by) REFERENCES users(id)
    ON DELETE SET NULL
);

CREATE TABLE certificates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  participant_id INT NOT NULL UNIQUE,
  certificate_code VARCHAR(120) NOT NULL UNIQUE,
  issued_by INT NULL,
  issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_certificates_event
    FOREIGN KEY (event_id) REFERENCES events(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_certificates_participant
    FOREIGN KEY (participant_id) REFERENCES participants(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_certificates_user
    FOREIGN KEY (issued_by) REFERENCES users(id)
    ON DELETE SET NULL
);

CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_participants_attendance ON participants(attendance_status);
CREATE INDEX idx_attendance_event ON attendance_logs(event_id);
