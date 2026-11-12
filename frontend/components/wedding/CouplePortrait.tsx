import Image from "next/image";
import { UserRound } from "lucide-react";

export function CouplePortrait({ photo, name }: { photo?: string; name: string }) {
  return (
    <div className="relative mx-auto grid aspect-square w-full place-items-center overflow-hidden rounded-full bg-[#f0e6d8] text-[#89653b]">
      {photo ? (
        <Image src={photo} alt={`Portrait of ${name}`} fill unoptimized className="object-cover" />
      ) : (
        <UserRound size="42%" strokeWidth={1.25} aria-hidden="true" />
      )}
    </div>
  );
}
