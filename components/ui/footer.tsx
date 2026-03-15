import Link from "next/link";
import { Button } from "@/components/ui/button";

interface FooterProps {
  logo: React.ReactNode;
  brandName: string;
  socialLinks: Array<{
    icon: React.ReactNode;
    href: string;
    label: string;
  }>;
  mainLinks: Array<{
    href: string;
    label: string;
  }>;
  legalLinks: Array<{
    href: string;
    label: string;
  }>;
  copyright: {
    text: string;
    license?: string;
  };
  /** Optional block (e.g. contact info) rendered below the links in the bordered section */
  extra?: React.ReactNode;
}

export function Footer({
  logo,
  brandName,
  socialLinks,
  mainLinks,
  legalLinks,
  copyright,
  extra,
}: FooterProps) {
  return (
    <footer className="border-t bg-card pb-6 pt-16 lg:pb-8 lg:pt-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="md:flex md:items-start md:justify-between">
          <Link
            href="/"
            className="flex items-center gap-x-2"
            aria-label={brandName}
          >
            {logo}
            <span className="text-xl font-bold text-foreground">{brandName}</span>
          </Link>
          <ul className="mt-6 flex list-none gap-3 md:mt-0">
            {socialLinks.map((link, i) => (
              <li key={i}>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  asChild
                >
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                  >
                    {link.icon}
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6 border-t pt-6 md:mt-4 md:pt-8 lg:grid lg:grid-cols-10 lg:gap-6">
          <div className="text-sm leading-6 text-muted-foreground lg:col-[1/4] lg:row-span-2 lg:mt-0">
            <div>{copyright.text}</div>
            {copyright.license && <div className="mt-1">{copyright.license}</div>}
          </div>
          <nav className="lg:col-[4/11] lg:row-1 lg:mt-0">
            <ul className="-mx-2 -my-1 flex list-none flex-wrap lg:justify-end">
              {mainLinks.map((link, i) => (
                <li key={i} className="mx-2 my-1 shrink-0">
                  <Link
                    href={link.href}
                    className="text-sm text-primary underline-offset-4 hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-6 lg:col-[4/11] lg:row-2 lg:mt-4 lg:pt-0">
            <ul className="-mx-3 -my-1 flex list-none flex-wrap lg:justify-end">
              {legalLinks.map((link, i) => (
                <li key={i} className="mx-3 my-1 shrink-0">
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {extra && (
            <div className="mt-6 lg:col-span-full lg:mt-6 lg:border-t lg:pt-6">
              {extra}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
