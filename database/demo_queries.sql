USE campus_event_db;

-- ===== DML: INSERT / UPDATE / DELETE / SELECT =====
INSERT INTO resources (resource_name, resource_type, total_quantity, available_quantity, location)
VALUES ('Whiteboard', 'Furniture', 15, 15, 'Furniture Store');

UPDATE resources SET total_quantity = 20, available_quantity = 20
 WHERE resource_name = 'Whiteboard';

DELETE FROM resources WHERE resource_name = 'Whiteboard';

SELECT event_id, event_name, status FROM events
 WHERE status = 'APPROVED' ORDER BY start_time;

-- ===== JOIN: events with organizer, venue and live registration count =====
SELECT e.event_name, u.full_name AS organizer, v.venue_name,
       COUNT(r.registration_id) AS registered
  FROM events e
  JOIN users u  ON u.user_id  = e.organizer_id
  JOIN venues v ON v.venue_id = e.venue_id
  LEFT JOIN registrations r ON r.event_id = e.event_id
                           AND r.status IN ('REGISTERED', 'ATTENDED')
 GROUP BY e.event_id, e.event_name, u.full_name, v.venue_name;

-- ===== GROUP BY + HAVING: events with 3 or more registrations =====
SELECT e.event_name, COUNT(*) AS registrations
  FROM events e JOIN registrations r ON r.event_id = e.event_id
 WHERE r.status <> 'CANCELLED'
 GROUP BY e.event_id, e.event_name
HAVING COUNT(*) >= 3;

-- ===== NESTED (non-correlated) =====
SELECT event_name, expected_attendees FROM events
 WHERE expected_attendees > (SELECT AVG(expected_attendees) FROM events);

SELECT full_name FROM users
 WHERE user_id IN (SELECT user_id FROM registrations WHERE status = 'ATTENDED');

-- ===== CORRELATED: events bigger than the average of their own organizer =====
SELECT e.event_name, e.expected_attendees
  FROM events e
 WHERE e.expected_attendees >
       (SELECT AVG(e2.expected_attendees) FROM events e2
         WHERE e2.organizer_id = e.organizer_id);

SELECT v.venue_name FROM venues v
 WHERE EXISTS (SELECT 1 FROM events e
                WHERE e.venue_id = v.venue_id AND e.status = 'APPROVED');

-- ===== CTE + window function =====
WITH event_counts AS (
  SELECT e.event_id, e.event_name, COUNT(r.registration_id) AS registrations
    FROM events e
    LEFT JOIN registrations r ON r.event_id = e.event_id AND r.status <> 'CANCELLED'
   GROUP BY e.event_id, e.event_name
)
SELECT event_name, registrations,
       RANK() OVER (ORDER BY registrations DESC) AS popularity_rank
  FROM event_counts;

-- ===== RECURSIVE CTE: calendar of the next 14 days =====
WITH RECURSIVE days AS (
  SELECT CURDATE() AS cal_date
  UNION ALL
  SELECT cal_date + INTERVAL 1 DAY FROM days
   WHERE cal_date < CURDATE() + INTERVAL 13 DAY
)
SELECT d.cal_date, COUNT(e.event_id) AS events_running
  FROM days d
  LEFT JOIN events e ON e.status IN ('APPROVED', 'ONGOING')
                    AND DATE(e.start_time) <= d.cal_date
                    AND DATE(e.end_time)   >= d.cal_date
 GROUP BY d.cal_date ORDER BY d.cal_date;