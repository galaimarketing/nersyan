export interface Room {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  capacity: number;
  size: number;
  amenities: string[];
  available: boolean;
  roomsLeft?: number;
}

/** Only admin-created rooms are shown on the site. This export is empty; use usePublicRooms() for public pages. */
export const rooms: Room[] = [];
