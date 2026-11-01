# Vistula Task Manager

A simple Task Manager built with HTML, CSS and JavaScript. Tasks are stored in a Supabase (PostgreSQL) database and accessed through the Supabase auto-generated REST API. The site is hosted on GitHub Pages.

- **Student ID:** 72346
- **Repository:** https://github.com/vistula-team-project-72346/vistula-task-manager
- **Live application:** https://vistula-team-project-72346.github.io/vistula-task-manager/

## Features

- Display all tasks from the database
- Add, edit and delete tasks
- Mark tasks as completed or incomplete
- All changes persist after refreshing the page
- Status and error messages for every operation

## Technologies

HTML, CSS, JavaScript (`fetch()`), Supabase REST API, Git, GitHub Pages.

## REST API endpoints used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/rest/v1/tasks?select=*` | Get all tasks |
| GET | `/rest/v1/tasks?id=eq.{id}&select=*` | Get one task |
| POST | `/rest/v1/tasks` | Create a task |
| PATCH | `/rest/v1/tasks?id=eq.{id}` | Update a task |
| DELETE | `/rest/v1/tasks?id=eq.{id}` | Delete a task |

## Files

- `index.html` – main page
- `app.js` – application logic
- `style.css` – styling
- `config.json` – public Supabase configuration (publishable key only)
- `setup.sql` – SQL used to create the `tasks` table and RLS policies
- `contribution.html`, `contribution.json` – added by my project partner via Pull Request

## Security note

Only the public Supabase publishable key is included. No secret keys, service role keys or database passwords are stored in this repository. The database contains demonstration data only.
