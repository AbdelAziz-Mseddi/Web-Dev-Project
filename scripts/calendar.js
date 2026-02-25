
'use strict';

/* ────────── CONSTANTS ───────── */
const STORAGE_KEY = 'insativity_events';
const CATEGORY_COLORS = {
    academic: { pill: 'pill-blue', label: '#2b3e4e' },
    sports: { pill: 'pill-green', label: '#3B6B35' },
    culture: { pill: 'pill-purple', label: '#5B3FA6' },
    career: { pill: 'pill-gold', label: '#ad9d61' },
    social: { pill: 'pill-red', label: '#820608' },
    other: { pill: 'pill-grey', label: '#6b7280' },
};

const DEFAULT_EVENTS = [
    { id: 'e1', title: 'Basketball Tournament', date: '2026-02-02', category: 'sports', time: '14:00', location: 'Sports Hall', description: 'Inter-club basketball match. Everyone welcome!' },
    { id: 'e2', title: 'Career Fair', date: '2026-02-04', category: 'career', time: '09:00', location: 'Main Hall', description: 'Meet 40+ recruiters from top companies.' },
    { id: 'e3', title: 'Hackathon 2026', date: '2026-02-07', category: 'academic', time: '08:00', location: 'Tech Hub', description: '48-hour coding challenge. Form teams of 3.' },
    { id: 'e4', title: 'Alumni Gala', date: '2026-02-15', category: 'social', time: '20:00', location: 'Main Quad', description: 'Annual alumni networking gala with dinner.' },
    { id: 'e5', title: 'Art Exhibition', date: '2026-03-20', category: 'culture', time: '08:00', location: 'Gallery', description: 'Student art showcase — 3 weeks of work.' },
    { id: 'e6', title: 'Tech Talk: AI Futures', date: '2026-02-25', category: 'academic', time: '10:00', location: 'Amphitheatre', description: 'Panel discussion on AI trends in industry.' },
];

/* ─────────────── STATE ──────────── */
let events = loadEvents();
let current = { year: new Date().getFullYear(), month: new Date().getMonth() }; // 0-indexed
let selected = null;   // { year, month, day }

/* ────────────── DOM REFS ───────── */
const $ = id => document.getElementById(id);
const calGrid = $('calGrid');
const calMonthLabel = $('calMonthLabel');
const calYearLabel = $('calYearLabel');
const btnPrev = $('btnPrev');
const btnNext = $('btnNext');
const btnToday = $('btnToday');
const dayPanel = $('dayPanel');
const dayPanelTitle = $('dayPanelTitle');
const dayPanelList = $('dayPanelList');
const btnAddEvent = $('btnAddEvent');
const btnClosePanel = $('btnClosePanel');
const modal = $('eventModal');
const modalTitle = $('modalTitle');
const modalForm = $('modalForm');
const btnCloseModal = $('btnCloseModal');
const searchBar = document.querySelector('.search-bar');
const featuredList = $('featuredList');

/* ────────── INIT ─────────── */
document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
    renderFeatured();
    bindControls();
    bindModal();
    bindSearch();
    highlightTodayAutoLabel();
});

/* ───────────── STORAGE ────────── */
function loadEvents() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [...DEFAULT_EVENTS];
    } catch {
        return [...DEFAULT_EVENTS];
    }
}

function saveEvents() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

