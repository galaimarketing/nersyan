/**
 * Saudi Riyal symbol using @abdulrysr/saudi-riyal-new-symbol-font.
 * Use instead of "$" or the text "SAR" for currency display.
 */
export function CurrencySymbol({ className }: { className?: string }) {
  return (
    <span
      className={`icon-saudi_riyal ${className ?? ""}`.trim()}
      aria-hidden
    >
      &#xea;
    </span>
  );
}
