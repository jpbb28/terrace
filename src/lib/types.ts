export type TerraceType =
  | "sidewalk"
  | "rooftop"
  | "backyard"
  | "courtyard"
  | "balcony"
  | "garden"
  | "plaza";

export type Neighborhood =
  | "Plateau-Mont-Royal"
  | "Mile End"
  | "Villeray"
  | "Rosemont"
  | "Old Montreal"
  | "Griffintown"
  | "Little Italy"
  | "Saint-Henri"
  | "Verdun"
  | "NDG"
  | "Outremont"
  | "Hochelaga"
  | "Downtown"
  | "Latin Quarter"
  | "Mile-Ex"
  | "Little Burgundy"
  | "Petite-Patrie"
  | "Chinatown"
  | "The Village"
  | "Quartier des Spectacles"
  | "Pointe-Saint-Charles"
  | "Ahuntsic"
  | "Parc-Extension"
  | "Old Port"
  | "Laval"
  | "South Shore"
  | "West Island";

export interface HourPeriod {
  day: number; // 0 = Sunday, 1 = Monday, … 6 = Saturday
  open: string; // "HH:MM" 24-hour
  close: string; // "HH:MM" 24-hour (if < open, period runs overnight)
  is24h?: boolean; // true = open 24 hours (open/close times are irrelevant)
}

export interface Terrace {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  neighborhood: Neighborhood;
  cuisineType: string;
  terraceType?: TerraceType[];
  capacity?: number;
  covered: boolean;
  dogFriendly: boolean;
  heated: boolean;
  website?: string;
  instagram?: string;
  phone?: string;
  photos: string[];
  openingHours?: string; // legacy display string
  openingPeriods?: HourPeriod[]; // structured hours from Google Places
  placeId?: string; // Google Places ID for future refreshes
  googleRating?: number; // Fetched weekly via GitHub Actions
  googleReviewCount?: number;
  description: string;
  descriptionFr?: string;
}
