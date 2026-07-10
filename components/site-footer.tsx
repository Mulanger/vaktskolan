import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <div>
          <Link className="brand brand--light" href="/">
            vaktskolan<span>.</span>
          </Link>
          <p>Fristående provträning och källstödda guider för VU1 och VU2.</p>
        </div>
        <nav aria-label="Sidfotsnavigation">
          <div>
            <strong>Studera</strong>
            <Link href="/vaktarprov">Väktarprovet</Link>
            <Link href="/vaktarutbildning/vu1">VU1</Link>
            <Link href="/vaktarutbildning/vu2">VU2</Link>
            <Link href="/studieteknik">Studieteknik</Link>
          </div>
          <div>
            <strong>Om Vaktskolan</strong>
            <Link href="/om-vaktskolan">Om oss</Link>
            <Link href="/redaktionell-policy">Redaktionell policy</Link>
            <Link href="/kontakt">Kontakt</Link>
          </div>
          <div>
            <strong>Juridiskt</strong>
            <Link href="/integritet">Integritet</Link>
            <Link href="/anvandarvillkor">Användarvillkor</Link>
          </div>
        </nav>
      </div>
      <div className="site-footer__bottom">
        <span>© {new Date().getFullYear()} Vaktskolan</span>
        <span>Inte associerad med Polismyndigheten, BYA eller en officiell provutfärdare.</span>
      </div>
    </footer>
  );
}
