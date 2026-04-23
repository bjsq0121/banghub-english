import { randomUUID } from "node:crypto";
import { db } from "./client";
import { getConfig } from "../config";
import { hashPassword } from "../modules/auth/auth.service";

const config = getConfig();

db.reset();
db.write((state) => {
  state.users.push({
    id: randomUUID(),
    email: config.adminEmail,
    password: hashPassword(config.adminPassword),
    difficulty: "basic",
    selected_tracks: JSON.stringify(["conversation", "news"]),
    is_admin: 1
  });
});
