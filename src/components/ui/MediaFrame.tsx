import Image from "next/image";
import clsx from "clsx";
import { getPhoto, shotTone } from "@/lib/photos";

type Props = {
  /** Shot id from docs/shot-list.json, e.g. "coach-boxing" */
  shot: string;
  alt: string;
  sizes: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  /** Hide the file name on the placeholder (small frames) */
  quiet?: boolean;
};

/**
 * Every photo on the site goes through this frame. Until the photo exists in public/photos,
 * the frame shows a "light study": the light of that shot drawn in CSS, with the expected file name.
 */
export function MediaFrame({ shot, alt, sizes, className, imgClassName, priority, quiet }: Props) {
  const photo = getPhoto(shot);
  const tone = shotTone(shot);
  // Tailwind's .relative is emitted after .absolute, so never add it when the caller positions the frame.
  const positioned = /\b(absolute|fixed|sticky)\b/.test(className ?? "");
  return (
    <div className={clsx("overflow-hidden", !positioned && "relative", className)}>
      {photo ? (
        <Image
          src={photo.src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          quality={80}
          placeholder="blur"
          blurDataURL={photo.blur}
          className={clsx("object-cover", imgClassName)}
        />
      ) : (
        <div role="img" aria-label={alt} className={clsx("light-study absolute inset-0", `light-study--${tone}`)}>
          {!quiet && (
            <span className="absolute bottom-3 left-3 right-3 truncate font-mono text-[11px] tracking-tight opacity-70">
              {shot}.jpg
            </span>
          )}
        </div>
      )}
    </div>
  );
}
