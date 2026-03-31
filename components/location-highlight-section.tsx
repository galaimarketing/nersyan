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
  descAr,
  descEn,
  image,
  icon,
  flipGradient,
}: Props) {
  const { language, dir } = useI18n();
  const title = language === "ar" ? titleAr : titleEn;
  const desc = language === "ar" ? descAr : descEn;

  return (
    <section
      id={id}
      className="relative min-h-[200px] bg-cover bg-center bg-no-repeat py-12 md:min-h-[240px] md:py-16"
      style={{ backgroundImage: `url(${image})` }}
      dir={dir}
    >
      {/* Same gradient as hero; flipGradient uses bottom-to-top */}
      <div
        className={`absolute inset-0 from-background/35 via-background/15 to-background/80 ${flipGradient ? "bg-gradient-to-t" : "bg-gradient-to-b"}`}
        aria-hidden
      />
      <div className="relative mx-auto flex min-h-[160px] max-w-7xl flex-col justify-center px-6 md:min-h-[200px] lg:px-12">
        <div
          className={`w-full max-w-[280px] rounded-2xl border border-white/20 bg-white/75 p-5 shadow-lg backdrop-blur-sm ${flipGradient ? "ms-auto" : ""}`}
        >
          {icon && (
            <div className="mb-3 inline-flex rounded-lg bg-black/10 p-2 text-black">
              {icon}
            </div>
          )}
          <h2 className="mb-2 text-lg font-bold tracking-tight text-foreground md:text-xl">
            {title}
          </h2>
          <p className="text-sm leading-snug text-muted-foreground md:text-base">
            {desc}
          </p>
        </div>
      </div>
    </section>
  );
}
