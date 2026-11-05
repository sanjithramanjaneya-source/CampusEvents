USE campus_event_db;

CREATE ROLE IF NOT EXISTS 'role_student', 'role_organizer', 'role_admin';

-- STUDENT: read public data, register only through the stored procedure
GRANT SELECT ON campus_event_db.events        TO 'role_student';
GRANT SELECT ON campus_event_db.venues        TO 'role_student';
GRANT SELECT ON campus_event_db.event_summary TO 'role_student';
GRANT EXECUTE ON PROCEDURE campus_event_db.RegisterForEvent        TO 'role_student';
GRANT EXECUTE ON FUNCTION  campus_event_db.CountActiveRegistrations TO 'role_student';
GRANT EXECUTE ON FUNCTION  campus_event_db.EventCrowdLevel          TO 'role_student';

-- ORGANIZER: everything a student has, plus managing events through procedures
GRANT 'role_student' TO 'role_organizer';
GRANT SELECT ON campus_event_db.registrations         TO 'role_organizer';
GRANT SELECT ON campus_event_db.resources             TO 'role_organizer';
GRANT SELECT ON campus_event_db.resource_allocations  TO 'role_organizer';
GRANT SELECT ON campus_event_db.event_staff           TO 'role_organizer';
GRANT SELECT ON campus_event_db.available_resources   TO 'role_organizer';
GRANT SELECT ON campus_event_db.staff_assignments     TO 'role_organizer';
GRANT INSERT, DELETE ON campus_event_db.event_staff   TO 'role_organizer';
GRANT EXECUTE ON PROCEDURE campus_event_db.CreateEvent      TO 'role_organizer';
GRANT EXECUTE ON PROCEDURE campus_event_db.CancelEvent      TO 'role_organizer';
GRANT EXECUTE ON PROCEDURE campus_event_db.DeleteEvent      TO 'role_organizer';
GRANT EXECUTE ON PROCEDURE campus_event_db.SetEventResource TO 'role_organizer';
GRANT EXECUTE ON PROCEDURE campus_event_db.MarkAttendance   TO 'role_organizer';

-- ADMIN: full control of the project database
GRANT ALL PRIVILEGES ON campus_event_db.* TO 'role_admin';

-- One demo login per role
CREATE USER IF NOT EXISTS 'u_student'@'localhost'   IDENTIFIED BY 'Student@2026';
CREATE USER IF NOT EXISTS 'u_organizer'@'localhost' IDENTIFIED BY 'Organizer@2026';
CREATE USER IF NOT EXISTS 'u_admin'@'localhost'     IDENTIFIED BY 'Admin@2026';
GRANT 'role_student'   TO 'u_student'@'localhost';
GRANT 'role_organizer' TO 'u_organizer'@'localhost';
GRANT 'role_admin'     TO 'u_admin'@'localhost';
SET DEFAULT ROLE 'role_student'   TO 'u_student'@'localhost';
SET DEFAULT ROLE 'role_organizer' TO 'u_organizer'@'localhost';
SET DEFAULT ROLE 'role_admin'     TO 'u_admin'@'localhost';

-- Show the result (screenshot these for the report)
SHOW GRANTS FOR 'u_student'@'localhost'   USING 'role_student';
SHOW GRANTS FOR 'u_organizer'@'localhost' USING 'role_organizer', 'role_student';
SHOW GRANTS FOR 'u_admin'@'localhost'     USING 'role_admin';