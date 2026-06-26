const SECTION_COLORS = {
  log:      '#39ff14',
  music:    '#ff2d7a',
  thoughts: '#d4d0b8',
  films:    '#00f5ff',
  books:    '#ffa020'
};

// infinite scroll state
let _data    = [];
let _name    = '';
let _offset  = 0;
let _loading = false;
const PAGE   = 5;


let _lastSection = '';

async function openSection(name) {
  _lastSection = name;
  const res  = await fetch(`./data/${name}.json`);
  const data = await res.json();
  showModal(name, data);
}

function showModal(name, data) {
  _data    = data.slice().reverse();
  _name    = name;
  _offset  = 0;
  _loading = false;

  const screen = document.getElementById('pip-screen');
  screen.style.setProperty('--accent', SECTION_COLORS[name]);
  document.getElementById('pip-title').textContent = `> ${name.toUpperCase()}_`;
  document.getElementById('pip-body').innerHTML = '';

  loadMore();
  document.getElementById('pip-overlay').classList.add('open');
}

function loadMore() {
  const body  = document.getElementById('pip-body');
  const batch = _data.slice(_offset, _offset + PAGE);
  if (!batch.length) return;

  batch.forEach(e => {
    body.insertAdjacentHTML('beforeend', renderEntry(_name, e));
  });
  _offset += PAGE;

  if (_offset >= _data.length) {
    body.insertAdjacentHTML('beforeend',
      '<div class="pip-end">// end of log_</div>'
    );
  }
}

// scroll listener — fires once at page load, stays attached
document.getElementById('pip-body').addEventListener('scroll', function () {
  if (_loading || _offset >= _data.length) return;
  const nearBottom = this.scrollTop + this.clientHeight >= this.scrollHeight - 80;
  if (!nearBottom) return;

  _loading = true;
  this.insertAdjacentHTML('beforeend',
    '<div id="pip-loader">// loading_<span class="blink">▌</span></div>'
  );

  setTimeout(() => {
    document.getElementById('pip-loader')?.remove();
    loadMore();
    _loading = false;
  }, 500); // pip-boy style delay
});

function renderEntry(name, e) {
 if (name === 'log') return `
    <div class="pip-entry">
      <div class="pip-entry-date">${e.date}</div>
      <div class="pip-entry-title">${e.title}</div>
      ${e.from1001 ? `<div class="pip-entry-field">🎵 ${e.from1001}</div>` : ''}
      ${e.drinks   ? `<div class="pip-entry-field">🥃 ${e.drinks}</div>`   : ''}
      ${e.smoke    ? `<div class="pip-entry-field">🌿 ${e.smoke}</div>`    : ''}
      ${e.content  ? `<div class="pip-entry-content">${e.content}</div>`   : ''}
    </div>`;

 if (name === 'music') return `
  <div class="pip-entry">
    <div class="pip-entry-date">${e.date}</div>
    ${e.title    ? `<div class="pip-entry-title">${e.title}</div>`      : ''}
    ${e.artist   ? `<div class="pip-entry-field">${e.artist}</div>`     : ''}
    ${e.thoughts ? `<div class="pip-entry-content">${e.thoughts}</div>` : ''}
  </div>`;

  if (name === 'thoughts') return `
    <div class="pip-entry">
      <div class="pip-entry-date">${e.date}</div>
      <div class="pip-entry-title">${e.title}</div>
      ${e.content ? `<div class="pip-entry-content">${e.content}</div>` : ''}
    </div>`;

  if (name === 'films') return `
    <div class="pip-entry">
      <div class="pip-entry-date">${e.date}</div>
      <div class="pip-entry-title">${e.title}</div>
      ${e.reason   ? `<div class="pip-entry-field">★ ${e.reason}</div>`      : ''}
      ${e.thoughts  ? `<div class="pip-entry-content">${e.thoughts}</div>`     : ''}
    </div>`;

  if (name === 'books') return `
    <div class="pip-entry">
      <div class="pip-entry-date">${e.date}</div>
      <div class="pip-entry-title">${e.title}</div>
      ${e.reason   ? `<div class="pip-entry-field">★ ${e.reason}</div>`      : ''}
    </div>`;

  return '';
}

function closePip(e) {
  if (!e || e.target === document.getElementById('pip-overlay')) {
    document.getElementById('pip-overlay').classList.remove('open');
  }
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closePip();
});

// ← change these to your own values
const REPO_OWNER = 'wel013';
const REPO_NAME  = 'zanzo';
const ADMIN_PASS = '123456789';

let _authenticated = false;

