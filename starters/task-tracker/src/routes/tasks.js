import { readJson, send } from '../http.js';
import { createTask, deleteTask, getTask, listTasks, updateTask, ValidationError } from '../services/taskService.js';

// Handles /tasks and /tasks/:id. Returns false when the path is not ours.
export async function handleTasks(req, res, url) {
  const match = url.pathname.match(/^\/tasks(?:\/(\d+))?$/);
  if (!match) return false;
  const id = match[1] ? Number(match[1]) : null;
  try {
    if (!id && req.method === 'GET') {
      send(res, 200, listTasks({ status: url.searchParams.get('status') ?? undefined, assignee: url.searchParams.get('assignee') ?? undefined }));
    } else if (!id && req.method === 'POST') {
      send(res, 201, createTask(await readJson(req)));
    } else if (id && req.method === 'GET') {
      const task = getTask(id);
      task ? send(res, 200, task) : send(res, 404, { error: 'Task not found' });
    } else if (id && req.method === 'PATCH') {
      const task = updateTask(id, await readJson(req));
      task ? send(res, 200, task) : send(res, 404, { error: 'Task not found' });
    } else if (id && req.method === 'DELETE') {
      deleteTask(id) ? send(res, 204, {}) : send(res, 404, { error: 'Task not found' });
    } else {
      send(res, 405, { error: 'Method not allowed' });
    }
  } catch (err) {
    if (err instanceof ValidationError) send(res, 400, { errors: err.errors });
    else send(res, 400, { error: err.message });
  }
  return true;
}
