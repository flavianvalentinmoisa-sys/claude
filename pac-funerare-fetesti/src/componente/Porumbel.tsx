/** Porumbel stilizat, mic și discret (decorativ). */
export default function Porumbel({ className = "h-8 w-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 44"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* corpul și coada */}
      <path d="M3 30.5 13 27c5-1.6 10-1 15 .2 5.4 1.3 11 .6 15.4-3.2 2.4-2 4.6-3.6 7.6-3.4 2.2.1 3.7 1.1 4.6 2.5L61 24l-5 1.6c-1.4 5.8-7 10.8-15.3 12-8.2 1.2-15.4-1-21.3-3.3-4.8-1.8-10-2.6-16.4-3.8Z" />
      {/* aripa din față, ridicată */}
      <path d="M24 27.6C22.4 19.5 18.6 11 11.5 3.5c10 1.8 19.8 9.2 24.3 21" />
      {/* aripa din spate */}
      <path d="M31 25.5c2.3-7.4 7.8-14.2 17.5-18.3-3.7 5.2-6.1 10.8-7 16.8" />
      {/* ochiul */}
      <circle cx="53.6" cy="22.6" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}
