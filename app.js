
let config = null;
let editingId = null;

const form = document.getElementById('task-form');
const titleInput = document.getElementById('task-title');
const descInput = document.getElementById('task-description');
const submitBtn = document.getElementById('task-submit');
const cancelBtn = document.getElementById('task-cancel');
const formHeading = document.getElementById('form-heading');
const taskList = document.getElementById('task-list');
const statusEl = document.getElementById('status-message');

function showStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.className = isError ? 'error' : 'success';
}

function apiUrl(query = '') {
  return `${config.supabaseUrl}/rest/v1/${config.tableName}${query}`;
}

async function api(method, query = '', body = null) {
  const headers = {
    apikey: config.supabasePublishableKey,
    Authorization: `Bearer ${config.supabasePublishableKey}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation'
  };
  const response = await fetch(apiUrl(query), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  if (!response.ok) {
    let detail = response.statusText;
    try {
      const err = await response.json();
      detail = err.message || detail;
    } catch (_) { /* no JSON body */ }
    throw new Error(`${method} failed (${response.status}): ${detail}`);
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

const getAllTasks = () => api('GET', '?select=*&order=id.asc');
const getTask = (id) => api('GET', `?id=eq.${id}&select=*`);
const createTask = (task) => api('POST', '', task);
const updateTask = (id, fields) => api('PATCH', `?id=eq.${id}`, fields);
const deleteTask = (id) => api('DELETE', `?id=eq.${id}`);

function renderTasks(tasks) {
  taskList.innerHTML = '';
  if (tasks.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'No tasks yet. Add one above.';
    taskList.appendChild(empty);
    return;
  }

  for (const task of tasks) {
    const item = document.createElement('div');
    item.className = 'task-item' + (task.completed ? ' done' : '');
    item.dataset.id = task.id;

    const title = document.createElement('h3');
    title.className = 'task-title';
    title.textContent = task.title;

    const desc = document.createElement('p');
    desc.className = 'task-description';
    desc.textContent = task.description || '';

    const status = document.createElement('span');
    status.className = 'task-status';
    status.textContent = task.completed ? 'Completed' : 'Incomplete';

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'toggle-task';
    toggleBtn.textContent = task.completed ? 'Mark incomplete' : 'Mark complete';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'edit-task';
    editBtn.textContent = 'Edit';

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-task';
    deleteBtn.textContent = 'Delete';

    actions.append(toggleBtn, editBtn, deleteBtn);
    item.append(title, desc, status, actions);
    taskList.appendChild(item);
  }
}

async function loadTasks() {
  try {
    const tasks = await getAllTasks();
    renderTasks(tasks);
  } catch (err) {
    showStatus(`Could not load tasks. ${err.message}`, true);
  }
}

function startEditing(task) {
  editingId = task.id;
  titleInput.value = task.title;
  descInput.value = task.description || '';
  submitBtn.textContent = 'Save changes';
  formHeading.textContent = 'Edit task';
  cancelBtn.hidden = false;
  titleInput.focus();
}

function resetForm() {
  editingId = null;
  form.reset();
  submitBtn.textContent = 'Add task';
  formHeading.textContent = 'Add a task';
  cancelBtn.hidden = true;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  const description = descInput.value.trim();
  if (!title) {
    showStatus('Title is required.', true);
    return;
  }

  submitBtn.disabled = true;
  try {
    if (editingId === null) {
      await createTask({ title, description, completed: false });
      showStatus('Task added.');
    } else {
      await updateTask(editingId, { title, description });
      showStatus('Task updated.');
    }
    resetForm();
    await loadTasks();
  } catch (err) {
    showStatus(`Could not save the task. ${err.message}`, true);
  } finally {
    submitBtn.disabled = false;
  }
});

cancelBtn.addEventListener('click', resetForm);

taskList.addEventListener('click', async (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const item = button.closest('.task-item');
  const id = Number(item.dataset.id);

  try {
    if (button.classList.contains('edit-task')) {
      const [task] = await getTask(id);
      if (!task) throw new Error('Task not found.');
      startEditing(task);
    } else if (button.classList.contains('toggle-task')) {
      const completed = !item.classList.contains('done');
      await updateTask(id, { completed });
      showStatus(completed ? 'Task marked as completed.' : 'Task marked as incomplete.');
      await loadTasks();
    } else if (button.classList.contains('delete-task')) {
      if (!confirm('Delete this task?')) return;
      await deleteTask(id);
      if (editingId === id) resetForm();
      showStatus('Task deleted.');
      await loadTasks();
    }
  } catch (err) {
    showStatus(`Operation failed. ${err.message}`, true);
  }
});

async function init() {
  try {
    const response = await fetch('config.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`config.json not found (${response.status})`);
    config = await response.json();
    if (!config.supabaseUrl || !config.supabasePublishableKey || !config.tableName) {
      throw new Error('config.json is missing a required field.');
    }
    config.supabaseUrl = config.supabaseUrl.replace(/\/+$/, '');
  } catch (err) {
    showStatus(`Configuration error: ${err.message}`, true);
    return;
  }
  await loadTasks();
}

init();
