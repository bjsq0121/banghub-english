import { Link, useRouteError } from "react-router-dom";

export function ErrorPage() {
  const error = useRouteError() as { message?: string; statusText?: string } | undefined;
  const message = error?.message ?? error?.statusText ?? "Something went wrong.";

  return (
    <main className="page">
      <h1>Page unavailable</h1>
      <p>{message}</p>
      <Link to="/">Back to home</Link>
    </main>
  );
}
