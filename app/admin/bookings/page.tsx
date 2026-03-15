import { Suspense } from "react";
import BookingsPageContent from "./BookingsPageContent";

export default function BookingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
          Loading…
        </div>
      }
    >
      <BookingsPageContent />
    </Suspense>
  );
}
