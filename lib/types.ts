export type EventItem = {
  event_id: number;
  event_name: string;
  description: string | null;
  category: string;
  start_time: string;
  end_time: string;
  expected_attendees: number;
  status: string;
  venue_name: string;
  location: string;
  capacity: number;
  organizer_name: string;
  registered_count: number;
  crowd_level: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
};

export type EventDetail = EventItem & {
  organizer_id: number;
  my_registration: "REGISTERED" | "CANCELLED" | "ATTENDED" | null;
  viewer: { user_id: number; role: "STUDENT" | "ORGANIZER" | "ADMIN" } | null;
};

export type MyRegistration = {
  registration_id: number;
  registration_status: "REGISTERED" | "CANCELLED" | "ATTENDED";
  registered_at: string;
  event_id: number;
  event_name: string;
  category: string;
  start_time: string;
  end_time: string;
  event_status: string;
  venue_name: string;
  location: string;
};


export type Venue = {
  venue_id: number;
  venue_name: string;
  location: string;
  capacity: number;
  venue_type: string | null;
};

export type OrganizerEvent = {
  event_id: number;
  event_name: string;
  category: string;
  start_time: string;
  end_time: string;
  expected_attendees: number;
  status: string;
  venue_name: string;
  capacity: number;
  registered_count: number;
};