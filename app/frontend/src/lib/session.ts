import { createContext, useContext } from "react";
import type { UserProfile } from "@banghub/shared";

export const SessionContext = createContext<UserProfile | null>(null);

export function useSession() {
  return useContext(SessionContext);
}
