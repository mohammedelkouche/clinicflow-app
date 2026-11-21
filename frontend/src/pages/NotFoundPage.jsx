import { Link } from "react-router-dom";

import { primaryButton } from "../styles/ui.js";

function NotFoundPage() {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm sm:px-12 sm:py-24">
      <div
        className="absolute -top-24 left-1/2 -z-10 size-72 -translate-x-1/2 rounded-full bg-clinic-100/70 blur-3xl"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-xl">
        <p className="mb-3 text-sm font-extrabold tracking-[0.16em] text-clinic-600 uppercase">
          Error 404
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-6xl">
          Page not found
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-7 text-muted sm:text-lg">
          The page you requested does not exist or may have moved. Check the
          address or return to your clinic dashboard.
        </p>
        <Link className={`${primaryButton} mt-8 no-underline`} to="/">
          Return to dashboard
        </Link>
      </div>
    </section>
  );
}

export default NotFoundPage;
