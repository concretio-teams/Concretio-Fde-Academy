import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

process.env.NODE_ENV = 'test';
const { createTask, deleteTask, listTasks, updateTask, ValidationError } = await import('../src/services/taskService.js');
const { sent } = await import('../src/notify.js');

beforeEach(() => {
  process.env.TASKS_FILE = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'tasks-')), 'tasks.json');
  sent.length = 0;
});

test('a new task starts as todo', () => {
  const task = createTask({ title: 'Write the report' });
  assert.equal(task.status, 'todo');
  assert.equal(listTasks().length, 1);
});

test('a title is required', () => {
  assert.throws(() => createTask({ title: '  ' }), ValidationError);
});

test('assigning a task sends a notification', () => {
  createTask({ title: 'Review PR', assignee: 'sam' });
  assert.equal(sent.length, 1);
});

test('status can be changed and filtered', () => {
  const task = createTask({ title: 'Fix login' });
  updateTask(task.id, { status: 'done' });
  assert.equal(listTasks({ status: 'done' }).length, 1);
  assert.equal(listTasks({ status: 'todo' }).length, 0);
});

test('an invalid status is rejected', () => {
  const task = createTask({ title: 'Fix login' });
  assert.throws(() => updateTask(task.id, { status: 'finished' }), ValidationError);
});

test('deleting removes the task', () => {
  const task = createTask({ title: 'Old task' });
  assert.equal(deleteTask(task.id), true);
  assert.equal(listTasks().length, 0);
});
