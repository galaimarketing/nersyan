"use client";

import { useRef } from "react";
import { Bold, Italic, Link, Image } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RichTextToolbarProps {
  value: string;
  onChange: (value: string) => void;
  textareaId: string;
  placeholder?: string;
  className?: string;
  dir?: "ltr" | "rtl";
}

export function RichTextToolbar({
  value,
  onChange,
  textareaId,
  placeholder,
  className,
  dir = "ltr",
}: RichTextToolbarProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const insertAtCursor = (before: string, after: string = "") => {
    const ta = textareaRef.current ?? document.getElementById(textareaId) as HTMLTextAreaElement | null;
    if (!ta) {
      onChange(value + before + after);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = value;
    const selected = text.slice(start, end);
    const newText = text.slice(0, start) + before + selected + after + text.slice(end);
    onChange(newText);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const insertImage = () => {
    const url = window.prompt("Image URL:");
    if (url) insertAtCursor(`<img src="${url.replace(/"/g, "&quot;")}" alt="" />`, "");
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-1 rounded-t-md border border-b-0 border-input bg-muted/50 p-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => insertAtCursor("<strong>", "</strong>")}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => insertAtCursor("<em>", "</em>")}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => insertAtCursor('<a href="https://">', "</a>")}
          title="Link"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={insertImage}
          title="Image"
        >
          <Image className="h-4 w-4" />
        </Button>
      </div>
      <textarea
        ref={textareaRef}
        id={textareaId}
        dir={dir}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[200px] w-full rounded-b-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        rows={10}
      />
    </div>
  );
}
