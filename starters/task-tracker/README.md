# Task tracker starter

A small task tracker API with several layers: routes, a service, validation, file storage and notifications.
No dependencies. Needs Node 18 or newer.

It is the sample project for the **Module 3 assignment**: explore a codebase you have not seen, then plan a feature without editing any file.

## Run it

```
npm test        # six tests, all pass today
npm start       # API on http://localhost:3000
```

Try the API:

```
curl -X POST localhost:3000/tasks -d '{"title":"Write the report","assignee":"sam"}'
curl localhost:3000/tasks
curl "localhost:3000/tasks?status=todo"
curl -X PATCH localhost:3000/tasks/1 -d '{"status":"done"}'
```

## Files

- `src/server.js` starts the HTTP server
- `src/routes/tasks.js` the `/tasks` routes
- `src/services/taskService.js` the business rules
- `src/validate.js` input checks
- `src/storage/fileStore.js` saves tasks to `data/tasks.json`
- `src/notify.js` a stand-in for sending notifications
- `test/` the tests

## The feature to plan (Module 3 assignment)

> Our team wants **due dates**. A task can have an optional due date, tasks can be listed by "overdue", and the person it is assigned to should be notified the day before it is due.

Do **not** build it. Use Claude Code in Plan Mode to understand this project, then produce a plan: which files change, in what order, what could go wrong, and how you would check each step.
