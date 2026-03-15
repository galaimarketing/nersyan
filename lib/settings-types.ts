/** Shared settings type for server and client. */

export interface AppSettings {
  taxRatePercent: number;
  currency: string;
  hotelNameEn?: string;
  hotelNameAr?: string;
  contactEmail?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  newBookingAlerts?: boolean;
  checkinReminders?: boolean;
}

export const defaultAppSettings: AppSettings = {
  taxRatePercent: 15,
  currency: "SAR",
  hotelNameEn: "Nersian Taiba",
  hotelNameAr: "نرسيان طيبة",
  contactEmail: "info@nersiantaiba.com",
  seoTitle: "Nersian Taiba Hotel | نرسيان طيبة - Hotels in Madinah",
  seoDescription: "Luxurious hotel accommodation near Al-Masjid an-Nabawi in Madinah, Saudi Arabia.",
  seoKeywords: "Hotels in Madinah, Nersian Taiba, فنادق المدينة المنورة, نرسيان طيبة",
  newBookingAlerts: true,
  checkinReminders: true,
};
