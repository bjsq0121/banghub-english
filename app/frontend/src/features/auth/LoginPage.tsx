import { FormEvent, useState } from "react";
import { login } from "../../lib/api";

export function LoginPage() {
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    try {
      const result = await login(String(form.get("email")), String(form.get("password")));
      setMessage(result.user ? "Logged in." : "Login failed.");
    } catch {
      setMessage("Login failed.");
    }
  }

  return (
    <main className="page">
      <h1>Log in</h1>
      <form onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="Email" />
        <input name="password" type="password" placeholder="Password" />
        <button type="submit">Log in</button>
      </form>
      {message ? <p>{message}</p> : null}
    </main>
  );
}
