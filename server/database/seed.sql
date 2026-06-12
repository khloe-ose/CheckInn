USE checkinn_db;

INSERT INTO users (id, name, email, password_hash, role, organization, phone) VALUES
(1, 'Khloe Oseña', 'admin@checkinn.test', '$2b$10$WdxYzTvrtROqdVrOQyjrwuz2ZE5AK9/64.jgtBtT9byUkxoKkw/Bu', 'admin', 'CheckInn Admin Office', '+63 900 000 0001'),
(2, 'Doug Peach', 'organizer@checkinn.test', '$2b$10$dViXKa1bppjln2EFlAxo1.xNadJ5bd/I.kaalSeOwko1ncvIEYSwK', 'organizer', 'Tech Student Guild', '+63 900 000 0002'),
(3, 'Winnie Fred', 'workshops@checkinn.test', '$2b$10$dViXKa1bppjln2EFlAxo1.xNadJ5bd/I.kaalSeOwko1ncvIEYSwK', 'organizer', 'Campus Innovation Lab', '+63 900 000 0003');

INSERT INTO events (id, title, slug, description, date, time, venue, organizer_id, capacity, registration_deadline, status) VALUES
(1, 'Intro to Web APIs Workshop', 'intro-to-web-apis-workshop', 'A practical workshop on REST APIs, authentication, and testing for student developers.', '2026-07-10', '09:00:00', 'Computer Lab 2', 2, 60, '2026-07-08', 'Published'),
(2, 'Student Leaders Tech Summit', 'student-leaders-tech-summit', 'A half-day conference for officers managing student organization systems and digital workflows.', '2026-08-05', '13:30:00', 'Main Auditorium', 2, 180, '2026-08-01', 'Published'),
(3, 'Portfolio Review Night', 'portfolio-review-night', 'Mentor-led review session for internship-ready IT portfolios.', '2026-06-25', '18:00:00', 'Innovation Hub', 3, 40, '2026-06-20', 'Draft'),
(4, 'Database Design Clinic', 'database-design-clinic', 'Hands-on clinic for normalization, indexing, and analytics-ready schema design.', '2026-05-18', '10:00:00', 'Room 305', 3, 50, '2026-05-15', 'Completed');

INSERT INTO participants
(id, event_id, full_name, email, student_number, course_department, qr_token, qr_code, attendance_status, check_in_time, registration_date)
VALUES
(1, 1, 'Alpha', 'alpha@example.edu', '2022-0001', 'BS Information Technology', 'seed-token-001', 'data:image/png;base64,seed', 'attended', '2026-07-10 09:04:00', '2026-06-02 10:15:00'),
(2, 1, 'Beta', 'beta@example.edu', '2022-0002', 'BS Computer Science', 'seed-token-002', 'data:image/png;base64,seed', 'registered', NULL, '2026-06-03 14:20:00'),
(3, 1, 'Charlie', 'charlie@example.edu', '2022-0003', 'BS Information Systems', 'seed-token-003', 'data:image/png;base64,seed', 'attended', '2026-07-10 09:12:00', '2026-06-04 08:35:00'),
(4, 2, 'Delta', 'delta@example.edu', '2021-0144', 'College of Business', 'seed-token-004', 'data:image/png;base64,seed', 'registered', NULL, '2026-06-05 12:00:00'),
(5, 2, 'Echo', 'echo@example.edu', '2021-0188', 'BS Information Technology', 'seed-token-005', 'data:image/png;base64,seed', 'attended', '2026-08-05 13:20:00', '2026-06-06 16:05:00'),
(6, 4, 'Foxtrot', 'foxtrot@example.edu', '2020-0301', 'BS Computer Science', 'seed-token-006', 'data:image/png;base64,seed', 'attended', '2026-05-18 10:02:00', '2026-05-01 09:00:00');

INSERT INTO attendance_logs (event_id, participant_id, checked_in_by, method, notes, created_at) VALUES
(1, 1, 2, 'qr', NULL, '2026-07-10 09:04:00'),
(1, 3, 2, 'manual', 'ID verified at help desk.', '2026-07-10 09:12:00'),
(2, 5, 2, 'qr', NULL, '2026-08-05 13:20:00'),
(4, 6, 3, 'qr', NULL, '2026-05-18 10:02:00');

INSERT INTO certificates (event_id, participant_id, certificate_code, issued_by, issued_at) VALUES
(4, 6, 'CHK-4-6-SEED', 3, '2026-05-18 16:00:00');
