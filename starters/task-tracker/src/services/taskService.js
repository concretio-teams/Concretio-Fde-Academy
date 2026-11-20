import { notifyAssigned } from '../notify.js';
import { loadAll, saveAll } from '../storage/fileStore.js';
import { validateNewTask, validatePatch } from '../validate.js';

export class ValidationError extends Error {
  constructor(errors) { super(errors.join('; ')); this.errors = errors; }
}

export function listTasks({ status, assignee } = {}) {
  return loadAll().filter((t) => (!status || t.status === status) && (!assignee || t.assignee === assignee));
}

export function getTask(id) {
  return loadAll().find((t) => t.id === id) ?? null;
}

export function createTask(input) {
  const errors = validateNewTask(input);
  if (errors.length) throw new ValidationError(errors);
  const tasks = loadAll();
  const task = {
    id: tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1,
    title: input.title.trim(),
    status: 'todo',
    assignee: input.assignee ?? null,
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  saveAll(tasks);
  if (task.assignee) notifyAssigned(task);
  return task;
}

export function updateTask(id, patch) {
  const errors = validatePatch(patch);
  if (errors.length) throw new ValidationError(errors);
  const tasks = loadAll();
  const task = tasks.find((t) => t.id === id);
  if (!task) return null;
  const reassigned = patch.assignee !== undefined && patch.assignee !== task.assignee;
  Object.assign(task, patch);
  saveAll(tasks);
  if (reassigned && task.assignee) notifyAssigned(task);
  return task;
}

export function deleteTask(id) {
  const tasks = loadAll();
  const next = tasks.filter((t) => t.id !== id);
  if (next.length === tasks.length) return false;
  saveAll(next);
  return true;
}
