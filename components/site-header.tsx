import Link from "next/link";
import { PRIMARY_NAVIGATION } from "@/lib/site";
import { MobileMenu } from "@/components/mobile-menu";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="brand" href="/" aria-label="Vaktskolan, startsida">
          vaktskolan<span>.</span>
        </Link>

        <nav className="desktop-nav" aria-label="Huvudnavigation">
          {PRIMARY_NAVIGATION.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <Link className="login-link" href="/login?mode=sign-in&redirect_url=/plattform">
            Logga in
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
