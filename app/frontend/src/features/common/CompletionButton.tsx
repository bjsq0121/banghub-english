import { useState } from "react";
import type { UserProfile } from "@banghub/shared";

type CompletionButtonProps = {
  viewer: UserProfile | null;
  onComplete: () => Promise<void> | void;
};

export function CompletionButton({ viewer, onComplete }: CompletionButtonProps) {
  const [message, setMessage] = useState("");

  return (
    <div>
      <button
        onClick={async () => {
          if (!viewer) {
            setMessage("Log in to save your progress.");
            return;
          }

          await onComplete();
          setMessage("Saved.");
        }}
      >
        Mark complete
      </button>
      {message ? <p>{message}</p> : null}
    </div>
  );
}
