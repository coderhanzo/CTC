type MaterialIconProps = {
  children: string;
  className?: string;
  fill?: boolean;
};

export function MaterialIcon({
  children,
  className,
  fill = false,
}: MaterialIconProps) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined ${className ?? ""}`}
      style={{ fontVariationSettings: `'FILL' ${fill ? 1 : 0}` }}
    >
      {children}
    </span>
  );
}
