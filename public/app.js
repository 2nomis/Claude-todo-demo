const API = '/api/todos';
const FILTERS = ['all', 'open', 'done'];

const form = document.getElementById('new-todo');
const input = document.getElementById('new-title');
const list = document.getElementById('list');
const empty = document.getElementById('empty');
const count = document.getElementById('count');
const errorBox = document.getElementById('error');
const template = document.getElementById('item-template');

let todos = [];

function currentFilter() {
  const name = location.hash.replace('#/', '');
  return FILTERS.includes(name) ? name : 'all';
}

async function request(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Fehler ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = !message;
}

// Runs an API action, then reloads the list; errors end up in the alert box.
// On failure the list is re-rendered from the last known state, so controls
// like a clicked checkbox don't keep showing a change the server rejected.
async function run(action) {
  try {
    showError('');
    await action();
    await load();
  } catch (err) {
    showError(err.message);
    render();
  }
}

async function load() {
  todos = await request('GET', API);
  render();
}

// Remembers which control inside the list has keyboard focus, so render()
// can put it back after rebuilding the list.
function focusedControl() {
  const el = document.activeElement;
  const item = el && el.closest('.item');
  if (!item || !list.contains(item)) return null;
  const control = el.classList.contains('edit-field') ? 'edit' : el.classList[0];
  return { id: item.dataset.id, index: [...list.children].indexOf(item), control };
}

// Same todo if it is still visible, otherwise the one now at its position
// (or the last one); with an empty list, the new-todo input.
function restoreFocus(focus) {
  if (!focus) return;
  const items = [...list.children];
  const target = items.find((item) => item.dataset.id === focus.id)
    ?? items[Math.min(focus.index, items.length - 1)];
  if (!target) {
    input.focus();
    return;
  }
  (target.querySelector(`.${focus.control}`) ?? target.querySelector('.toggle')).focus();
}

function render() {
  const focus = focusedControl();
  const filter = currentFilter();
  const visible = todos.filter((t) => filter === 'all' || (filter === 'done') === t.done);

  for (const link of document.querySelectorAll('.filters a')) {
    const active = link.dataset.filter === filter;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }

  list.replaceChildren(...visible.map(renderItem));
  empty.hidden = visible.length > 0;
  restoreFocus(focus);

  const open = todos.filter((t) => !t.done).length;
  count.textContent = open === 1 ? '1 offen' : `${open} offen`;
}

function renderItem(todo) {
  const item = template.content.firstElementChild.cloneNode(true);
  const toggle = item.querySelector('.toggle');
  const title = item.querySelector('.title');

  item.dataset.id = String(todo.id);
  item.classList.toggle('done', todo.done);
  toggle.checked = todo.done;
  toggle.setAttribute('aria-label', `„${todo.title}“ erledigt`);
  item.querySelector('.edit').setAttribute('aria-label', `„${todo.title}“ bearbeiten`);
  item.querySelector('.delete').setAttribute('aria-label', `„${todo.title}“ löschen`);
  title.textContent = todo.title;

  toggle.addEventListener('change', () =>
    run(() => request('PATCH', `${API}/${todo.id}`, { done: toggle.checked })));
  item.querySelector('.delete').addEventListener('click', () =>
    run(() => request('DELETE', `${API}/${todo.id}`)));
  item.querySelector('.edit').addEventListener('click', () => startEdit(item, todo));
  title.addEventListener('dblclick', () => startEdit(item, todo));

  return item;
}

function startEdit(item, todo) {
  const field = document.createElement('input');
  field.type = 'text';
  field.className = 'edit-field';
  field.maxLength = 200;
  field.value = todo.title;
  field.setAttribute('aria-label', 'Titel bearbeiten');

  // `busy` blocks double saves (Enter followed by blur); after a failed save
  // the field stays open so the user can retry with Enter or cancel with Esc.
  let busy = false;
  const finish = async (save, { refocus = false } = {}) => {
    if (busy) return;
    const title = field.value.trim();
    if (!save || !title || title === todo.title) {
      busy = true;
      showError('');
      render();
      return;
    }

    busy = true;
    try {
      showError('');
      await request('PATCH', `${API}/${todo.id}`, { title });
      await load();
    } catch (err) {
      showError(err.message);
      busy = false;
      if (refocus && field.isConnected) field.focus();
    }
  };

  field.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') finish(true, { refocus: true });
    if (event.key === 'Escape') finish(false);
  });
  field.addEventListener('blur', () => {
    if (!busy) finish(true);
  });

  item.querySelector('.title').replaceWith(field);
  field.focus();
  field.select();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = input.value.trim();
  if (!title) return;
  run(async () => {
    await request('POST', API, { title });
    input.value = '';
  });
});

window.addEventListener('hashchange', render);

load().catch((err) => showError(err.message));
