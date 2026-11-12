import { Wedding } from "@/types";

export function getWeddingVenues(wedding: Wedding) {
  const ceremony = {
    id: "ceremony",
    label: "The Ceremony",
    name: wedding.ceremonyVenueName || wedding.ceremonyVenue?.name,
    hall: wedding.ceremonyHallName || wedding.ceremonyVenue?.hallName,
    address: wedding.ceremonyAddress || wedding.ceremonyVenue?.address,
    date: wedding.ceremonyDate || wedding.ceremonyVenue?.date || wedding.weddingDate,
    time: wedding.ceremonyTime || wedding.ceremonyVenue?.time || wedding.startTime,
    description: wedding.ceremonyDescription || wedding.ceremonyVenue?.description,
    mapUrl: wedding.ceremonyGoogleMapsUrl || wedding.ceremonyVenue?.googleMapsUrl,
    lat: wedding.ceremonyLatitude,
    lng: wedding.ceremonyLongitude,
  } as const;
  const reception = {
    id: "reception",
    label: "The Reception",
    name: wedding.receptionVenueName || wedding.receptionVenue?.name,
    hall: wedding.receptionHallName || wedding.receptionVenue?.hallName,
    address: wedding.receptionAddress || wedding.receptionVenue?.address,
    date: wedding.receptionDate || wedding.receptionVenue?.date || wedding.weddingDate,
    time: wedding.receptionTime || wedding.receptionVenue?.time || wedding.endTime,
    description: wedding.receptionDescription || wedding.receptionVenue?.description,
    mapUrl: wedding.receptionGoogleMapsUrl || wedding.receptionVenue?.googleMapsUrl,
    lat: wedding.receptionLatitude,
    lng: wedding.receptionLongitude,
  } as const;

  return wedding.receptionEnabled ? [ceremony, reception] : [ceremony];
}

export type InvitationVenue = ReturnType<typeof getWeddingVenues>[number];

export function getVenueQuery(venue: InvitationVenue) {
  if (venue.lat != null && venue.lng != null && Number.isFinite(Number(venue.lat)) && Number.isFinite(Number(venue.lng))) {
    return `${venue.lat},${venue.lng}`;
  }
  return [venue.name, venue.hall, venue.address].filter(Boolean).join(" ");
}
