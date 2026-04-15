export function SiteLogo({
  alt = "BilliardOne logo",
  className = "",
  decorative = false,
  imageClassName = "",
}) {
  const wrapperClassName = ["inline-flex overflow-hidden shrink-0", className]
    .filter(Boolean)
    .join(" ");
  const logoClassName = ["h-full w-full object-cover", imageClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={wrapperClassName}>
      <img
        src="/img-home/logo.png"
        alt={decorative ? "" : alt}
        aria-hidden={decorative ? "true" : undefined}
        className={logoClassName}
      />
    </span>
  );
}
