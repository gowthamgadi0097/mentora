"use client";

import { useRef, useState } from "react";

type Props = {
  accept?: string;
  onFile: (file: File | null) => void;
};

export default function FileUpload({ accept = ".pdf,.txt,.md", onFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  const pick = (file: File | null) => {
    setName(file?.name ?? null);
    onFile(file);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        pick(e.dataTransfer.files?.[0] ?? null);
      }}
      className={`rounded-2xl border-2 border-dashed p-6 text-center transition ${
        drag ? "border-primary bg-primary/10" : "border-border/70"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0] ?? null)}
      />
      <p className="text-sm text-muted">
        {name ? (
          <>
            Selected: <span className="font-semibold text-text">{name}</span>
          </>
        ) : (
          "Drag a PDF or text file here"
        )}
      </p>
      <div className="mt-3 flex justify-center gap-2">
        <button type="button" className="btn-ghost !py-1.5 text-xs" onClick={() => inputRef.current?.click()}>
          Browse files
        </button>
        {name && (
          <button
            type="button"
            className="btn-ghost !py-1.5 text-xs"
            onClick={() => {
              if (inputRef.current) inputRef.current.value = "";
              pick(null);
            }}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
