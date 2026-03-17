import Link from "next/link";
import { Instagram } from "lucide-react";

const SnapIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    className="size-6"
    fill="currentColor"
    aria-hidden
  >
    <path d="M5.829 4.533c-.6 1.344-.363 3.752-.267 5.436-.648.359-1.48-.271-1.951-.271-.49 0-1.075.322-1.167.802-.066.346.089.85 1.201 1.289.43.17 1.453.37 1.69.928.333.784-1.71 4.403-4.918 4.931-.251.041-.43.265-.416.519.056.975 2.242 1.357 3.211 1.507.099.134.179.7.306 1.131.057.193.204.424.582.424.493 0 1.312-.38 2.738-.144 1.398.233 2.712 2.215 5.235 2.215 2.345 0 3.744-1.991 5.09-2.215.779-.129 1.448-.088 2.196.058.515.101.977.157 1.124-.349.129-.437.208-.992.305-1.123.96-.149 3.156-.53 3.211-1.505.014-.254-.165-.477-.416-.519-3.154-.52-5.259-4.128-4.918-4.931.236-.557 1.252-.755 1.69-.928.814-.321 1.222-.716 1.213-1.173-.011-.585-.715-.934-1.233-.934-.527 0-1.284.624-1.897.286.096-1.698.332-4.095-.267-5.438-1.135-2.543-3.66-3.829-6.184-3.829-2.508 0-5.014 1.268-6.158 3.833z" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.61v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg
    viewBox="0 0 32 32"
    className="size-7"
    fill="currentColor"
    aria-hidden
  >
    <path d="M16.04 5C10.53 5 6 9.53 6 15.04c0 2.06.61 3.96 1.77 5.6L6 27l6.52-1.7a10.09 10.09 0 0 0 3.52.62h.01c5.51 0 10.04-4.53 10.04-10.04C26.09 9.53 21.55 5 16.04 5Zm0 18.21c-1.08 0-2.13-.29-3.05-.84l-.22-.13-3.86 1.01 1.03-3.76-.14-.23a7.22 7.22 0 0 1-1.1-3.87c0-4 3.26-7.26 7.26-7.26 1.94 0 3.76.76 5.13 2.13a7.2 7.2 0 0 1 2.13 5.13c-.01 4-3.27 7.26-7.28 7.26Zm3.98-5.42c-.22-.11-1.31-.65-1.51-.72-.2-.07-.35-.11-.5.11-.15.22-.57.72-.7.87-.13.15-.26.16-.48.05-.22-.11-.93-.34-1.77-1.08-.65-.58-1.09-1.29-1.22-1.51-.13-.22-.01-.34.1-.45.1-.1.22-.26.34-.38.11-.13.15-.22.22-.37.07-.15.04-.28-.02-.39-.07-.11-.5-1.2-.69-1.65-.18-.44-.37-.38-.5-.39h-.43c-.15 0-.39.05-.6.28-.2.22-.79.77-.79 1.88 0 1.11.81 2.18.93 2.34.11.15 1.6 2.44 3.89 3.42.54.23.96.37 1.29.47.54.17 1.03.15 1.42.09.43-.06 1.31-.54 1.5-1.07.18-.54.18-1 .13-1.09-.06-.09-.2-.15-.43-.26Z" />
  </svg>
);

const navLinks = [
  { title: "الرئيسية", href: "/" },
  { title: "الغرف", href: "/rooms" },
  { title: "المرافق", href: "/#amenities" },
  { title: "الموقع", href: "/#location" },
  { title: "تواصل معنا", href: "/#contact" },
];

const legalLinks = [
  { title: "سياسة الخصوصية", href: "/privacy" },
  { title: "الشروط والأحكام", href: "/terms" },
  { title: "سياسة الإلغاء", href: "/cancellation" },
];

export default function FooterSection() {
  const year = new Date().getFullYear();

  return (
    <footer className="py-16 md:py-24 bg-[#d8d8d8] text-foreground">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <Link href="/" aria-label="go home" className="mx-auto mb-8 block size-fit" />

        <div className="mb-8 flex flex-wrap justify-center gap-6 text-sm">
          {navLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="block text-muted-foreground duration-150 hover:text-[var(--ring)]"
            >
              <span>{link.title}</span>
            </Link>
          ))}
        </div>

        <div className="mb-6 flex flex-wrap justify-center gap-4 text-xs">
          {legalLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="block text-muted-foreground underline-offset-4 hover:text-[var(--ring)] hover:underline"
            >
              {link.title}
            </Link>
          ))}
        </div>

        <div className="mb-8 flex flex-wrap justify-center gap-6 text-sm">
          <Link
            href="https://www.snapchat.com/add/nersiantaiba"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Snapchat"
            className="block text-muted-foreground hover:text-[var(--ring)]"
          >
            <SnapIcon />
          </Link>
          <Link
            href="https://www.tiktok.com/@nersiantaiba"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="block text-muted-foreground hover:text-[var(--ring)]"
          >
            <TikTokIcon />
          </Link>
          <Link
            href="https://www.instagram.com/nersiantaiba"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="block text-muted-foreground hover:text-[var(--ring)]"
          >
            <Instagram className="size-6" />
          </Link>
        </div>

        <span className="block text-center text-sm text-muted-foreground">
          © {year} نرسيان طيبة، جميع الحقوق محفوظة
        </span>
      </div>
    </footer>
  );
}

// Backwards-compatible named export so existing code using { Footer } continues to work.
export function Footer() {
  return <FooterSection />;
}
