"use client";

import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";

interface LightboxProps {
  images: { src: string; caption?: string }[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function Lightbox({ images, index, onClose, onPrev, onNext }: LightboxProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  const current = images[index];
  if (!current) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-brand-red z-10 p-2"
        aria-label="Fechar"
      >
        <X className="w-7 h-7" />
      </button>
      <button
        onClick={onPrev}
        className="absolute left-4 text-white hover:text-brand-red z-10 p-2"
        aria-label="Anterior"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      <button
        onClick={onNext}
        className="absolute right-4 text-white hover:text-brand-red z-10 p-2"
        aria-label="Próximo"
      >
        <ChevronRight className="w-8 h-8" />
      </button>
      <div className="relative w-full max-w-5xl h-[80vh] mx-4">
        <Image
          src={current.src}
          alt={current.caption || ""}
          fill
          sizes="100vw"
          className="object-contain"
        />
      </div>
      {current.caption && (
        <p className="absolute bottom-6 text-center text-white text-sm">{current.caption}</p>
      )}
    </div>
  );
}
