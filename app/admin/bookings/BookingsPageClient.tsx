"use client";

import { useEffect, useState } from "react";
import BookingsPageContent from "./BookingsPageContent";

export default function BookingsPageClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  return <BookingsPageContent />;
}