/* ───────── RENDER CALENDAR ──────── */
function renderCalendar() {
    const { year, month } = current;
    const today = new Date();

    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    calMonthLabel.textContent = MONTHS[month];
    calYearLabel.textContent = year;

    const firstDay = new Date(year, month, 1).getDay();   // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();

    // Clear existing day cells (keep header row: 7 day-name divs)
    const dayNames = calGrid.querySelectorAll('.day-name');
    calGrid.innerHTML = '';
    dayNames.forEach(d => calGrid.appendChild(d));

    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        let cellDay, cellYear, cellMonth, isMuted = false;

        if (i < firstDay) {
            // Prev month overflow
            cellDay = daysInPrev - firstDay + 1 + i;
            cellMonth = month - 1 < 0 ? 11 : month - 1;
            cellYear = month - 1 < 0 ? year - 1 : year;
            isMuted = true;
        } else if (i >= firstDay + daysInMonth) {
            // Next month overflow
            cellDay = i - firstDay - daysInMonth + 1;
            cellMonth = month + 1 > 11 ? 0 : month + 1;
            cellYear = month + 1 > 11 ? year + 1 : year;
            isMuted = true;
        } else {
            cellDay = i - firstDay + 1;
            cellMonth = month;
            cellYear = year;
        }

        const isToday = !isMuted
            && cellDay === today.getDate()
            && cellMonth === today.getMonth()
            && cellYear === today.getFullYear();

        const dateStr = toDateStr(cellYear, cellMonth, cellDay);
        const dayEvts = events.filter(e => e.date === dateStr);

        cell.className = 'calendar-day'
            + (isMuted ? ' muted' : '')
            + (isToday ? ' current' : '')
            + (dayEvts.length > 0 && !isMuted ? ' has-event' : '')
            + (isSelected(cellYear, cellMonth, cellDay) ? ' selected' : '');

        // Day number
        const num = document.createElement('span');
        num.className = 'day-number';
        num.textContent = cellDay;
        cell.appendChild(num);

        // Event pills (max 2 visible + overflow badge)
        if (!isMuted) {
            const MAX_PILLS = 2;
            dayEvts.slice(0, MAX_PILLS).forEach(evt => {
                const pill = document.createElement('span');
                const cat = CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.other;
                pill.className = `event-pill ${cat.pill}`;
                pill.textContent = evt.title;
                cell.appendChild(pill);
            });
            if (dayEvts.length > MAX_PILLS) {
                const more = document.createElement('span');
                more.className = 'event-pill pill-more';
                more.textContent = `+${dayEvts.length - MAX_PILLS} more`;
                cell.appendChild(more);
            }
        }

        // Click → select day & open panel
        if (!isMuted) {
            cell.addEventListener('click', () => selectDay(cellYear, cellMonth, cellDay));
        }

        calGrid.appendChild(cell);
    }
}

/* ─────────── DAY PANEL ──────── */
function selectDay(year, month, day) {
    selected = { year, month, day };
    renderCalendar();
    openDayPanel(year, month, day);
}

function openDayPanel(year, month, day) {
    const dateStr = toDateStr(year, month, day);
    const dayEvts = events.filter(e => e.date === dateStr);

    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dow = new Date(year, month, day).getDay();

    dayPanelTitle.textContent = `${DAYS[dow]}, ${MONTHS[month]} ${day}, ${year}`;
    btnAddEvent.dataset.date = dateStr;

    dayPanelList.innerHTML = '';
    if (dayEvts.length === 0) {
        dayPanelList.innerHTML = `<p class="no-events-msg">No events scheduled.<br>Click <strong>+ Add Event</strong> to create one.</p>`;
    } else {
        dayEvts.forEach(evt => {
            const item = document.createElement('div');
            item.className = 'agenda-item';
            const cat = CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.other;
            item.innerHTML = `
        <div class="agenda-dot ${cat.pill}"></div>
        <div class="agenda-info">
          <span class="agenda-time">${evt.time || '—'}</span>
          <span class="agenda-name">${evt.title}</span>
          <span class="agenda-loc">${evt.location ? '📍 ' + evt.location : ''}</span>
          ${evt.description ? `<p class="agenda-desc">${evt.description}</p>` : ''}
        </div>
        <button class="agenda-delete" data-id="${evt.id}" title="Delete event">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
        </button>`;
            dayPanelList.appendChild(item);
        });

        dayPanelList.querySelectorAll('.agenda-delete').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                deleteEvent(btn.dataset.id);
            });
        });
    }

    dayPanel.classList.add('open');
}

function closeDayPanel() {
    dayPanel.classList.remove('open');
    selected = null;
    renderCalendar();
}

