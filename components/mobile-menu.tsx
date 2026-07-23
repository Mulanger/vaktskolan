"use client";

import Link from "next/link";
import { useRef } from "react";
import { PRIMARY_NAVIGATION } from "@/lib/site";

export function MobileMenu() {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  function closeMenu() {
    detailsRef.current?.removeAttribute("open");
  }

  return (
    <details className="mobile-menu" ref={detailsRef}>
      <summary aria-label="Öppna meny">
        <span />
        <span />
        <span />
      </summary>
      <nav aria-label="Mobilnavigation">
        {PRIMARY_NAVIGATION.map((item) => (
          <Link key={item.href} href={item.href} onClick={closeMenu}>
            {item.label}
          </Link>
        ))}
        <Link href="/login?mode=sign-in&redirect_url=/plattform" onClick={closeMenu}>
          Logga in
        </Link>
      </nav>
    </details>
  );
}
