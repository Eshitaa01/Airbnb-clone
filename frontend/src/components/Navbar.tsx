"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Globe, Heart, Home as HomeIcon } from "lucide-react";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";

export default function Navbar() {
  const { user, allUsers, isHostMode, setIsHostMode, switchUser, becomeHost, loading } = useUser();
  const { show } = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const showFullSearch = pathname === "/";

  async function handleHostToggle() {
    if (!user?.is_host) {
      await becomeHost();
      show("You're now a host! Manage listings from your dashboard.");
    }
    const next = !isHostMode;
    setIsHostMode(next);
    router.push(next ? "/host" : "/");
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-line shadow-nav">
      <div className="max-w-[1760px] mx-auto px-4 sm:px-8 py-3 flex items-center gap-4">
        <Logo />

        <div className="flex-1 hidden md:block">
          <SearchBar compact={!showFullSearch} />
        </div>

        <div className="flex items-center gap-2 ml-auto shrink-0">
          <button
            onClick={handleHostToggle}
            className="hidden lg:block px-3 py-2 rounded-full hover:bg-neutral-100 text-sm font-semibold whitespace-nowrap"
          >
            {isHostMode ? "Switch to traveling" : "Airhome your home"}
          </button>
          <button className="p-2.5 rounded-full hover:bg-neutral-100 hidden sm:block" aria-label="Language">
            <Globe size={16} />
          </button>
          {!isHostMode && (
            <Link href="/wishlist" className="p-2.5 rounded-full hover:bg-neutral-100 hidden sm:block" aria-label="Wishlist">
              <Heart size={16} />
            </Link>
          )}

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 border border-line rounded-full pl-3 pr-1 py-1 hover:shadow-pop transition-shadow"
            >
              <Menu size={15} />
              {user && !loading ? (
                <img src={user.avatar_url} alt={user.name} className="w-7 h-7 rounded-full object-cover bg-charcoal" />
              ) : (
                <span className="w-7 h-7 rounded-full bg-charcoal" />
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-card border border-line py-2 animate-slide-up">
                {user && (
                  <div className="px-4 py-3 border-b border-line flex items-center gap-3">
                    <img src={user.avatar_url} className="w-10 h-10 rounded-full object-cover" alt={user.name} />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{user.name}</p>
                      <p className="text-hint text-xs truncate">{user.email}</p>
                    </div>
                  </div>
                )}

                <MenuLink href="/trips" label="My trips" onClick={() => setMenuOpen(false)} />
                <MenuLink href="/wishlist" label="Wishlist" onClick={() => setMenuOpen(false)} />
                {user?.is_host ? (
                  <MenuLink href="/host" label="Host dashboard" onClick={() => setMenuOpen(false)} />
                ) : (
                  <button
                    onClick={async () => {
                      await becomeHost();
                      show("You're now a host!");
                      setMenuOpen(false);
                      router.push("/host");
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-neutral-100 text-sm flex items-center gap-2"
                  >
                    <HomeIcon size={15} /> Become a host
                  </button>
                )}

                <div className="border-t border-line my-2" />
                <p className="px-4 pt-1 pb-2 text-xs font-semibold text-hint uppercase tracking-wide">
                  Switch account (demo)
                </p>
                <div className="max-h-56 overflow-y-auto">
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={async () => {
                        await switchUser(u.id);
                        setMenuOpen(false);
                        show(`Switched to ${u.name}`, "info");
                        router.push("/");
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-neutral-100 text-sm ${
                        user?.id === u.id ? "bg-neutral-50 font-semibold" : ""
                      }`}
                    >
                      <img src={u.avatar_url} className="w-6 h-6 rounded-full object-cover" alt={u.name} />
                      <span className="truncate">{u.name}</span>
                      {u.is_host && <span className="ml-auto text-[10px] text-hint">HOST</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="md:hidden px-4 pb-3">
        <SearchBar compact />
      </div>
    </header>
  );
}

function MenuLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="block px-4 py-2.5 hover:bg-neutral-100 text-sm">
      {label}
    </Link>
  );
}
