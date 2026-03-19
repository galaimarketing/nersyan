/**
 * Admin room cards: Arabic UI should use Eastern Arabic numerals and translated type labels
 * (stored values in DB remain English for consistency with selects / API).
 */

export function formatRoomNumberForLang(roomNumber: string, language: "ar" | "en"): string {
  if (language !== "ar") return roomNumber;
  const ar = "٠١٢٣٤٥٦٧٨٩";
  return roomNumber.replace(/[0-9]/g, (d) => ar[Number(d)] ?? d);
}

const ROOM_TYPE_I18N_KEY: Record<string, string> = {
  "Standard Room": "admin.roomType.standard",
  "Deluxe Room": "admin.roomType.deluxe",
  "Premium Suite": "admin.roomType.premiumSuite",
  "Family Room": "admin.roomType.family",
  "Presidential Suite": "admin.roomType.presidential",
};

export function translatedAdminRoomType(t: (key: string) => string, storedType: string): string {
  const key = ROOM_TYPE_I18N_KEY[storedType];
  return key ? t(key) : storedType;
}
