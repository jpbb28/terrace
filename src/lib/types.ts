export type TerraceType = "sidewalk" | "rooftop" | "backyard" | "courtyard";

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
  | "South Shore";

export interface Terrace {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  neighborhood: Neighborhood;
  cuisineType: string;
  terraceType?: TerraceType;
  capacity?: number;
  covered: boolean;
  dogFriendly: boolean;
  heated: boolean;
  website?: string;
  phone?: string;
  photos: string[];
  seasonalOpen?: string;
  seasonalClose?: string;
  openingHours?: string;
  description: string;
  descriptionFr?: string;
}
