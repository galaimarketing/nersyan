"use client";

import { useI18n } from "@/lib/i18n";

type Props = {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  image: string;
  icon?: React.ReactNode;
  flipGradient?: boolean;
};

export function LocationHighlightSection({
  id,
  titleAr,
  titleEn,
  image,
  flipGradient,
}: Props) {
  const { language, dir } = useI18n();
  const title = language === "ar" ? titleAr : titleEn;

  return (
    <section
      id={id}
      className="relative min-h-[200px] bg-cover bg-center bg-no-repeat py-12 md:min-h-[240px] md:py-16"
      style={{ backgroundImage: `url(${image})` }}
      dir={dir}
    >
      {/* Same gradient as hero; flipGradient uses bottom-to-top */}
      <div
        className={`absolute inset-0 from-black/65 via-black/30 to-black/70 ${flipGradient ? "bg-gradient-to-t" : "bg-gradient-to-b"}`}
        aria-hidden
      />
      <div className="relative mx-auto flex min-h-[160px] max-w-7xl items-center justify-center px-6 text-center md:min-h-[200px] lg:px-12">
        <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)] md:text-3xl">
          {title}
        </h2>
      </div>
    </section>
  );
}
