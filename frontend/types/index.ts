export interface Admin {
  _id: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  admin?: Admin;
  message?: string;
}

export interface ApiErrorResponse {
  success: boolean;
  message: string;
}

export interface WeddingVenue {
  name: string;
  address: string;
  date?: string;
  time: string;
  googleMapsUrl: string;
  description: string;
}

export interface Wedding {
  _id?: string;
  weddingTitle: string;
  brideName: string;
  brideDescription: string;
  groomName: string;
  groomDescription: string;
  weddingDate: string;
  startTime: string;
  endTime: string;
  dressCode: string;
  contactBride: string;
  contactGroom: string;
  contactCoordinator: string;
  invitationHeading?: string;
  invitationMessage?: string;
  footerMessage?: string;
  websiteStatus?: "draft" | "published";
  ceremonyVenueName?: string;
  ceremonyAddress?: string;
  ceremonyDate?: string;
  ceremonyTime?: string;
  ceremonyGoogleMapsUrl?: string;
  ceremonyLatitude?: number | null;
  ceremonyLongitude?: number | null;
  ceremonyDescription?: string;
  receptionVenueName?: string;
  receptionAddress?: string;
  receptionDate?: string;
  receptionTime?: string;
  receptionGoogleMapsUrl?: string;
  receptionLatitude?: number | null;
  receptionLongitude?: number | null;
  receptionDescription?: string;
  ceremonyVenue?: WeddingVenue;
  receptionVenue?: WeddingVenue;

  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  headingFont?: string;
  bodyFont?: string;
  themeStyle?: "classic" | "modern" | "minimal" | "luxury";
  musicEnabled?: boolean;
  musicUrl?: string;
  rsvpEnabled?: boolean;
  personalizedInvitationsEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Guest {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  maximumGuests: number;
  personalMessage?: string;
  invitationToken: string;
  rsvpStatus: "pending" | "attending" | "declined";
  createdAt?: string;
  updatedAt?: string;
}

export interface RSVP {
  _id: string;
  guestId?: string | Guest;
  guestName: string;
  phone?: string;
  email?: string;
  status: "attending" | "declined" | "pending";
  guestCount: number;
  mealPreference?: string;
  message?: string;
  responseDate: string;
}

export interface ScheduleEvent {
  _id?: string;
  eventName: string;
  eventDate?: string;
  startTime: string;
  description?: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

