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
  title: string;
  brideName: string;
  brideDescription?: string;
  groomName: string;
  groomDescription?: string;
  weddingDate: string;
  startTime: string;
  endTime: string;
  dressCode?: string;
  brideContact?: string;
  groomContact?: string;
  coordinatorContact?: string;
  ceremonyVenue?: WeddingVenue;
  receptionVenue?: WeddingVenue;
  invitationHeading?: string;
  personalGreeting?: string;
  invitationMessage?: string;
  footerMessage?: string;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  headingFont?: string;
  bodyFont?: string;
  themeStyle?: 'classic' | 'modern' | 'minimal' | 'luxury';
  musicEnabled?: boolean;
  musicUrl?: string;
  websitePublished?: boolean;
  rsvpEnabled?: boolean;
  personalizedInvitationsEnabled?: boolean;
}

export interface Guest {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  maximumGuests: number;
  personalMessage?: string;
  invitationToken: string;
  rsvpStatus: 'pending' | 'attending' | 'declined';
  createdAt?: string;
  updatedAt?: string;
}

export interface RSVP {
  _id: string;
  guestId?: string | Guest;
  guestName: string;
  phone?: string;
  email?: string;
  status: 'attending' | 'declined' | 'pending';
  guestCount: number;
  mealPreference?: string;
  message?: string;
  responseDate: string;
}

export interface ScheduleEvent {
  _id: string;
  name: string;
  startTime: string;
  description: string;
  order: number;
}
