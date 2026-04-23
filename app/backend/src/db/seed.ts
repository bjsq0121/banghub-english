import { randomUUID } from "node:crypto";
import { db } from "./client";
import { getConfig } from "../config";

const config = getConfig();

db.reset();
db.write((state) => {
  state.users.push({
    id: randomUUID(),
    email: config.adminEmail,
    password: config.adminPassword,
    difficulty: "basic",
    selected_tracks: JSON.stringify(["conversation", "news"]),
    is_admin: 1
  });
});
