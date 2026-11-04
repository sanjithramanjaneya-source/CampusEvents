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
    crowd_level: "LOW" | "MEDIUM" | "HIGH" | "FULL" | "UNKNOWN";
  registration_deadline: string;
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



export type AdminOverview = {
  stats: {
    students: number;
    organizers: number;
    total_events: number;
    pending_events: number;
    total_registrations: number;
  };
  by_status: { status: string; count: number }[];
  top_events: {
    event_id: number;
    event_name: string;
    capacity: number;
    registrations: number;
  }[];
  recent_activity: {
    audit_id: number;
    action_type: string;
    description: string;
    action_time: string;
    user_name: string | null;
  }[];
};

export type AdminEvent = {
  event_id: number;
  event_name: string;
  category: string;
  start_time: string;
  end_time: string;
  expected_attendees: number;
  status: string;
  organizer_name: string;
  venue_name: string;
  capacity: number;
};

export type AdminUser = {
  user_id: number;
  full_name: string;
  email: string;
  srn: string | null;
  role: "STUDENT" | "ORGANIZER" | "ADMIN";
  created_at: string;
};