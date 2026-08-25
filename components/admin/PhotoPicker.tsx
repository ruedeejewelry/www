"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { createPhotoUploadUrl } from "@/app/(admin)/admin/actions";
import { useToast } from "@/components/ui/Toast";
import { compressImage } from "@/lib/image-compress";
import { createClient } from "@/lib/supabase/client";

export type PickedPhoto = {
  path: string;
  previewUrl: string;
  width: number;
  height: number;
  alt: string;
};

type Props = {
  bucket: "product-photos" | "article-images";
  photos: PickedPhoto[];
  onChange: (next: PickedPhoto[]) => void;
  aspect?: number;
  max?: number;
};

/**
 * Shoot or pick straight from the phone, several at a time. Each file is
 * shrunk and cropped in the browser before it goes anywhere (§9), with the
 * crop position adjustable afterwards. The first photo is the one that shows
 * in the grid.
 */
export function PhotoPicker({
  bucket,
  photos,
  onChange,
  aspect = 1,
  max = 8,
}: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);
  const [progress, setProgress] = useState<string | null>(null);
  const toast = useToast();

  const uploadOne = async (file: File, offset = 0.5) => {
    const compressed = await compressImage(file, { aspect, offset });

    const signed = await createPhotoUploadUrl(bucket, file.name);
    if (!signed.ok) throw new Error(signed.error);

    const supabase = createClient();
    const { error } = await supabase.storage
      .from(bucket)
      .uploadToSignedUrl(signed.data.path, signed.data.token, compressed.blob, {
        contentType: compressed.blob.type,
      });
    if (error) throw new Error(error.message);

    return {
      path: signed.data.path,
      previewUrl: compressed.previewUrl,
      width: compressed.width,
      height: compressed.height,
      alt: "",
    } satisfies PickedPhoto;
  };

  const handleFiles = async (files: FileList) => {
    const room = max - photos.length;
    const list = Array.from(files).slice(0, room);
    if (list.length === 0) return;

    setBusy(list.length);
    const done: PickedPhoto[] = [];
    for (const [i, file] of list.entries()) {
      setProgress(`กำลังอัปโหลด ${i + 1}/${list.length}`);
      try {
        done.push(await uploadOne(file));
      } catch (error) {
        console.error("photo upload failed", error);
        toast.show("อัปโหลดรูปไม่สำเร็จ ข้อมูลที่กรอกไว้ยังอยู่ ลองใหม่ได้");
      }
    }
    setBusy(0);
    setProgress(null);
    if (done.length) onChange([...photos, ...done]);
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= photos.length) return;
    const next = [...photos];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div>
      <div className="no-scrollbar mt-[10px] flex gap-2 overflow-x-auto">
        {photos.map((photo, i) => (
          <div key={photo.path} className="relative shrink-0">
            <div className="relative h-[78px] w-[78px] overflow-hidden rounded-[10px]">
              <Image
                src={photo.previewUrl}
                alt={photo.alt || `รูปที่ ${i + 1}`}
                fill
                sizes="78px"
                unoptimized
                className="object-cover"
              />
            </div>
            {i === 0 ? (
              <span className="absolute top-[5px] left-[5px] rounded-[5px] bg-ink px-[5px] py-0.5 text-[9px] text-[#f5f1ea]">
                รูปหลัก
              </span>
            ) : null}
            <div className="mt-1 flex gap-1">
              <button
                type="button"
                aria-label="เลื่อนไปทางซ้าย"
                onClick={() => move(i, i - 1)}
                className="h-9 flex-1 rounded-md border border-border bg-card text-[12px] text-body"
              >
                ←
              </button>
              <button
                type="button"
                aria-label="เลื่อนไปทางขวา"
                onClick={() => move(i, i + 1)}
                className="h-9 flex-1 rounded-md border border-border bg-card text-[12px] text-body"
              >
                →
              </button>
              <button
                type="button"
                aria-label="เอารูปออก"
                onClick={() => onChange(photos.filter((_, j) => j !== i))}
                className="h-9 flex-1 rounded-md border border-border bg-card text-[12px] text-muted"
              >
                ×
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy > 0 || photos.length >= max}
          className="h-[78px] w-[78px] shrink-0 rounded-[10px] border border-dashed border-border-dash bg-paper text-[12px] leading-[1.4] text-body-soft disabled:opacity-60"
        >
          {busy > 0 ? (
            "กำลังอัปโหลด"
          ) : (
            <>
              ถ่ายรูป
              <br />
              หรือเลือก
            </>
          )}
        </button>
      </div>

      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {progress ? (
        <p className="mt-2 text-[11.5px] text-body">{progress}</p>
      ) : null}
    </div>
  );
}
