// Stand-in for a real notification system. A production version would send an email or chat message.
export const sent = [];

export function notifyAssigned(task) {
  const message = `Task "${task.title}" was assigned to ${task.assignee}`;
  sent.push(message);
  if (process.env.NODE_ENV !== 'test') console.log('[notify]', message);
}
