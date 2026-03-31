"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useSettings } from "@/lib/settings";

const VIMEO_EMBED_URL =
  "https://player.vimeo.com/video/1172884501?badge=0&autopause=0&autoplay=1&muted=1&loop=1&background=1";

declare global {
  interface Window {
    Vimeo?: {
      Player: new (element: HTMLIFrameElement) => {
        setVolume: (n: number) => Promise<void>;
        play: () => Promise<void>;
        on: (event: string, cb: () => void) => void;
      };
    };
  }
}

function isSafari(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  return (
    (ua.includes("Safari") && !ua.includes("Chrome")) ||
    ua.includes("iPhone") ||
    ua.includes("iPad")
  );
}

export function HeroSection() {
  const { t, dir, language } = useI18n();
  const settings = useSettings();
  const siteName = language === "ar" ? (settings.hotelNameAr ?? "نرسيان طيبة") : (settings.hotelNameEn ?? "Nersian Taiba");
  const ChevronIcon = dir === "rtl" ? ChevronLeft : ChevronRight;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<{ setVolume: (n: number) => Promise<void>; play: () => Promise<void>; on: (e: string, cb: () => void) => void } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [vimeoReady, setVimeoReady] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [safariNeedsTap, setSafariNeedsTap] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setVimeoReady(Boolean(window.Vimeo));
    setSafariNeedsTap(isSafari());
  }, [mounted]);

  useEffect(() => {
    const isSecure = typeof window !== "undefined" && window.location?.protocol === "https:";
    if (!vimeoReady || !iframeRef.current || !window.Vimeo || !isSecure) return;
    const iframe = iframeRef.current;
    const Player = window.Vimeo.Player;
    const player = new Player(iframe);
    playerRef.current = player;
    setPlayerReady(true);
    player.setVolume(0).catch(() => {});

    const play = () => {
      player.setVolume(0).catch(() => {});
      player.play().catch(() => {});
    };

    player.on("play", () => setVideoStarted(true));
    play();
    player.on("loaded", play);
    const t1 = setTimeout(play, 150);
    const t2 = setTimeout(play, 600);
    const t3 = setTimeout(play, 1500);
    return () => {
      playerRef.current = null;
      setPlayerReady(false);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [vimeoReady]);

  const handleSafariTap = () => {
    playerRef.current?.setVolume(0).catch(() => {});
    playerRef.current?.play().catch(() => {});
    setVideoStarted(true);
  };

  const showSafariOverlay = safariNeedsTap && playerReady && !videoStarted;

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Video (Vimeo) – iframe loads immediately with page */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "max(100vw, 177.78vh)",
            height: "max(56.25vw, 100vh)",
          }}
        >
          {mounted && (
            <iframe
              ref={iframeRef}
              src={VIMEO_EMBED_URL}
              className="pointer-events-none absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              title="Hero background"
              fetchPriority="high"
            />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/35 via-background/15 to-background/80" />
      </div>

      {/* Safari only: transparent overlay so one tap starts video (Safari blocks autoplay) */}
      {showSafariOverlay && (
        <div
          className="absolute inset-0 z-20 cursor-default"
          aria-hidden
          onClick={handleSafariTap}
          onTouchStart={handleSafariTap}
          style={{ touchAction: "manipulation" }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 py-24 text-center lg:px-12" dir={dir}>
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
          </span>
          <span className="text-sm font-medium text-white">
            {language === "ar" ? "5 دقائق من الحرم النبوي" : "5 Minutes from Al-Masjid an-Nabawi"}
          </span>
        </div>

        {/* Title */}
        <h1 className="mb-6 max-w-4xl text-balance text-5xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
          {siteName}
        </h1>

        {/* Subtitle */}
        <p className="mb-10 max-w-2xl text-balance text-lg text-white/90 md:text-xl">
          {t("hero.subtitle")}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="h-14 rounded-full px-8 text-base">
            <Link href="/rooms">
              <span className="text-nowrap">{t("hero.cta")}</span>
              <ChevronIcon className="ms-1 h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-14 rounded-full px-8 text-base"
          >
            <a href="tel:+966508060816">
              <Phone className="me-2 h-5 w-5" />
              <span className="text-nowrap">{t("booking.callToBook")}</span>
            </a>
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-sm font-semibold text-white">4.9/5</p>
            <p className="text-xs text-white/80">
              {language === "ar" ? "+500 تقييم" : "500+ Reviews"}
            </p>
          </div>
          <div className="h-10 w-px bg-white/30" />
          <div className="text-center">
            <p className="text-2xl font-bold text-white">5</p>
            <p className="text-xs text-white/80">{t("features.distance")}</p>
          </div>
          <div className="h-10 w-px bg-white/30" />
          <div className="text-center">
            <p className="text-2xl font-bold text-white">24/7</p>
            <p className="text-xs text-white/80">
              {language === "ar" ? "خدمة العملاء" : "Customer Service"}
            </p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/30 p-1">
          <div className="h-2 w-1 animate-bounce rounded-full bg-white/70" />
        </div>
      </div>
    </section>
  );
}
