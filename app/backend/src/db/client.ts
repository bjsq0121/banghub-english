import fs from "node:fs";
import path from "node:path";
import { getConfig } from "../config";

export type DbUserRow = {
  id: string;
  email: string;
  password: string;
  difficulty: string;
  selected_tracks: string;
  is_admin: number;
};

export type DbContentRow = {
  id: string;
  track: "conversation" | "news";
  difficulty: string;
  title: string;
  payload_json: string;
  publish_status: string;
  is_today: number;
};

export type DbCompletionRow = {
  user_id: string;
  content_id: string;
  completed_on: string;
};

type DbState = {
  users: DbUserRow[];
  content_items: DbContentRow[];
  completions: DbCompletionRow[];
};

const config = getConfig();
const dbPath = path.resolve(config.sqlitePath.replace(/\.sqlite$/, ".json"));
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

function createEmptyState(): DbState {
  return {
    users: [],
    content_items: [],
    completions: []
  };
}

function loadState(): DbState {
  if (!fs.existsSync(dbPath)) {
    const emptyState = createEmptyState();
    fs.writeFileSync(dbPath, JSON.stringify(emptyState, null, 2));
    return emptyState;
  }

  return JSON.parse(fs.readFileSync(dbPath, "utf8")) as DbState;
}

function saveState(state: DbState) {
  fs.writeFileSync(dbPath, JSON.stringify(state, null, 2));
}

export const db = {
  reset() {
    saveState(createEmptyState());
  },
  read() {
    return loadState();
  },
  write(mutator: (state: DbState) => void) {
    const state = loadState();
    mutator(state);
    saveState(state);
  }
};
