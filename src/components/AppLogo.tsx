import Image from "next/image";

export function AppLogo({ showText = true, iconSize = 48 }: { showText?: boolean; iconSize?: number }) {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/creator-hive-logo.svg"
        alt="Creator Hive"
        width={iconSize}
        height={iconSize}
        priority
        className="rounded-2xl"
      />
      {showText && (
        <span className="text-sm font-semibold tracking-tight text-neutral-100">
          Creator Hive
        </span>
      )}
    </div>
  );
}

