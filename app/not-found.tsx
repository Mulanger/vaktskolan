import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="not-found">
      <p className="eyebrow">404</p>
      <h1>Sidan finns inte.</h1>
      <p>Adressen kan vara fel eller så har innehållet flyttats.</p>
      <Link className="button button--primary" href="/">Till startsidan</Link>
    </main>
  );
}
