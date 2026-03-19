"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

type Language = "ar" | "en";

interface Translations {
  [key: string]: {
    ar: string;
    en: string;
  };
}

const translations: Translations = {
  // Header
  "nav.home": { ar: "الرئيسية", en: "Home" },
  "nav.rooms": { ar: "الغرف", en: "Rooms" },
  "nav.amenities": { ar: "المرافق", en: "Amenities" },
  "nav.location": { ar: "الموقع", en: "Location" },
  "nav.contact": { ar: "تواصل معنا", en: "Contact" },
  "nav.blog": { ar: "المدونة", en: "Blog" },
  "nav.login": { ar: "تسجيل الدخول", en: "Sign In" },
  "nav.signup": { ar: "إنشاء حساب", en: "Sign Up" },
  
  // Hero
  "hero.title": { ar: "نرسيان طيبة", en: "Nersian Taiba" },
  "hero.subtitle": { ar: "إقامة فاخرة بالقرب من الحرم النبوي الشريف", en: "Luxurious Stay Near Al-Masjid an-Nabawi" },
  "hero.cta": { ar: "احجز الآن", en: "Book Now" },
  "hero.explore": { ar: "استكشف الغرف", en: "Explore Rooms" },
  
  // Booking
  "booking.checkin": { ar: "تاريخ الوصول", en: "Check-in Date" },
  "booking.checkout": { ar: "تاريخ المغادرة", en: "Check-out Date" },
  "booking.guests": { ar: "عدد الضيوف", en: "Guests" },
  "booking.search": { ar: "بحث", en: "Search" },
  "booking.bookNow": { ar: "احجز الآن", en: "Book Now" },
  "booking.callToBook": { ar: "احجز عبر الهاتف", en: "Book via Phone" },
  "booking.perNight": { ar: "لليلة", en: "per night" },
  "booking.available": { ar: "متاح", en: "Available" },
  "booking.booked": { ar: "محجوز", en: "Booked" },
  "booking.selectDates": { ar: "اختر التواريخ", en: "Select Dates" },
  
  // Rooms
  "rooms.title": { ar: "غرفنا الفاخرة", en: "Our Luxury Rooms" },
  "rooms.standard": { ar: "غرفة قياسية", en: "Standard Room" },
  "rooms.deluxe": { ar: "غرفة ديلوكس", en: "Deluxe Room" },
  "rooms.suite": { ar: "جناح فاخر", en: "Premium Suite" },
  "rooms.viewDetails": { ar: "عرض التفاصيل", en: "View Details" },
  "rooms.onlyLeft": { ar: "غرفة واحدة فقط متبقية!", en: "Only 1 room left!" },
  "rooms.bookedTimes": { ar: "تم حجزها 5 مرات في آخر 24 ساعة", en: "Booked 5 times in the last 24 hours" },
  
  // Features
  "features.distance": { ar: "دقائق من الحرم", en: "Minutes to Haram" },
  "features.wifi": { ar: "واي فاي مجاني عالي السرعة", en: "Free High-Speed WiFi" },
  "features.prayer": { ar: "سجادات صلاة في كل غرفة", en: "Prayer Mats in Every Room" },
  "features.breakfast": { ar: "إفطار مجاني", en: "Free Breakfast" },
  "features.parking": { ar: "موقف سيارات مجاني متوفر لجميع الغرف", en: "Free Parking available for all rooms" },
  "features.ac": { ar: "تكييف مركزي", en: "Central AC" },
  
  // Reviews
  "reviews.title": { ar: "آراء ضيوفنا", en: "Guest Reviews" },
  "reviews.rating": { ar: "التقييم", en: "Rating" },
  
  // Payment
  "payment.title": { ar: "تفاصيل الدفع", en: "Payment Details" },
  "payment.cardHolder": { ar: "اسم حامل البطاقة", en: "Card Holder Name" },
  "payment.cardNumber": { ar: "رقم البطاقة", en: "Card Number" },
  "payment.expiry": { ar: "تاريخ الانتهاء", en: "Expiry Date" },
  "payment.cvc": { ar: "رمز الأمان", en: "CVC" },
  "payment.applePay": { ar: "الدفع بـ Apple Pay", en: "Pay with Apple Pay" },
  "payment.creditCard": { ar: "بطاقة ائتمانية", en: "Credit Card" },
  "payment.payNow": { ar: "ادفع الآن", en: "Pay Now" },
  "payment.total": { ar: "الإجمالي", en: "Total" },
  "payment.subtotal": { ar: "المجموع الفرعي", en: "Subtotal" },
  "payment.tax": { ar: "الضريبة", en: "Tax" },
  "payment.method": { ar: "طريقة الدفع", en: "Payment Method" },
  
  // Auth
  "auth.email": { ar: "البريد الإلكتروني", en: "Email" },
  "auth.password": { ar: "كلمة المرور", en: "Password" },
  "auth.fullName": { ar: "الاسم الكامل", en: "Full Name" },
  "auth.phone": { ar: "رقم الهاتف", en: "Phone Number" },
  "auth.signIn": { ar: "تسجيل الدخول", en: "Sign In" },
  "auth.signUp": { ar: "إنشاء حساب", en: "Create Account" },
  "auth.forgotPassword": { ar: "نسيت كلمة المرور؟", en: "Forgot password?" },
  "auth.rememberMe": { ar: "تذكرني", en: "Remember me" },
  "auth.noAccount": { ar: "ليس لديك حساب؟", en: "Don't have an account?" },
  "auth.hasAccount": { ar: "لديك حساب بالفعل؟", en: "Already have an account?" },
  "auth.terms": { ar: "الشروط والأحكام", en: "Terms of Service" },
  "auth.privacy": { ar: "سياسة الخصوصية", en: "Privacy Policy" },
  "auth.continueGoogle": { ar: "المتابعة مع Google", en: "Continue with Google" },
  "auth.continueApple": { ar: "المتابعة مع Apple", en: "Continue with Apple" },
  
  // Footer
  "footer.rights": { ar: "جميع الحقوق محفوظة", en: "All rights reserved" },
  "footer.address": { ar: "المدينة المنورة، المملكة العربية السعودية", en: "Madinah, Saudi Arabia" },
  
  // Contact Form
  "contact.title": { ar: "تواصل معنا", en: "Contact Us" },
  "contact.subtitle": { ar: "نسعد بتواصلكم معنا في أي وقت", en: "We'd love to hear from you anytime" },
  "contact.name": { ar: "الاسم الكامل", en: "Full Name" },
  "contact.email": { ar: "البريد الإلكتروني", en: "Email Address" },
  "contact.phone": { ar: "رقم الهاتف", en: "Phone Number" },
  "contact.message": { ar: "رسالتك", en: "Your Message" },
  "contact.send": { ar: "إرسال الرسالة", en: "Send Message" },
  "contact.sending": { ar: "جاري الإرسال...", en: "Sending..." },
  "contact.success": { ar: "تم إرسال رسالتك بنجاح!", en: "Your message has been sent successfully!" },

  // My bookings (customer)
  "myBookings.title": { ar: "حجوزاتي", en: "My bookings" },
  "myBookings.subtitle": {
    ar: "راجع تفاصيل حجوزاتك السابقة والقادمة من هذا الجهاز.",
    en: "Review your upcoming and past bookings made from this device."
  },
  "myBookings.empty": {
    ar: "لا توجد حجوزات محفوظة على هذا الجهاز حتى الآن.",
    en: "There are no saved bookings on this device yet."
  },
  "myBookings.help": {
    ar: "إذا قمت بالحجز من قبل، يرجى التواصل معنا لمساعدتك في استعراض الحجز.",
    en: "If you've booked before, please contact us and we'll help you look up your booking."
  },
  
  // Rooms Page
  "rooms.seeMore": { ar: "عرض جميع الغرف", en: "View All Rooms" },
  "rooms.filterByCapacity": { ar: "تصفية حسب عدد الضيوف", en: "Filter by Guest Capacity" },
  "rooms.allRooms": { ar: "جميع الغرف", en: "All Rooms" },
  "rooms.persons": { ar: "أشخاص", en: "persons" },
  "rooms.person": { ar: "شخص", en: "person" },
  
  // Services
  "services.laundry": { ar: "خدمة الغسيل", en: "Laundry Service" },
  "services.coffee": { ar: "قهوة ومشروبات", en: "Coffee & Beverages" },
  "services.restaurant": { ar: "مطعم داخلي", en: "In-house Restaurant" },
  "services.transport": { ar: "خدمة النقل", en: "Transportation" },
  "services.transportDesc": { ar: "النقل من وإلى المطار والحرم (غير مشمول في سعر الحجز)", en: "Airport & Mosque transfers (not included in room price)" },
  "services.priceNote": { ar: "السعر يشمل الإقامة فقط، الخدمات الإضافية برسوم منفصلة", en: "Price includes accommodation only, additional services at extra cost" },
  
  // General
  "general.loading": { ar: "جاري التحميل...", en: "Loading..." },
  "general.error": { ar: "حدث خطأ", en: "An error occurred" },
  "general.success": { ar: "تم بنجاح", en: "Success" },
  "general.cancel": { ar: "إلغاء", en: "Cancel" },
  "general.confirm": { ar: "تأكيد", en: "Confirm" },
  "general.close": { ar: "إغلاق", en: "Close" },
  "general.sar": { ar: "ر.س", en: "SAR" },

  // Admin
  "admin.panel": { ar: "لوحة التحكم", en: "Admin Panel" },
  "admin.settings": { ar: "الإعدادات", en: "Settings" },
  "admin.logout": { ar: "تسجيل الخروج", en: "Logout" },
  "admin.notifications": { ar: "الإشعارات", en: "Notifications" },
  "admin.recent": { ar: "الأخيرة", en: "Recent" },
  "admin.noNotifications": { ar: "لا توجد إشعارات", en: "No notifications" },
  "admin.notificationsDesc": { ar: "تنبيهات الحجوزات والنظام", en: "Booking and system alerts" },
  "admin.markReadOrClear": { ar: "تعليم كمقروءة أو مسح الكل", en: "Mark as read or clear all" },
  "admin.alertsHere": { ar: "ستظهر التنبيهات هنا", en: "Alerts will appear here" },
  "admin.backToDashboard": { ar: "العودة للوحة التحكم", en: "Back to Dashboard" },
  "admin.newBooking": { ar: "حجز جديد", en: "New booking" },
  "admin.markRead": { ar: "تعليم كمقروء", en: "Mark read" },
  "admin.view": { ar: "عرض", en: "View" },
  "admin.adminUser": { ar: "المشرف", en: "Admin User" },
  "admin.settingsPageTitle": { ar: "الإعدادات", en: "Settings" },
  "admin.settingsPageDesc": { ar: "إعدادات الفندق والتطبيق", en: "Hotel and app configuration" },
  "admin.pricing": { ar: "الأسعار", en: "Pricing" },
  "admin.pricingDesc": { ar: "تحديث الأسعار – المعدلات والعملة الافتراضية", en: "Update Pricing – default rates and currency" },
  "admin.taxes": { ar: "الضرائب والعملة", en: "Taxes & Currency" },
  "admin.taxesDesc": { ar: "نسبة الضريبة والعملة الافتراضية", en: "Tax rate and default currency" },
  "admin.saveTaxes": { ar: "حفظ الضرائب", en: "Save Taxes" },
  "admin.seo": { ar: "تحسين محركات البحث", en: "SEO" },
  "admin.seoDesc": { ar: "عنوان ووصف الصفحة الرئيسية لمحركات البحث", en: "Landing page title and description for search engines" },
  "admin.metaTitle": { ar: "عنوان الصفحة (Meta Title)", en: "Page Title (Meta Title)" },
  "admin.metaDescription": { ar: "وصف الصفحة (Meta Description)", en: "Page Description (Meta Description)" },
  "admin.metaKeywords": { ar: "الكلمات المفتاحية (مفصولة بفواصل)", en: "Keywords (comma-separated)" },
  "admin.saveSeo": { ar: "حفظ SEO", en: "Save SEO" },
  "admin.currency": { ar: "العملة", en: "Currency" },
  "admin.taxRate": { ar: "نسبة الضريبة (%)", en: "Tax rate (%)" },
  "admin.saved": { ar: "تم الحفظ", en: "Saved" },
  "admin.savePricing": { ar: "حفظ الأسعار", en: "Save pricing" },
  "admin.general": { ar: "عام", en: "General" },
  "admin.generalDesc": { ar: "اسم الفندق ومعلومات الاتصال", en: "Hotel name and contact" },
  "admin.hotelNameEn": { ar: "اسم الفندق (EN)", en: "Hotel name (EN)" },
  "admin.hotelNameAr": { ar: "اسم الفندق (AR)", en: "Hotel name (AR)" },
  "admin.contactEmail": { ar: "البريد الإلكتروني للتواصل", en: "Contact email" },
  "admin.saveGeneral": { ar: "حفظ الإعدادات العامة", en: "Save general" },
  "admin.notificationsCard": { ar: "الإشعارات", en: "Notifications" },
  "admin.notificationsCardDesc": { ar: "تنبيهات البريد والتطبيق", en: "Email and in-app alerts" },
  "admin.newBookingAlerts": { ar: "تنبيهات الحجوزات الجديدة", en: "New booking alerts" },
  "admin.guestCheckinReminders": { ar: "تذكيرات تسجيل وصول النزلاء", en: "Guest check-in reminders" },
  "admin.saveNotifications": { ar: "حفظ الإشعارات", en: "Save notifications" },
  "admin.saveAll": { ar: "حفظ الكل", en: "Save all" },

  // Dashboard
  "admin.totalBookings": { ar: "إجمالي الحجوزات", en: "Total Bookings" },
  "admin.revenueThisMonth": { ar: "الإيرادات (هذا الشهر)", en: "Revenue (This Month)" },
  "admin.occupancyRate": { ar: "نسبة الإشغال", en: "Occupancy Rate" },
  "admin.totalGuests": { ar: "إجمالي الضيوف", en: "Total Guests" },
  "admin.recentBookings": { ar: "الحجوزات الأخيرة", en: "Recent Bookings" },
  "admin.latestBookingActivity": { ar: "آخر نشاط حجوزات", en: "Latest booking activity" },
  "admin.viewAll": { ar: "عرض الكل", en: "View All" },
  "admin.noBookingsYet": { ar: "لا توجد حجوزات بعد", en: "No bookings yet" },
  "admin.bookingsWillAppearHere": { ar: "ستظهر الحجوزات هنا", en: "Bookings will appear here" },
  "admin.goToBookings": { ar: "الذهاب للحجوزات", en: "Go to Bookings" },
  "admin.roomStatus": { ar: "حالة الغرف", en: "Room Status" },
  "admin.currentRoomAvailability": { ar: "توفر الغرف الحالي", en: "Current room availability" },
  "admin.manage": { ar: "إدارة", en: "Manage" },
  "admin.noRoomsYet": { ar: "لا توجد غرف بعد", en: "No rooms yet" },
  "admin.addRoomsToSeeStatus": { ar: "أضف غرفاً لرؤية الحالة هنا", en: "Add rooms to see status here" },
  "admin.manageRooms": { ar: "إدارة الغرف", en: "Manage Rooms" },
  "admin.roomLabel": { ar: "غرفة", en: "Room" },
  "admin.booked": { ar: "محجوزة", en: "Booked" },
  "admin.available": { ar: "متاحة", en: "Available" },
  "admin.maintenance": { ar: "صيانة", en: "Maintenance" },
  "admin.quickActions": { ar: "إجراءات سريعة", en: "Quick Actions" },
  "admin.commonAdminTasks": { ar: "مهام إدارية شائعة", en: "Common administrative tasks" },
  "admin.addNewRoom": { ar: "إضافة غرفة جديدة", en: "Add New Room" },
  "admin.createBooking": { ar: "إنشاء حجز", en: "Create Booking" },
  "admin.addGuest": { ar: "إضافة ضيف", en: "Add Guest" },
  "admin.seoSettings": { ar: "إعدادات SEO", en: "SEO Settings" },
  "admin.updatePricing": { ar: "تحديث الأسعار", en: "Update Pricing" },
  "admin.originalPriceLabel": { ar: "السعر قبل الخصم (اختياري)", en: "Original price (optional)" },
  "admin.sizeLabel": { ar: "مساحة الغرفة (م²)", en: "Room size (m²)" },
  "admin.seoTitleLabel": { ar: "عنوان SEO للغرفة", en: "Room SEO title" },
  "admin.seoDescriptionLabel": { ar: "وصف SEO للغرفة", en: "Room SEO description" },
  "admin.seoTitlePlaceholder": { ar: "مثال: جناح رئاسي فاخر بالقرب من الحرم", en: "e.g. Luxury Presidential Suite near the Haram" },
  "admin.seoDescriptionPlaceholder": {
    ar: "اكتب وصفاً موجزاً للغرفة يظهر في نتائج البحث.",
    en: "Write a short description of this room that will appear in search results."
  },

  // Bookings page
  "admin.bookingsTitle": { ar: "الحجوزات", en: "Bookings" },
  "admin.manageReservations": { ar: "إدارة حجوزات الضيوف", en: "Manage guest reservations" },
  "admin.createReservationForGuest": { ar: "إنشاء حجز لضيف", en: "Create a reservation for a guest" },
  "admin.client": { ar: "العميل", en: "Client" },
  "admin.newGuest": { ar: "ضيف جديد", en: "New guest" },
  "admin.existingGuest": { ar: "ضيف موجود", en: "Existing guest" },
  "admin.fullName": { ar: "الاسم الكامل *", en: "Full name *" },
  "admin.selectGuest": { ar: "اختر الضيف", en: "Select guest" },
  "admin.roomType": { ar: "نوع الغرفة", en: "Room type" },
  "admin.roomNumber": { ar: "رقم الغرفة", en: "Room number" },
  "admin.checkIn": { ar: "تاريخ الوصول", en: "Check-in" },
  "admin.checkOut": { ar: "تاريخ المغادرة", en: "Check-out" },
  "admin.nights": { ar: "الليالي", en: "Nights" },
  "admin.guestsCount": { ar: "الضيوف", en: "Guests" },
  "admin.amount": { ar: "المبلغ (ر.س)", en: "Amount (SAR)" },
  "admin.status": { ar: "الحالة", en: "Status" },
  "admin.payment": { ar: "الدفع", en: "Payment" },
  "admin.cancel": { ar: "إلغاء", en: "Cancel" },
  "admin.createBookingButton": { ar: "إنشاء الحجز", en: "Create booking" },
  "admin.confirmed": { ar: "مؤكد", en: "Confirmed" },
  "admin.pending": { ar: "قيد الانتظار", en: "Pending" },
  "admin.revenue": { ar: "الإيرادات", en: "Revenue" },
  "admin.guestAndBookedRooms": { ar: "الضيف والغرف المحجوزة", en: "Guest & booked rooms" },
  "admin.showAllBookings": { ar: "عرض كل الحجوزات", en: "Show all bookings" },
  "admin.bookedRooms": { ar: "الغرف المحجوزة", en: "Booked room(s)" },
  "admin.noBookingsForGuest": { ar: "لا توجد حجوزات لهذا الضيف.", en: "No bookings for this guest." },
  "admin.checkOutButton": { ar: "تسجيل المغادرة", en: "Check out" },
  "admin.checkInCheckOut": { ar: "الوصول / المغادرة", en: "Check-in / Check-out" },
  "admin.nightsGuests": { ar: "الليالي · الضيوف", en: "Nights · Guests" },
  "admin.amountPayment": { ar: "المبلغ · الدفع", en: "Amount · Payment" },
  "admin.capacity": { ar: "السعة", en: "capacity" },
  "admin.searchBookingsPlaceholder": { ar: "البحث بالضيف أو رقم الحجز أو الغرفة...", en: "Search by guest, booking ID, or room..." },
  "admin.filterByStatus": { ar: "تصفية حسب الحالة", en: "Filter by status" },
  "admin.allStatuses": { ar: "كل الحالات", en: "All Statuses" },
  "admin.bookingId": { ar: "رقم الحجز", en: "Booking ID" },
  "admin.guest": { ar: "الضيف", en: "Guest" },
  "admin.dates": { ar: "التواريخ", en: "Dates" },
  "admin.actions": { ar: "إجراءات", en: "Actions" },
  "admin.createBookingToGetStarted": { ar: "أنشئ حجزاً للبدء", en: "Create a booking to get started" },
  "admin.statusPending": { ar: "قيد الانتظار", en: "Pending" },
  "admin.statusConfirmed": { ar: "مؤكد", en: "Confirmed" },
  "admin.statusCheckedIn": { ar: "تم تسجيل الوصول", en: "Checked-in" },
  "admin.statusCheckedOut": { ar: "تم تسجيل المغادرة", en: "Checked-out" },
  "admin.statusCancelled": { ar: "ملغى", en: "Cancelled" },
  "admin.paymentPaid": { ar: "مدفوع", en: "Paid" },
  "admin.paymentRefunded": { ar: "مسترد", en: "Refunded" },

  // Rooms page
  "admin.rooms": { ar: "الغرف", en: "Rooms" },
  "admin.roomManagement": { ar: "إدارة الغرف", en: "Room Management" },
  "admin.manageRoomsAndAvailability": { ar: "إدارة غرف الفندق والتوفر", en: "Manage hotel rooms and availability" },
  "admin.addRoom": { ar: "إضافة غرفة", en: "Add Room" },
  "admin.addNewRoomTitle": { ar: "إضافة غرفة جديدة", en: "Add New Room" },
  "admin.enterNewRoomDetails": { ar: "أدخل بيانات الغرفة الجديدة", en: "Enter the details for the new room" },
  "admin.pricePerNight": { ar: "السعر لليلة (ر.س)", en: "Price per Night (SAR)" },
  "admin.roomImageFromMedia": { ar: "صورة الغرفة (من الوسائط)", en: "Room image (from Media)" },
  "admin.noMediaUploaded": { ar: "لم يتم رفع وسائط. تم الإبقاء على الصورة الحالية.", en: "No media uploaded. Current image kept." },
  "admin.uploadInMediaFirst": { ar: "ارفع الصور في تبويب الوسائط أولاً، ثم اختر واحدة هنا.", en: "Upload images in the Media tab first, then select one here." },
  "admin.saveChanges": { ar: "حفظ التغييرات", en: "Save changes" },
  "admin.searchRoomsPlaceholder": { ar: "البحث في الغرف...", en: "Search rooms..." },
  "admin.editRoom": { ar: "تعديل الغرفة", en: "Edit Room" },
  "admin.updateRoomDetails": { ar: "تحديث بيانات الغرفة", en: "Update room details" },
  "admin.edit": { ar: "تعديل", en: "Edit" },
  "admin.delete": { ar: "حذف", en: "Delete" },
  "admin.deleteBookingConfirm": { ar: "هل أنت متأكد من حذف هذا الحجز؟ لا يمكن التراجع.", en: "Are you sure you want to delete this booking? This cannot be undone." },
  "admin.deleteGuestConfirm": { ar: "هل أنت متأكد من حذف هذا الضيف؟ سيتم حذف جميع حجوزاته أيضاً.", en: "Are you sure you want to delete this guest? All their bookings will also be removed." },
  "admin.addFirstRoom": { ar: "أضف أول غرفة للبدء", en: "Add your first room to get started" },
  "admin.capacityGuests": { ar: "ضيوف", en: "guests" },
  "admin.capacityLabel": { ar: "السعة", en: "Capacity" },
  "admin.selectType": { ar: "اختر النوع", en: "Select type" },

  // Guests page
  "admin.guestsTitle": { ar: "الضيوف", en: "Guests" },
  "admin.manageGuestRecords": { ar: "إدارة سجلات الضيوف (إضافة ضيوف عبر حجز جديد)", en: "Manage guest records (add guests via New Booking)" },
  "admin.allGuests": { ar: "كل الضيوف", en: "All Guests" },
  "admin.searchAndViewGuests": { ar: "البحث وعرض معلومات الضيوف", en: "Search and view guest information" },
  "admin.searchByNameOrEmail": { ar: "البحث بالاسم أو البريد...", en: "Search by name or email..." },
  "admin.noGuestsYet": { ar: "لا يوجد ضيوف بعد", en: "No guests yet" },
  "admin.guestRecordsAppearHere": { ar: "ستظهر سجلات الضيوف هنا", en: "Guest records will appear here" },
  "admin.name": { ar: "الاسم", en: "Name" },
  "admin.email": { ar: "البريد الإلكتروني", en: "Email" },
  "admin.phone": { ar: "الهاتف", en: "Phone" },

  // Blog
  "admin.blogTitle": { ar: "المدونة", en: "Blog" },
  "admin.manageBlogPosts": { ar: "إدارة مقالات المدونة", en: "Manage blog posts and articles" },
  "admin.newPost": { ar: "مقال جديد", en: "New Post" },
  "admin.posts": { ar: "المقالات", en: "Posts" },
  "admin.allBlogEntries": { ar: "كل مقالات المدونة", en: "All blog entries" },
  "admin.noPostsYet": { ar: "لا توجد مقالات بعد", en: "No posts yet" },
  "admin.createFirstPost": { ar: "أنشئ أول مقال", en: "Create your first blog post" },
  "admin.newPostTitle": { ar: "مقال جديد", en: "New Post" },
  "admin.createBilingualPost": { ar: "إنشاء مقال ثنائي اللغة (EN / AR) متوافق مع SEO", en: "Create an SEO-friendly bilingual post (EN / AR)" },
  "admin.postDetails": { ar: "تفاصيل المقال", en: "Post details" },
  "admin.slugUsedInUrl": { ar: "الرابط المستخدم في الرابط: /blog/[slug]. يدعم RTL/LTR واللغتين.", en: "Slug is used in the URL: /blog/[slug]. RTL/LTR and both languages supported." },
  "admin.urlSlug": { ar: "رابط URL (فريد)", en: "URL slug (unique)" },
  "admin.titleEnglish": { ar: "العنوان (English)", en: "Title (English)" },
  "admin.titleArabic": { ar: "العنوان (العربية)", en: "Title (العربية)" },
  "admin.contentEnglish": { ar: "المحتوى (English) — دعم HTML", en: "Content (English) — HTML supported" },
  "admin.contentArabic": { ar: "المحتوى (العربية) — دعم HTML", en: "Content (العربية)" },
  "admin.draft": { ar: "مسودة", en: "Draft" },
  "admin.published": { ar: "منشور", en: "Published" },
  "admin.savePost": { ar: "حفظ المقال", en: "Save post" },
  "admin.postSlugExists": { ar: "مقال بهذا الرابط موجود مسبقاً. اختر رابطاً فريداً.", en: "A post with this slug already exists. Choose a unique slug." },
  "admin.editPost": { ar: "تعديل المقال", en: "Edit Post" },
  "admin.updateBlogPost": { ar: "تحديث مقال المدونة (EN / AR، متوافق مع SEO)", en: "Update blog post (EN / AR, SEO-friendly)" },
  "admin.postNotFound": { ar: "المقال غير موجود.", en: "Post not found." },
  "admin.backToBlog": { ar: "العودة للمدونة", en: "Back to Blog" },
  "admin.anotherPostUsesSlug": { ar: "مقال آخر يستخدم هذا الرابط. اختر رابطاً فريداً.", en: "Another post already uses this slug. Choose a unique slug." },

  // Media
  "admin.mediaTitle": { ar: "الوسائط", en: "Media" },
  "admin.imagesAndFiles": { ar: "الصور والملفات للغرف والمدونة", en: "Images and files for rooms and blog" },
  "admin.upload": { ar: "رفع", en: "Upload" },
  "admin.uploading": { ar: "جاري الرفع…", en: "Uploading…" },
  "admin.library": { ar: "المكتبة", en: "Library" },
  "admin.uploadedMediaFiles": { ar: "الملفات المرفوعة", en: "Uploaded media files" },
  "admin.noMediaYet": { ar: "لا توجد وسائط بعد", en: "No media yet" },
  "admin.uploadImagesToUse": { ar: "ارفع الصور لاستخدامها في الغرف والمدونة", en: "Upload images to use in rooms and blog" },

  // Login
  "admin.loginTitle": { ar: "تسجيل الدخول للإدارة", en: "Admin Login" },
  "admin.signInToAccess": { ar: "يرجى تسجيل الدخول للوصول إلى لوحة الإدارة.", en: "Please sign in to access the admin panel." },
  "admin.username": { ar: "اسم المستخدم", en: "Username" },
  "admin.password": { ar: "كلمة المرور", en: "Password" },
  "admin.incorrectCredentials": { ar: "اسم المستخدم أو كلمة المرور غير صحيحة.", en: "Incorrect username or password." },
  "admin.loggingIn": { ar: "جاري تسجيل الدخول...", en: "Logging in..." },
  "admin.loginButton": { ar: "تسجيل الدخول", en: "Login" },
  "admin.credentialsHint": { ar: "اسم المستخدم: admin — كلمة المرور: admin", en: "Username: admin — Password: admin" },
  "admin.useDesktopOnly": { ar: "افتح لوحة التحكم على جهاز كمبيوتر", en: "Open the dashboard on a computer" },
  "admin.useDesktopOnlyHint": { ar: "لوحة الإدارة متاحة على الشاشات الأكبر فقط.", en: "The admin dashboard is only available on larger screens." },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: "rtl" | "ltr";
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("ar");

  const t = useCallback(
    (key: string): string => {
      const translation = translations[key];
      if (!translation) {
        console.warn(`Translation missing for key: ${key}`);
        return key;
      }
      return translation[language];
    },
    [language]
  );

  const dir = language === "ar" ? "rtl" : "ltr";

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

export function LanguageToggle() {
  const { language, setLanguage } = useI18n();

  return (
    <button
      onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
      className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
    >
      {language === "ar" ? "English" : "العربية"}
    </button>
  );
}

const ADMIN_LANG_KEY = "admin-lang";

/** Sync admin language from localStorage on mount. Render inside I18nProvider. */
export function AdminLangSync() {
  const { setLanguage } = useI18n();
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(ADMIN_LANG_KEY) : null;
    if (stored === "ar" || stored === "en") setLanguage(stored);
  }, [setLanguage]);
  return null;
}

/** Language toggle for admin that persists to localStorage. */
export function AdminLanguageToggle() {
  const { language, setLanguage } = useI18n();
  return (
    <button
      type="button"
      onClick={() => {
        const next = language === "ar" ? "en" : "ar";
        setLanguage(next);
        if (typeof window !== "undefined") window.localStorage.setItem(ADMIN_LANG_KEY, next);
      }}
      className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
    >
      {language === "ar" ? "English" : "العربية"}
    </button>
  );
}
