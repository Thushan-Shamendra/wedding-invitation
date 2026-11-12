import { useId } from "react";
import { CouplePortrait } from "@/components/wedding/CouplePortrait";

const photoTypes = ["image/jpeg", "image/png", "image/webp"];
const jpegPrefix = "data:image/jpeg;base64,";
const maxPortraitLength = jpegPrefix.length + 4 * Math.ceil((256 * 1024) / 3);

async function preparePortrait(file: File) {
  if (!photoTypes.includes(file.type) || file.size > 15 * 1024 * 1024) {
    throw new Error("Choose a JPG, PNG, or WebP image up to 15 MB.");
  }

  const url = URL.createObjectURL(file);
  try {
    const image = new window.Image();
    image.src = url;
    await image.decode().catch(() => {
      throw new Error("This image could not be opened. Choose another file.");
    });

    const crop = Math.min(image.naturalWidth, image.naturalHeight);
    const size = Math.min(crop, 480);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context || !size) throw new Error("This image could not be prepared.");

    context.fillStyle = "#fffaf3";
    context.fillRect(0, 0, size, size);
    context.drawImage(image, (image.naturalWidth - crop) / 2, (image.naturalHeight - crop) / 2,
      crop, crop, 0, 0, size, size);

    const portrait = canvas.toDataURL("image/jpeg", 0.86);
    if (portrait.length > maxPortraitLength || !portrait.startsWith(jpegPrefix)) {
      throw new Error("This image could not be resized. Choose another file.");
    }
    return portrait;
  } finally {
    URL.revokeObjectURL(url);
  }
}

interface CouplePhotoFieldProps {
  role: "Bride" | "Groom";
  photo: string;
  disabled: boolean;
  processing: boolean;
  error?: string;
  onChange: (photo: string) => void;
  onProcessing: (processing: boolean) => void;
  onError: (error: string) => void;
}

export function CouplePhotoField({ role, photo, disabled, processing, error, onChange, onProcessing, onError }: CouplePhotoFieldProps) {
  const id = useId();

  async function selectPhoto(file?: File) {
    if (!file) return;
    onError("");
    onProcessing(true);
    try {
      onChange(await preparePortrait(file));
    } catch (err) {
      onError(err instanceof Error ? err.message : "This image could not be prepared.");
    } finally {
      onProcessing(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="w-20 shrink-0"><CouplePortrait photo={photo} name={`the ${role.toLowerCase()}`} /></div>
      <div className="min-w-0 space-y-1.5">
        <label htmlFor={id} className="block text-sm font-medium text-[#26231F]">{role} photo</label>
        <input
          id={id}
          type="file"
          accept={photoTypes.join(",")}
          disabled={disabled || processing}
          aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`}
          className="block w-full max-w-sm text-xs text-[#746E66] file:mr-2 file:rounded-lg file:border file:border-[#E8E3DA] file:bg-[#F8F6F1] file:px-3 file:py-2 file:font-medium file:text-[#26231F]"
          onChange={(event) => {
            void selectPhoto(event.currentTarget.files?.[0]);
            event.currentTarget.value = "";
          }}
        />
        <p id={`${id}-hint`} className="text-xs text-[#746E66]">JPG, PNG, or WebP up to 15 MB. Photos are cropped to the center.</p>
        {processing && <p role="status" className="text-xs text-[#746E66]">Preparing photo…</p>}
        {error && <p id={`${id}-error`} role="alert" className="text-xs text-rose-700">{error}</p>}
        {photo && (
          <button type="button" disabled={disabled || processing} onClick={() => { onError(""); onChange(""); }} className="text-xs font-medium text-rose-700 underline disabled:opacity-50">
            Remove {role.toLowerCase()} photo
          </button>
        )}
      </div>
    </div>
  );
}
