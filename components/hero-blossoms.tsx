import Image from "next/image";

/** Decorative generated flowers; the original logo and product are preserved. */
export function HeroBlossoms() {
  return (
    <Image
      className="hero-blossoms"
      src="/massseur/cherry-blossoms.png"
      alt=""
      width={1254}
      height={1254}
      sizes="(max-width: 640px) 180px, 330px"
      aria-hidden="true"
    />
  );
}
