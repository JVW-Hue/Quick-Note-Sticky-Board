(() => {
  const board = document.getElementById('board');
  const addBtn = document.getElementById('addNoteBtn');
  const clearBtn = document.getElementById('clearAllBtn');
  const emptyState = document.getElementById('emptyState');
  const colorPresets = document.getElementById('colorPresets');
  const nativeColorPicker = document.getElementById('nativeColorPicker');
  const mixerToggleBtn = document.getElementById('mixerToggleBtn');
  const colorMixer = document.getElementById('colorMixer');
  const mixerCloseBtn = document.getElementById('mixerCloseBtn');
  const mixColorA = document.getElementById('mixColorA');
  const mixColorB = document.getElementById('mixColorB');
  const mixPreviewA = document.getElementById('mixPreviewA');
  const mixPreviewB = document.getElementById('mixPreviewB');
  const mixSlider = document.getElementById('mixSlider');
  const mixPercent = document.getElementById('mixPercent');
  const mixResult = document.getElementById('mixResult');
  const useMixBtn = document.getElementById('useMixBtn');
  const saveMixBtn = document.getElementById('saveMixBtn');
  const myColorsList = document.getElementById('myColorsList');
  const myColorsEmpty = document.getElementById('myColorsEmpty');
  const hslH = document.getElementById('hslH');
  const hslS = document.getElementById('hslS');
  const hslL = document.getElementById('hslL');
  const hslHVal = document.getElementById('hslHVal');
  const hslSVal = document.getElementById('hslSVal');
  const hslLVal = document.getElementById('hslLVal');
  const hslResult = document.getElementById('hslResult');
  const useHslBtn = document.getElementById('useHslBtn');
  const saveHslBtn = document.getElementById('saveHslBtn');
  const saveCustomColorBtn = document.getElementById('saveCustomColorBtn');

  const PRESET_COLORS = [
    '#fef08a', '#fde68a', '#fed7aa', '#fecaca', '#fbcfe8',
    '#e9d5ff', '#c4b5fd', '#bfdbfe', '#a5f3fc', '#bbf7d0',
    '#bef264', '#fcd34d', '#f97316', '#ef4444', '#ec4899',
    '#a855f6', '#6366f1', '#3b82f6', '#06b6d4', '#10b981',
    '#84cc16', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b',
    '#ffffff', '#f8fafc', '#1e293b', '#0f172a', '#000000'
  ];

  const STORAGE_KEY = 'sticky-board-notes';
  const SETTINGS_KEY = 'sticky-board-settings';
  const SAVED_COLORS_KEY = 'sticky-board-saved-colors';

  let selectedColor = '#fef08a';
  let notes = [];
  let zCounter = 1;
  let dragState = null;
  let resizeState = null;
  let savedColors = [];

  function saveNotes() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes.map(n => ({
      id: n.id, x: n.x, y: n.y, width: n.width,
      color: n.color, text: n.text, created: n.created
    }))));
  }

  function loadNotes() {
    try { const r = localStorage.getItem(STORAGE_KEY); if (r) notes = JSON.parse(r); } catch { notes = []; }
  }

  function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ selectedColor }));
  }

  function loadSettings() {
    try {
      const r = localStorage.getItem(SETTINGS_KEY);
      if (r) { const s = JSON.parse(r); if (s.selectedColor) selectedColor = s.selectedColor; }
    } catch {}
  }

  function saveSavedColors() {
    localStorage.setItem(SAVED_COLORS_KEY, JSON.stringify(savedColors));
  }

  function loadSavedColors() {
    try { const r = localStorage.getItem(SAVED_COLORS_KEY); if (r) savedColors = JSON.parse(r); } catch { savedColors = []; }
  }

  function hexToRgb(hex) {
    const h = hex.replace('#', '');
    return { r: parseInt(h.substring(0, 2), 16), g: parseInt(h.substring(2, 4), 16), b: parseInt(h.substring(4, 6), 16) };
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => { const h = Math.round(Math.max(0, Math.min(255, x))).toString(16); return h.length === 1 ? '0' + h : h; }).join('');
  }

  function mixColors(hexA, hexB, ratio) {
    const a = hexToRgb(hexA), b = hexToRgb(hexB);
    return rgbToHex(a.r + (b.r - a.r) * ratio, a.g + (b.g - a.g) * ratio, a.b + (b.b - a.b) * ratio);
  }

  function hslToHex(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) { r = g = b = l; } else {
      const hue2rgb = (p, q, t) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1/6) return p + (q - p) * 6 * t; if (t < 1/2) return q; if (t < 2/3) return p + (q - p) * (2/3 - t) * 6; return p; };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1/3);
    }
    return rgbToHex(r * 255, g * 255, b * 255);
  }

  function buildPresets() {
    colorPresets.innerHTML = '';
    PRESET_COLORS.forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'color-btn' + (c === selectedColor ? ' active' : '');
      btn.dataset.color = c;
      btn.style.backgroundColor = c;
      btn.title = c;
      btn.addEventListener('click', () => selectColor(c, btn));
      colorPresets.appendChild(btn);
    });
  }

  function selectColor(color, activeBtn) {
    selectedColor = color;
    colorPresets.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    if (activeBtn) activeBtn.classList.add('active');
    nativeColorPicker.value = color;
    myColorsList.querySelectorAll('.my-color').forEach(b => { b.classList.remove('active'); if (b.title === color) b.classList.add('active'); });
    saveSettings();
  }

  document.getElementById('customColorBtn').addEventListener('click', () => nativeColorPicker.click());

  nativeColorPicker.addEventListener('input', (e) => {
    selectedColor = e.target.value;
    colorPresets.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    saveSettings();
  });

  saveCustomColorBtn.addEventListener('click', () => {
    const c = nativeColorPicker.value;
    if (!savedColors.includes(c)) { savedColors.push(c); saveSavedColors(); renderSavedColors(); }
    saveCustomColorBtn.textContent = 'Saved!';
    saveCustomColorBtn.classList.add('saved');
    setTimeout(() => { saveCustomColorBtn.textContent = 'Save'; saveCustomColorBtn.classList.remove('saved'); }, 1200);
  });

  mixerToggleBtn.addEventListener('click', () => { colorMixer.classList.toggle('hidden'); mixerToggleBtn.classList.toggle('active'); });
  mixerCloseBtn.addEventListener('click', () => { colorMixer.classList.add('hidden'); mixerToggleBtn.classList.remove('active'); });

  function updateMixResult() {
    const mixed = mixColors(mixColorA.value, mixColorB.value, mixSlider.value / 100);
    mixPreviewA.style.background = mixColorA.value;
    mixPreviewB.style.background = mixColorB.value;
    mixPercent.textContent = mixSlider.value;
    mixResult.style.background = mixed;
    return mixed;
  }

  mixColorA.addEventListener('input', updateMixResult);
  mixColorB.addEventListener('input', updateMixResult);
  mixSlider.addEventListener('input', updateMixResult);
  useMixBtn.addEventListener('click', () => selectColor(updateMixResult(), null));
  saveMixBtn.addEventListener('click', () => { const c = updateMixResult(); if (!savedColors.includes(c)) { savedColors.push(c); saveSavedColors(); renderSavedColors(); } });

  function renderSavedColors() {
    myColorsList.innerHTML = '';
    myColorsEmpty.style.display = savedColors.length === 0 ? 'inline' : 'none';
    savedColors.forEach((c, i) => {
      const el = document.createElement('div');
      el.className = 'my-color' + (c === selectedColor ? ' active' : '');
      el.style.background = c;
      el.title = c;
      el.addEventListener('click', () => { selectColor(c, null); renderSavedColors(); });
      const rm = document.createElement('button');
      rm.className = 'remove-my-color';
      rm.textContent = '\u00d7';
      rm.addEventListener('click', (e) => { e.stopPropagation(); savedColors.splice(i, 1); saveSavedColors(); renderSavedColors(); });
      el.appendChild(rm);
      myColorsList.appendChild(el);
    });
  }

  function updateHslResult() {
    const hex = hslToHex(parseInt(hslH.value), parseInt(hslS.value), parseInt(hslL.value));
    hslHVal.textContent = hslH.value;
    hslSVal.textContent = hslS.value + '%';
    hslLVal.textContent = hslL.value + '%';
    hslResult.style.background = hex;
    return hex;
  }

  hslH.addEventListener('input', updateHslResult);
  hslS.addEventListener('input', updateHslResult);
  hslL.addEventListener('input', updateHslResult);
  useHslBtn.addEventListener('click', () => selectColor(updateHslResult(), null));
  saveHslBtn.addEventListener('click', () => { const c = updateHslResult(); if (!savedColors.includes(c)) { savedColors.push(c); saveSavedColors(); renderSavedColors(); } });

  function createNote(opts = {}) {
    const id = opts.id || Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const boardRect = board.getBoundingClientRect();
    const note = {
      id,
      x: opts.x ?? Math.random() * (boardRect.width - 280) + 10,
      y: opts.y ?? Math.random() * (boardRect.height - 220) + 10,
      width: opts.width || 260,
      color: opts.color || selectedColor,
      text: opts.text || '',
      created: opts.created || Date.now()
    };
    notes.push(note);
    renderNote(note);
    updateEmptyState();
    saveNotes();
    return note;
  }

  function renderNote(note) {
    const el = document.createElement('div');
    el.className = 'note note-enter';
    el.dataset.id = note.id;
    el.style.left = note.x + 'px';
    el.style.top = note.y + 'px';
    el.style.width = note.width + 'px';
    el.style.backgroundColor = note.color;
    const shortColors = PRESET_COLORS.filter(c => c !== note.color).slice(0, 5);
    el.innerHTML = `
      <div class="note-header" data-role="drag-handle">
        <span class="note-time">${new Date(note.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <div class="note-actions"><button data-action="delete" title="Delete note">&times;</button></div>
      </div>
      <div class="note-body"><textarea placeholder="Type your note...">${note.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea></div>
      <div class="note-footer">
        <div class="note-color-pick" data-action="pick-color" title="Pick color" style="background:${note.color}"><input type="color" value="${note.color}" /></div>
        ${shortColors.map(c => `<div class="color-dot" data-action="recolor" data-color="${c}" style="background:${c}"></div>`).join('')}
        <div class="resize-handle" data-role="resize-handle"></div>
      </div>`;

    const textarea = el.querySelector('textarea');
    textarea.addEventListener('input', () => { note.text = textarea.value; saveNotes(); });
    textarea.addEventListener('mousedown', (e) => e.stopPropagation());

    el.addEventListener('mousedown', (e) => {
      const target = e.target.closest('[data-action], [data-role]');
      if (!target) return;
      if (target.dataset.action === 'delete') { deleteNote(note.id, el); return; }
      if (target.dataset.action === 'recolor') { note.color = target.dataset.color; el.style.backgroundColor = note.color; const p = el.querySelector('.note-color-pick'); if (p) p.style.background = note.color; saveNotes(); return; }
      if (target.dataset.action === 'pick-color') { const ci = target.querySelector('input[type="color"]') || target; ci.addEventListener('input', (ev) => { note.color = ev.target.value; el.style.backgroundColor = note.color; target.style.background = ev.target.value; saveNotes(); }, { once: true }); ci.click(); return; }
      if (target.dataset.role === 'resize-handle') { e.preventDefault(); startResize(e, note, el); return; }
      if (target.dataset.role === 'drag-handle') { bringToFront(el); startDrag(e, note, el); }
    });

    bringToFront(el);
    board.appendChild(el);
    requestAnimationFrame(() => el.classList.remove('note-enter'));
    autoResize(textarea);
    textarea.addEventListener('input', () => autoResize(textarea));
  }

  function deleteNote(id, el) {
    el.style.transform = 'scale(0.8)'; el.style.opacity = '0';
    setTimeout(() => { el.remove(); notes = notes.filter(n => n.id !== id); saveNotes(); updateEmptyState(); }, 150);
  }

  function updateEmptyState() { emptyState.style.display = notes.length === 0 ? 'block' : 'none'; }

  function startDrag(e, note, el) { dragState = { note, el, offsetX: e.clientX - note.x, offsetY: e.clientY - note.y }; el.classList.add('dragging'); bringToFront(el); }
  function onDrag(e) { if (!dragState) return; const { note, el, offsetX, offsetY } = dragState; note.x = e.clientX - offsetX; note.y = e.clientY - offsetY; el.style.left = note.x + 'px'; el.style.top = note.y + 'px'; }
  function stopDrag() { if (dragState) { dragState.el.classList.remove('dragging'); dragState = null; saveNotes(); } }

  function startResize(e, note, el) { resizeState = { note, el, startX: e.clientX, startWidth: note.width }; }
  function onResize(e) { if (!resizeState) return; const { note, el, startX, startWidth } = resizeState; note.width = Math.max(180, Math.min(500, startWidth + (e.clientX - startX))); el.style.width = note.width + 'px'; autoResize(el.querySelector('textarea')); }
  function stopResize() { if (resizeState) { resizeState = null; saveNotes(); } }

  function bringToFront(el) { zCounter++; el.style.zIndex = zCounter; }
  function autoResize(ta) { ta.style.height = 'auto'; ta.style.height = Math.max(120, ta.scrollHeight) + 'px'; }

  addBtn.addEventListener('click', () => createNote());
  clearBtn.addEventListener('click', () => {
    if (notes.length === 0) return;
    if (!confirm('Delete all notes?')) return;
    notes.forEach(n => { const el = board.querySelector(`[data-id="${n.id}"]`); if (el) el.remove(); });
    notes = []; saveNotes(); updateEmptyState();
  });

  document.addEventListener('mousemove', (e) => { onDrag(e); onResize(e); });
  document.addEventListener('mouseup', () => { stopDrag(); stopResize(); });
  document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); createNote(); } });

  loadSettings(); loadSavedColors(); loadNotes();
  buildPresets(); renderSavedColors();
  notes.forEach(n => renderNote(n));
  updateEmptyState();
  nativeColorPicker.value = selectedColor;
})();
