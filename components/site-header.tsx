import Link from "next/link";
import { PRIMARY_NAVIGATION } from "@/lib/site";

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
          <Link className="login-link" href="/login">
            Logga in
          </Link>
          <details className="mobile-menu">
            <summary aria-label="Öppna meny">
              <span />
              <span />
              <span />
            </summary>
            <nav aria-label="Mobilnavigation">
              {PRIMARY_NAVIGATION.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
              <Link href="/login">Logga in</Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
