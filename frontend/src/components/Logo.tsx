import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0">
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M16 2C17.4 2 18.6 2.9 19.4 4.6C21.6 9.2 27.6 20.4 27.6 24.4C27.6 28.9 24.1 32 20.4 32C18.4 32 16.7 31.1 16 29.5C15.3 31.1 13.6 32 11.6 32C7.9 32 4.4 28.9 4.4 24.4C4.4 20.4 10.4 9.2 12.6 4.6C13.4 2.9 14.6 2 16 2Z"
          fill="#FF385C"
        />
      </svg>
      <span className="font-display font-extrabold text-xl text-rausch tracking-tight hidden sm:block">
        airhome
      </span>
    </Link>
  );
}
