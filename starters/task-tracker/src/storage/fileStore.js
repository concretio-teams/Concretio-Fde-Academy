import fs from 'node:fs';
import path from 'node:path';

// Tasks live in one JSON file. The path can be changed with the TASKS_FILE environment variable.
const file = () => process.env.TASKS_FILE ?? path.join(process.cwd(), 'data', 'tasks.json');

export function loadAll() {
  try {
    return JSON.parse(fs.readFileSync(file(), 'utf8'));
  } catch {
    return [];
  }
}

export function saveAll(tasks) {
  fs.mkdirSync(path.dirname(file()), { recursive: true });
  fs.writeFileSync(file(), JSON.stringify(tasks, null, 2));
}
