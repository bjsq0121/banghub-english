import { FormEvent, useState } from "react";
import { updatePreferences } from "../../lib/api";

export function DifficultyPage() {
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const difficulty = String(form.get("difficulty")) as "intro" | "basic" | "intermediate";

    await updatePreferences({
      difficulty,
      selectedTracks: ["conversation", "news"]
    });

    setMessage("Preferences saved.");
  }

  return (
    <main className="page">
      <h1>Select your level</h1>
      <form onSubmit={handleSubmit}>
        <label><input type="radio" name="difficulty" value="intro" defaultChecked /> Intro</label>
        <label><input type="radio" name="difficulty" value="basic" /> Basic</label>
        <label><input type="radio" name="difficulty" value="intermediate" /> Intermediate</label>
        <button type="submit">Save</button>
      </form>
      {message ? <p>{message}</p> : null}
    </main>
  );
}