// press Shift+Alt+A to open admin
document.addEventListener('keydown', e => {
  if (e.shiftKey && e.altKey && e.code === 'KeyA') openAdmin();
});

function openAdmin() {
  if (_authenticated) {
    document.getElementById('auth-step').style.display  = 'none';
    document.getElementById('entry-step').style.display = 'block';
    if (_lastSection) {
      document.getElementById('entry-section').value = _lastSection;
    }
    updateFormFields();
  } else {
    document.getElementById('auth-step').style.display  = 'block';
    document.getElementById('entry-step').style.display = 'none';
    document.getElementById('auth-error').style.display = 'none';
  }
  document.getElementById('admin-overlay').classList.add('open');
  setTimeout(() => document.getElementById('auth-input')?.focus(), 100);
}

function closeAdmin(e) {
  if (!e || e.target === document.getElementById('admin-overlay')) {
    document.getElementById('admin-overlay').classList.remove('open');
    document.getElementById('auth-input').value = '';
  }
}

function checkPassword() {
  const val = document.getElementById('auth-input').value;
  if (val === ADMIN_PASS) {
    _authenticated = true;
    document.getElementById('auth-step').style.display  = 'none';
    document.getElementById('entry-step').style.display = 'block';
    updateFormFields();
  } else {
    document.getElementById('auth-error').style.display = 'block';
    document.getElementById('auth-input').value = '';
  }
}

// hit Enter in password field to confirm
document.getElementById('auth-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') checkPassword();
});

// fields change depending on which section is selected
const FIELDS = {
  log:      ['date','title','from1001','drinks','smoke','content'],
  music:    ['date','title','artist','thoughts'],
  films:    ['date','title','reason','thoughts'],
  books:    ['date','title','reason'],
  thoughts: ['date','title','content']
};

function updateFormFields() {
  const section = document.getElementById('entry-section').value;
  const fields  = FIELDS[section];
  const today   = new Date().toISOString().split('T')[0];
  document.getElementById('dynamic-fields').innerHTML = fields.map(f => `
    <div class="admin-field">
      <label>// ${f.toUpperCase()}</label>
      ${f === 'date'
        ? `<input id="field-${f}" type="date" value="${today}">`
        : f === 'content' || f === 'thoughts' || f === 'reason'
          ? `<textarea id="field-${f}" rows="3" placeholder="${f}..."></textarea>`
          : `<input id="field-${f}" type="text" placeholder="${f}">`
      }
    </div>
  `).join('');
}

async function saveEntry() {
  const section = document.getElementById('entry-section').value;
  const fields  = FIELDS[section];
  const status  = document.getElementById('save-status');

  // build entry object from form
  const entry = { id: Date.now() };
  fields.forEach(f => {
    const el = document.getElementById(`field-${f}`);
    if (el) entry[f] = el.value.trim();
  });

  if (!entry.title) { alert('title is required'); return; }

  status.style.display   = 'block';
  status.textContent     = '// saving_▌';

  try {
    const path = `data/${section}.json`;
    const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
    const token = localStorage.getItem('gh_pat') || promptForPAT();
    if (!token) return;

    // get current file
    const getRes  = await fetch(apiUrl, {
      headers: { 'Authorization': `token ${token}` }
    });
    const fileData = await getRes.json();
    const current  = JSON.parse(new TextDecoder().decode(
  Uint8Array.from(atob(fileData.content.replace(/\n/g,'')), c => c.charCodeAt(0))
));
    current.push(entry);

    // commit updated file
    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `add entry to ${section}`,
        content: btoa(unescape(encodeURIComponent(JSON.stringify(current, null, 2)))),
        sha: fileData.sha
      })
    });

  if (putRes.ok) {
  status.textContent = '// saved ✓';
  fields.forEach(f => {
    const el = document.getElementById(`field-${f}`);
    if (el) el.value = '';
  });
  setTimeout(() => {
    status.style.display = 'none';
    document.getElementById('admin-overlay').classList.remove('open');
    if (_lastSection) openSection(_lastSection);
  }, 1200);
} else {
      status.textContent = '// error — check PAT permissions';
      // console.error('GitHub error:', errData); // ← add this
    }
  } catch(err) {
    console.error(err);
    status.textContent = '// failed_';
  }
}

function promptForPAT() {
  const pat = prompt('enter your GitHub PAT (saved locally):');
  if (pat) localStorage.setItem('gh_pat', pat);
  return pat;
}
window.addEventListener('load', () => {
  if (window.location.hash === '#admin') openAdmin();
});