/* Yellow bee mark. */
export default function Bee({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <ellipse cx="24" cy="28" rx="13" ry="14" fill="#FFCC00" stroke="#1A1606" strokeWidth="2.5" />
      <path d="M13 24h22M13 31h22M16 38h16" stroke="#1A1606" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="14" cy="16" rx="8" ry="5" fill="#fff" stroke="#1A1606" strokeWidth="2" transform="rotate(-28 14 16)" />
      <ellipse cx="34" cy="16" rx="8" ry="5" fill="#fff" stroke="#1A1606" strokeWidth="2" transform="rotate(28 34 16)" />
      <circle cx="24" cy="15" r="6" fill="#1A1606" />
      <path d="M21 9l-2-3M27 9l2-3" stroke="#1A1606" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
