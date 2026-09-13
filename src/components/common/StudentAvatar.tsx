import Image from "next/image";

interface StudentAvatarProps {
  avatarUrl: string;
  alt: string;
  size?: number;
  className?: string;
}

export function StudentAvatar({
  avatarUrl,
  alt,
  size = 64,
  className = "",
}: StudentAvatarProps) {
  if (avatarUrl.startsWith("/")) {
    return (
      <Image
        src={avatarUrl}
        alt={alt}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className={`shrink-0 rounded-2xl object-cover ${className}`}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={alt}
      className={`inline-flex shrink-0 items-center justify-center leading-none ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.72) }}
    >
      {avatarUrl}
    </span>
  );
}
