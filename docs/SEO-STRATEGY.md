# SEO Strategy — نرسيان طيبة (nersyantaiba.com)

A furnished-apartments / hotel brand serving pilgrims and visitors staying near
**Al-Masjid an-Nabawi (المسجد النبوي)** in **Madinah**. Primary audience is
Arabic-speaking; English is secondary. Bookings are seasonal (Ramadan, Hajj,
school holidays).

## 1. Target keywords

### Primary (Arabic — highest intent)
- فنادق المدينة المنورة
- فنادق قريبة من الحرم النبوي / فنادق قرب المسجد النبوي
- شقق مفروشة المدينة المنورة
- شقق فندقية المدينة المنورة
- حجز فندق المدينة المنورة
- إيجار شهري المدينة المنورة (monthly stays — your differentiator vs. BaytRent)
- فنادق رخيصة المدينة المنورة

### Secondary (English)
- hotels in Madinah near Haram / near the Prophet's Mosque
- furnished apartments Madinah
- monthly apartment rental Madinah
- where to stay in Madinah near Al-Masjid an-Nabawi

### Long-tail / seasonal (blog + landing pages)
- "أفضل فنادق المدينة المنورة لشهر رمضان"
- "كم تبعد الفنادق عن الحرم النبوي"
- "شقق عوائل المدينة المنورة قرب الحرم"
- "Madinah hotels walking distance to Haram"

## 2. On-page plan (per page)

| Page | Target | Title pattern | Needs |
|------|--------|---------------|-------|
| Home `/` | brand + فنادق المدينة المنورة | done (settings-driven) | strong H1 with keyword |
| `/rooms` | شقق فندقية / غرف المدينة | "غرفنا الفاخرة في المدينة المنورة" | per-page metadata |
| `/rooms/[id]` | room type + قرب الحرم | "{room} — نرسيان طيبة" | **server metadata + Room/Offer JSON-LD + OG image = room photo** |
| `/blog/[slug]` | long-tail queries | "{post title}" | **Article JSON-LD + server metadata** |

> ⚠️ Biggest remaining technical gap: room and blog pages are **client
> components with no per-page `generateMetadata`**. They currently inherit the
> homepage tags. Splitting each into a server wrapper (`page.tsx` exporting
> `generateMetadata`) + client body is the highest-impact next SEO task.

## 3. Technical SEO — status
- [x] Server-rendered metadata in root layout (title/description/OG/Twitter)
- [x] `metadataBase`, canonical, robots directives
- [x] JSON-LD `Hotel` schema (name, address Madinah, geo, amenities)
- [x] Dynamic `sitemap.xml` (rooms + published posts)
- [x] `robots.ts` blocks `/admin`, `/api`, `/payment`, `/my-bookings`
- [ ] Per-page metadata for `/rooms/[id]` and `/blog/[slug]`
- [ ] `Room`/`Offer` + `Article` + `BreadcrumbList` JSON-LD
- [ ] Real 1200×630 OG image (currently reuses the mosque photo)
- [ ] Image `alt` text with keywords; compress room photos
- [ ] Submit sitemap in **Google Search Console** + **Bing Webmaster**
- [ ] Set up **Google Business Profile** for the property (local pack + maps)

## 4. Content plan (blog — drives long-tail traffic)
Publish 1–2 Arabic posts/month answering real search questions:
1. دليل السكن قرب الحرم النبوي (distances, map, walking times)
2. أفضل وقت لزيارة المدينة المنورة + أسعار الفنادق حسب الموسم
3. نصائح حجز شقة مفروشة للعائلات في المدينة
4. الفرق بين الفندق والشقة الفندقية — أيهما أنسب لإقامتك
Each post links to `/rooms` and relevant room pages (internal linking).

## 5. Off-page / local
- Google Business Profile (reviews are a major local ranking factor).
- Consistent NAP (Name/Address/Phone) across listings.
- Listings on Arabic travel/hajj-umrah directories.
- Encourage guest reviews (also feeds `AggregateRating` JSON-LD later).

## 6. Measurement
- Google Search Console: track impressions/clicks for the primary keywords.
- Vercel Analytics already installed for traffic.
- Review quarterly; double down on posts/pages that gain impressions.
