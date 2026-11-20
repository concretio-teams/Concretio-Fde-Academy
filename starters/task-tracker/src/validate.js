export const STATUSES = ['todo', 'doing', 'done'];

export function validateNewTask(input) {
  const errors = [];
  if (typeof input.title !== 'string' || input.title.trim() === '') errors.push('title is required');
  if (input.title && input.title.length > 120) errors.push('title must be 120 characters or fewer');
  if (input.assignee !== undefined && typeof input.assignee !== 'string') errors.push('assignee must be text');
  return errors;
}

export function validatePatch(input) {
  const errors = [];
  if (input.status !== undefined && !STATUSES.includes(input.status)) errors.push(`status must be one of ${STATUSES.join(', ')}`);
  if (input.title !== undefined && (typeof input.title !== 'string' || input.title.trim() === '')) errors.push('title cannot be empty');
  if (input.assignee !== undefined && input.assignee !== null && typeof input.assignee !== 'string') errors.push('assignee must be text or null');
  return errors;
}