/* ─────────── FEATURED PANEL ───────── */
function renderFeatured(filter = '') {
    const lower = filter.toLowerCase();
    const upcomingEvents = events
        .filter(e => {
            const d = new Date(e.date);
            const n = new Date();
            n.setHours(0, 0, 0, 0);
            return d >= n;
        })
        .filter(e => !filter || e.title.toLowerCase().includes(lower)
            || (e.location || '').toLowerCase().includes(lower)
            || e.category.toLowerCase().includes(lower))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 8);

    featuredList.innerHTML = '';

    if (upcomingEvents.length === 0) {
        featuredList.innerHTML = `<p class="no-events-msg" style="padding:1rem;">No events match your search.</p>`;
        return;
    }

    const BADGE_LABELS = { academic: 'Academic', sports: 'Sports', culture: 'Cultural', career: 'Career', social: 'Social', other: 'Other' };
    const BADGE_CLASSES = { academic: 'badge-blue', sports: 'badge-green', culture: 'badge-purple', career: 'badge-gold', social: 'badge-red', other: 'badge-grey' };

    upcomingEvents.forEach(evt => {
        const dateObj = new Date(evt.date + 'T00:00');
        const dateLabel = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        const badgeClass = BADGE_CLASSES[evt.category] || 'badge-grey';
        const badgeLabel = BADGE_LABELS[evt.category] || 'Other';

        const card = document.createElement('article');
        card.className = 'event-card';
        card.innerHTML = `
      <div class="card-image placeholder-img featured-color-${evt.category}"></div>
      <div class="card-content">
        <span class="badge ${badgeClass}">${badgeLabel}</span>
        <h4>${evt.title}</h4>
        <p class="meta">📍 ${evt.location || '—'} • ${dateLabel} • ${evt.time || '—'}</p>
        <p class="attendees" style="font-size:0.8rem;color:var(--text-muted);">${evt.description ? evt.description.substring(0, 60) + (evt.description.length > 60 ? '…' : '') : ''}</p>
      </div>`;

        card.addEventListener('click', () => {
            // Navigate calendar to that event's month
            const d = new Date(evt.date + 'T00:00');
            current = { year: d.getFullYear(), month: d.getMonth() };
            renderCalendar();
            selectDay(d.getFullYear(), d.getMonth(), d.getDate());
        });

        featuredList.appendChild(card);
    });
}

/* ────────── MODAL ─────────── */
function openModal(dateStr = '') {
    $('fTitle').value = '';
    $('fDate').value = dateStr;
    $('fTime').value = '';
    $('fCategory').value = 'academic';
    $('fLocation').value = '';
    $('fDescription').value = '';
    modalTitle.textContent = dateStr
        ? `Add Event — ${new Date(dateStr + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
        : 'Add New Event';
    modal.classList.add('open');
    $('fTitle').focus();
}

function closeModal() {
    modal.classList.remove('open');
}

function bindModal() {
    btnCloseModal.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

    modalForm.addEventListener('submit', e => {
        e.preventDefault();
        const title = $('fTitle').value.trim();
        const date = $('fDate').value;
        const time = $('fTime').value;
        const category = $('fCategory').value;
        const location = $('fLocation').value.trim();
        const desc = $('fDescription').value.trim();

        if (!title || !date) return;

        const newEvt = {
            id: 'e' + Date.now(),
            title, date, time, category, location,
            description: desc,
        };
        events.push(newEvt);
        saveEvents();
        closeModal();
        renderCalendar();
        renderFeatured();

        // Re-open the day panel if we were on that day
        const d = new Date(date + 'T00:00');
        current = { year: d.getFullYear(), month: d.getMonth() };
        selectDay(d.getFullYear(), d.getMonth(), d.getDate());
    });

    btnAddEvent.addEventListener('click', () => {
        openModal(btnAddEvent.dataset.date || '');
    });
}

function deleteEvent(id) {
    events = events.filter(e => e.id !== id);
    saveEvents();
    renderCalendar();
    renderFeatured();
    // Refresh panel
    if (selected) openDayPanel(selected.year, selected.month, selected.day);
}

/* ─────────── CONTROLS ───────── */
function bindControls() {
    btnPrev.addEventListener('click', () => {
        if (current.month === 0) { current.month = 11; current.year--; }
        else current.month--;
        closeDayPanel();
        renderCalendar();
    });

    btnNext.addEventListener('click', () => {
        if (current.month === 11) { current.month = 0; current.year++; }
        else current.month++;
        closeDayPanel();
        renderCalendar();
    });

    btnToday.addEventListener('click', () => {
        const t = new Date();
        current = { year: t.getFullYear(), month: t.getMonth() };
        closeDayPanel();
        renderCalendar();
        // Auto-select today
        selectDay(t.getFullYear(), t.getMonth(), t.getDate());
    });

    btnClosePanel.addEventListener('click', closeDayPanel);

    // Global add-event shortcut button
    $('btnGlobalAdd').addEventListener('click', () => openModal($('fDate')?.value || ''));
}

/* ─────────────── SEARCH ──────────── */
function bindSearch() {
    if (!searchBar) return;
    searchBar.addEventListener('input', () => renderFeatured(searchBar.value));
}

/* ─────────── HELPERS ────────── */
function toDateStr(y, m, d) {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function isSelected(y, m, d) {
    return selected && selected.year === y && selected.month === m && selected.day === d;
}

function highlightTodayAutoLabel() {
    // Animate the "today" dot periodically (handled via CSS animation)
}
