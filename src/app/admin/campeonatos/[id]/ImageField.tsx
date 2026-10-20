"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { uploadAdminFile } from "@/lib/admin-client";
import { cn } from "@/lib/utils";

interface ImageFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  onError: (message: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
  previewClassName?: string;
}

export function ImageField({ label, value, onChange, onError, onUploadingChange, previewClassName }: ImageFieldProps) {
  const [uploading, setUploading] = useState(false);

  function setBusy(busy: boolean) {
    setUploading(busy);
    onUploadingChange?.(busy);
  }

  return (
    <div>
      <Label>{label}</Label>
      <Input
        type="file"
        accept="image/*"
        className="mt-1"
        disabled={uploading}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          try {
            const upload = await uploadAdminFile(file);
            onChange(upload.url);
          } catch (error) {
            onError(error instanceof Error ? error.message : "Falha ao enviar imagem. Verifique sua conexão e tente novamente.");
          } finally {
            setBusy(false);
          }
        }}
      />
      {uploading && <p className="mt-1 text-xs text-brand-gray">Enviando imagem...</p>}
      {value && !uploading && (
        <div className={cn("relative mt-2 inline-block overflow-hidden rounded-sm border border-brand-border bg-brand-black", previewClassName)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="h-20 w-auto max-w-full object-contain" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-1 top-1 rounded-sm bg-black/70 p-1 text-brand-red"
            aria-label={`Remover ${label.toLowerCase()}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
