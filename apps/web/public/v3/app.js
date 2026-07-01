// EuShop — Application Logic
'use strict';

// ── State ─────────────────────────────────────────────────────────────────
let allListings = [];
let allRequests = [];
let favorites = new Set();
let activeCountry = null;
let activeCategory = 'all';
let catalogFilter = '';
let countryFilter = '';
let SESSION_KEY = 'eushop_session_' + (localStorage.getItem('eushop_uid') || (() => {
  const uid = 'u_' + Date.now();
  localStorage.setItem('eushop_uid', uid);
  return uid;
})());


// ── Init ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadListings();
  loadRequests();
  loadFavorites();
  buildHeroFlags();
  buildHeroStars();
  buildCountryGrid();
  buildCountrySelect();
  buildRequestCountrySelect();
  buildEmojiPicker();
  renderListings();
  renderRequests();
  renderMyListings();
  buildCatalog();
  buildTestimonials();
  buildFAQ();
  updateStatCount();
  initScrollEffects();
  initNavScroll();
  initBackToTop();
  initCookieBanner();
  updateRangeTrack();
});


// ── localStorage ──────────────────────────────────────────────────────────
function loadListings() {
  const stored = JSON.parse(localStorage.getItem('eushop_listings') || '[]');
  allListings = [...DEMO_LISTINGS, ...stored];
}
function saveListings() {
  const userListings = allListings.filter(l => !l.id.startsWith('demo'));
  localStorage.setItem('eushop_listings', JSON.stringify(userListings));
}
function loadRequests() {
  allRequests = JSON.parse(localStorage.getItem('eushop_requests') || '[]');
}
function saveRequests() {
  localStorage.setItem('eushop_requests', JSON.stringify(allRequests));
}
function loadFavorites() {
  favorites = new Set(JSON.parse(localStorage.getItem('eushop_favs') || '[]'));
}
function saveFavorites() {
  localStorage.setItem('eushop_favs', JSON.stringify([...favorites]));
}


// ── Hero Flags Scroll ─────────────────────────────────────────────────────
function buildHeroFlags() {
  const track = document.getElementById('flags-track');
  if (!track) return;
  const items = [...COUNTRIES, ...COUNTRIES].map(c => {
    const pill = document.createElement('div');
    pill.className = 'flag-pill';
    const fc = c.code.toLowerCase();
    pill.innerHTML = `<img src="https://flagcdn.com/w40/${fc}.png" style="width:22px;height:15px;border-radius:2px;object-fit:cover" alt="${c.name}"/><span>${c.name}</span>`;
    return pill;
  });
  items.forEach(el => track.appendChild(el));
}

// ── Hero Stars ────────────────────────────────────────────────────────────
function buildHeroStars() {
  const bg = document.getElementById('hero-stars-bg');
  if (!bg) return;
  for (let i = 0; i < 60; i++) {
    const s = document.createElement('div');
    s.className = 'hero-star';
    s.textContent = '★';
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    s.style.animationDelay = (Math.random() * 3) + 's';
    s.style.fontSize = (0.4 + Math.random() * 0.8) + 'rem';
    bg.appendChild(s);
  }
}

// ── Country Grid ──────────────────────────────────────────────────────────
function buildCountryGrid(filter = '') {
  const grid = document.getElementById('countries-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const q = filter.toLowerCase();
  COUNTRIES.filter(c => !q || c.name.toLowerCase().includes(q)).forEach(c => {
    const count = allListings.filter(l => l.country === c.code).length;
    const card = document.createElement('div');
    card.className = 'country-card fade-in' + (activeCountry === c.code ? ' active' : '');
    card.id = 'country-' + c.code;
    const flagCode = c.code.toLowerCase();
    card.innerHTML = `<img class="country-flag-img" src="https://flagcdn.com/w80/${flagCode}.png" alt="${c.name} flag" onerror="this.style.display='none';this.nextSibling.style.display='block'"/><span class="country-flag" style="display:none">${c.flag}</span>
      <div class="country-card-name">${c.name}</div>
      <div class="country-card-count">${count} listing${count !== 1 ? 's' : ''}</div>`;
    card.onclick = () => setCountryFilter(c.code, c.name, c.flag);
    grid.appendChild(card);
    requestAnimationFrame(() => card.classList.add('visible'));
  });
}

function filterCountries(val) {
  countryFilter = val;
  buildCountryGrid(val);
}

function setCountryFilter(code, name, flag) {
  if (activeCountry === code) { clearCountryFilter(); return; }
  activeCountry = code;
  buildCountryGrid(countryFilter);
  const af = document.getElementById('active-filter');
  const afl = document.getElementById('active-filter-label');
  af.style.display = 'flex';
  afl.textContent = `${flag} Showing: ${name}`;
  renderListings();
  document.getElementById('listings').scrollIntoView({ behavior: 'smooth' });
}

function clearCountryFilter() {
  activeCountry = null;
  buildCountryGrid(countryFilter);
  document.getElementById('active-filter').style.display = 'none';
  renderListings();
}

// ── Country Select (form) ─────────────────────────────────────────────────
function buildCountrySelect() {
  const sel = document.getElementById('form-country');
  if (!sel) return;
  COUNTRIES.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.code;
    opt.textContent = c.flag + ' ' + c.name;
    sel.appendChild(opt);
  });
}

function populateFoodSuggestions() {
  const code = document.getElementById('form-country').value;
  const dl = document.getElementById('food-suggestions');
  dl.innerHTML = '';
  CATALOG.filter(f => f.country === code).forEach(f => {
    const opt = document.createElement('option');
    opt.value = f.name;
    dl.appendChild(opt);
  });
}

// ── Listings ──────────────────────────────────────────────────────────────
function filterListings(cat, btn) {
  activeCategory = cat;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  renderListings();
}

function getSortedListings(arr) {
  const sort = document.getElementById('sort-select')?.value || 'newest';
  const copy = [...arr];
  if (sort === 'fee-asc') copy.sort((a,b) => a.fee - b.fee);
  else if (sort === 'fee-desc') copy.sort((a,b) => b.fee - a.fee);
  else if (sort === 'country') copy.sort((a,b) => (a.country||'').localeCompare(b.country||''));
  else copy.sort((a,b) => new Date(b.date||0) - new Date(a.date||0));
  return copy;
}

function renderListings() {
  const grid = document.getElementById('listings-grid');
  const empty = document.getElementById('listings-empty');
  if (!grid) return;
  grid.innerHTML = '';

  let filtered = allListings;
  if (activeCountry) filtered = filtered.filter(l => l.country === activeCountry);
  if (activeCategory === 'favs') filtered = filtered.filter(l => favorites.has(l.id));
  else if (activeCategory !== 'all') filtered = filtered.filter(l => l.category === activeCategory);

  // Live search
  const q = (document.getElementById('listings-search')?.value || '').toLowerCase().trim();
  if (q) filtered = filtered.filter(l =>
    l.food.toLowerCase().includes(q) ||
    l.location.toLowerCase().includes(q) ||
    (COUNTRIES.find(c => c.code === l.country)?.name || '').toLowerCase().includes(q)
  );

  // Fee range
  const maxFee = parseFloat(document.getElementById('fee-max')?.value || 100);
  filtered = filtered.filter(l => l.fee <= maxFee);
  updateRangeTrack();

  filtered = getSortedListings(filtered);

  if (filtered.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  filtered.forEach((l, i) => {
    const country = COUNTRIES.find(c => c.code === l.country) || {};
    const card = document.createElement('div');
    card.className = 'listing-card fade-in';
    card.id = 'listing-' + l.id;
    const fc = (l.country || 'eu').toLowerCase();
    const flagImg = `<img src="https://flagcdn.com/w80/${fc}.png" style="width:32px;height:22px;border-radius:3px;object-fit:cover" alt="${country.name||'EU'}"/>`;
    const isFav = favorites.has(l.id);
    card.innerHTML = `
      <div class="listing-card-header">
        <span class="listing-country-flag">${flagImg}</span>
        <span class="listing-category-badge">${catLabel(l.category)}</span>
        <button class="fav-btn ${isFav?'active':''}" id="fav-${l.id}" onclick="toggleFav(event,'${l.id}')">${isFav?'❤️':'🤍'}</button>
      </div>
      <div class="listing-card-body">
        <div class="listing-food-name">${l.food}</div>
        <div class="listing-location">📍 ${l.location}</div>
        <div class="listing-description">${l.description || 'No description provided.'}</div>
        <div class="listing-footer">
          <div class="listing-fee">€${l.fee} <span>finder's fee</span></div>
          <button class="listing-contact-btn" onclick="openDetailModal('${l.id}')">View Details</button>
        </div>
      </div>
      <div class="listing-poster">Posted by ${l.name} · ${formatDate(l.date)}</div>`;
    grid.appendChild(card);
    setTimeout(() => card.classList.add('visible'), i * 60);
  });

  updateStatCount();
}


function catLabel(cat) {
  const m = {chocolate:'🍫 Chocolate',candy:'🍬 Candy',biscuit:'🍪 Biscuit',savory:'🥩 Savory',sweet:'🍰 Sweet',drink:'🍶 Drink'};
  return m[cat] || cat;
}

function formatDate(d) {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'}); } catch { return d; }
}

function updateStatCount() {
  const el = document.getElementById('stat-listings');
  if (el) el.textContent = allListings.length;
}

// ── Post Listing Modal ────────────────────────────────────────────────────
function openPostModal() {
  document.getElementById('post-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closePostModal() {
  document.getElementById('post-modal').classList.remove('open');
  document.body.style.overflow = '';
}
function closePostModalOutside(e) {
  if (e.target === document.getElementById('post-modal')) closePostModal();
}

function submitListing(e) {
  e.preventDefault();
  const code = document.getElementById('form-country').value;
  const country = COUNTRIES.find(c => c.code === code) || {};
  const listing = {
    id: 'user_' + Date.now(),
    name: document.getElementById('form-name').value.trim(),
    country: code,
    flag: country.flag || '🇪🇺',
    emoji: document.getElementById('form-emoji')?.value || '🍫',
    food: document.getElementById('form-food').value.trim(),
    category: document.getElementById('form-category').value,
    location: document.getElementById('form-location').value.trim(),
    fee: parseFloat(document.getElementById('form-fee').value),
    contact: document.getElementById('form-contact').value.trim(),
    description: document.getElementById('form-description').value.trim(),
    date: new Date().toISOString().split('T')[0],
  };
  allListings.unshift(listing);
  saveListings();
  renderListings();
  renderMyListings();
  buildCountryGrid(countryFilter);
  closePostModal();
  document.getElementById('post-form').reset();
  document.getElementById('form-emoji').value = '🍫';
  showToast('🎉 Your listing is live! People can now find your ' + listing.food);
}


// ── Detail Modal ──────────────────────────────────────────────────────────
function openDetailModal(id) {
  const l = allListings.find(x => x.id === id);
  if (!l) return;
  const country = COUNTRIES.find(c => c.code === l.country) || {};
  const content = document.getElementById('detail-modal-content');
  const fc = (l.country || 'eu').toLowerCase();
  const flagImg = `<img src="https://flagcdn.com/w80/${fc}.png" style="width:60px;height:42px;border-radius:6px;object-fit:cover;display:block;margin:0 auto .8rem" alt="${country.name||'EU'}"/>`;
  const isFav = favorites.has(l.id);
  const isOwn = !l.id.startsWith('demo');
  const alsoFrom = buildAlsoFrom(l.country, l.id);
  content.innerHTML = `
    ${flagImg}
    <div class="detail-food">${l.emoji ? l.emoji + ' ' : ''}${l.food}</div>
    <div class="detail-country-name">${country.name || l.country} · ${catLabel(l.category)}</div>
    <div class="detail-fee-big">€${l.fee}</div>
    <div class="detail-fee-label">Finder's Fee</div>
    ${l.description ? `<div class="detail-desc">${l.description}</div>` : ''}
    <div class="detail-grid">
      <div class="detail-item"><div class="detail-item-label">📍 Location</div><div class="detail-item-value">${l.location}</div></div>
      <div class="detail-item"><div class="detail-item-label">👤 Listed By</div><div class="detail-item-value">${l.name}</div></div>
      <div class="detail-item"><div class="detail-item-label">📅 Posted</div><div class="detail-item-value">${formatDate(l.date)}</div></div>
      <div class="detail-item"><div class="detail-item-label">🏷️ Category</div><div class="detail-item-value">${catLabel(l.category)}</div></div>
    </div>
    <button class="detail-contact-btn" onclick="contactLister('${l.contact}','${l.food.replace(/'/g,'\'')}')">📩 Contact ${l.name}</button>
    <div class="detail-actions">
      <button class="detail-share-btn" onclick="shareListing('${l.id}')">🔗 Share Listing</button>
      <button class="detail-share-btn ${isFav?'active':''}" style="${isFav?'background:var(--navy);color:#fff;':''}" onclick="toggleFav(event,'${l.id}');openDetailModal('${l.id}')">${isFav?'❤️ Saved':'🤍 Save'}</button>
    </div>
    ${isOwn ? `<div class="detail-actions" style="margin-top:.5rem"><button class="detail-delete-btn" onclick="deleteListing('${l.id}')">🗑️ Delete My Listing</button></div>` : ''}
    ${alsoFrom}`;
  document.getElementById('detail-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDetailModal() {
  document.getElementById('detail-modal').classList.remove('open');
  document.body.style.overflow = '';
}
function closeDetailModalOutside(e) {
  if (e.target === document.getElementById('detail-modal')) closeDetailModal();
}
function contactLister(contact, food) {
  if (contact.includes('@')) {
    window.location.href = `mailto:${contact}?subject=EuShop: Interested in ${food}&body=Hi! I found your listing on EuShop and I'm interested in your ${food}. What are the next steps?`;
  } else {
    const num = contact.replace(/\s/g, '');
    window.open(`https://wa.me/${num.replace('+','')}?text=Hi! I found your listing on EuShop and I'm interested in your ${food}.`, '_blank');
  }
  showToast('Opening contact for ' + food + '…');
}

function toggleFav(e, id) {
  e.stopPropagation();
  if (favorites.has(id)) {
    favorites.delete(id);
    showToast('Removed from saved listings');
  } else {
    favorites.add(id);
    showToast('❤️ Saved to your favourites!');
  }
  saveFavorites();
  renderListings();
}

function shareListing(id) {
  const l = allListings.find(x => x.id === id);
  if (!l) return;
  const text = `Check out this listing on EuShop: ${l.food} from ${(COUNTRIES.find(c=>c.code===l.country)||{}).name||l.country} · €${l.fee} finder's fee · ${l.location}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
    showToast('📋 Listing details copied to clipboard!');
  } else {
    showToast(text);
  }
}

function deleteListing(id) {
  if (!confirm('Delete this listing? This cannot be undone.')) return;
  allListings = allListings.filter(l => l.id !== id);
  favorites.delete(id);
  saveListings();
  saveFavorites();
  closeDetailModal();
  renderListings();
  renderMyListings();
  buildCountryGrid(countryFilter);
  showToast('🗑️ Listing deleted');
}


// ── Catalog ───────────────────────────────────────────────────────────────
function buildCatalog(filter = '') {
  const grid = document.getElementById('catalog-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const q = filter.toLowerCase();

  COUNTRIES.forEach(c => {
    const items = CATALOG.filter(f => f.country === c.code && (
      !q || f.name.toLowerCase().includes(q) || f.desc.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    ));
    if (!items.length) return;
    const block = document.createElement('div');
    block.className = 'catalog-country-block fade-in';
    const flagCode = c.code.toLowerCase();
    block.innerHTML = `
      <div class="catalog-country-header">
        <img class="country-flag-img" src="https://flagcdn.com/w80/${flagCode}.png" alt="${c.name}" style="width:32px;height:22px;border-radius:3px;border:none"/>
        <span class="catalog-country-name">${c.name}</span>
      </div>
      <div class="catalog-items-list">
        ${items.map(f => `
          <div class="catalog-item">
            <span class="catalog-item-icon">${f.icon}</span>
            <div class="catalog-item-info">
              <div class="catalog-item-name">${f.name}</div>
              <div class="catalog-item-desc">${f.desc}</div>
              <span class="catalog-item-type">${f.type}</span>
            </div>
          </div>`).join('')}
      </div>`;
    grid.appendChild(block);
    requestAnimationFrame(() => block.classList.add('visible'));
  });
}

function filterCatalog(val) {
  catalogFilter = val;
  buildCatalog(val);
}

// ── Scroll Animations ─────────────────────────────────────────────────────
function initScrollEffects() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.step-card, .fade-in').forEach(el => obs.observe(el));
}

function initNavScroll() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });
}

function toggleMobileMenu() {
  document.getElementById('mobile-menu').classList.toggle('open');
}

// ── Toast ─────────────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

// ── Request a Food ────────────────────────────────────────────────────────
function buildRequestCountrySelect() {
  const sel = document.getElementById('req-country');
  if (!sel) return;
  COUNTRIES.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.code;
    opt.textContent = c.name;
    sel.appendChild(opt);
  });
}

function submitRequest(e) {
  e.preventDefault();
  const code = document.getElementById('req-country').value;
  const country = COUNTRIES.find(c => c.code === code) || {};
  const req = {
    id: 'req_' + Date.now(),
    food: document.getElementById('req-food').value.trim(),
    country: code,
    countryName: country.name || code,
    location: document.getElementById('req-location').value.trim(),
    contact: document.getElementById('req-contact').value.trim(),
    note: document.getElementById('req-note').value.trim(),
    date: new Date().toISOString().split('T')[0],
  };
  allRequests.unshift(req);
  saveRequests();
  renderRequests();
  document.getElementById('request-form').reset();
  showToast('📣 Your request is posted! Locals will reach out if they have it.');
}

function renderRequests() {
  const list = document.getElementById('requests-list');
  const count = document.getElementById('req-count');
  if (!list) return;
  if (count) count.textContent = allRequests.length;
  if (!allRequests.length) {
    list.innerHTML = '<div class="req-empty">No open requests yet. Be the first!</div>';
    return;
  }
  list.innerHTML = allRequests.map(r => `
    <div class="req-card">
      <div class="req-food-name">🔍 ${r.food}</div>
      <div class="req-meta">From: ${r.countryName || r.country} &nbsp;·&nbsp; 📍 ${r.location} &nbsp;·&nbsp; ${formatDate(r.date)}</div>
      ${r.note ? `<div class="req-note">${r.note}</div>` : ''}
      <button class="req-contact-btn" onclick="contactLister('${r.contact}','${r.food}')">📩 I Have This!</button>
    </div>`).join('');
}

// ── My Listings ───────────────────────────────────────────────────────────
function renderMyListings() {
  const grid = document.getElementById('my-listings-grid');
  if (!grid) return;
  const mine = allListings.filter(l => !l.id.startsWith('demo'));
  grid.innerHTML = '';
  if (!mine.length) {
    grid.innerHTML = `<div class="my-empty-state"><div class="empty-icon">🏠</div><p>You haven't posted any listings yet.</p><button class="btn-primary" onclick="openPostModal()">Post Your First Listing</button></div>`;
    return;
  }
  mine.forEach(l => {
    const country = COUNTRIES.find(c => c.code === l.country) || {};
    const fc = (l.country || 'eu').toLowerCase();
    const card = document.createElement('div');
    card.className = 'my-listing-card fade-in';
    card.innerHTML = `
      <div class="my-listing-header">
        <img src="https://flagcdn.com/w80/${fc}.png" style="width:28px;height:20px;border-radius:3px;object-fit:cover" alt="${country.name||''}"/>
        <span class="my-listing-title">${l.food}</span>
        <span style="color:var(--gold);font-weight:700">€${l.fee}</span>
      </div>
      <div class="my-listing-body">
        <div class="my-listing-meta">📍 ${l.location} &nbsp;·&nbsp; ${catLabel(l.category)}</div>
        <div class="my-listing-meta">Posted ${formatDate(l.date)}</div>
        <div class="my-listing-actions">
          <button class="my-btn-edit" onclick="openDetailModal('${l.id}')">👁 View</button>
          <button class="my-btn-delete" onclick="deleteListing('${l.id}')">🗑️ Delete</button>
        </div>
      </div>`;
    grid.appendChild(card);
    requestAnimationFrame(() => card.classList.add('visible'));
  });
}

// ── Fee Range Track ───────────────────────────────────────────────────────
function updateFeeLabel() {
  const val = document.getElementById('fee-max')?.value || 50;
  const label = document.getElementById('fee-max-label');
  if (label) label.textContent = `€${val}`;
  updateRangeTrack();
}
function updateRangeTrack() {
  const el = document.getElementById('fee-max');
  if (!el) return;
  const pct = ((el.value - el.min) / (el.max - el.min)) * 100;
  el.style.background = `linear-gradient(90deg, var(--navy) ${pct}%, var(--gray-200) ${pct}%)`;
}

// ── Emoji Picker ──────────────────────────────────────────────────────────
const FOOD_EMOJIS = ['🍫','🍬','🍪','🥩','🍰','🍶','🍷','🧀','🥨','🍞','🧁','🍩','🥐','🥗','🫙','🫚','🍯','🥜','🍎','🌶️'];
function buildEmojiPicker() {
  const el = document.getElementById('emoji-picker');
  if (!el) return;
  el.innerHTML = '';
  FOOD_EMOJIS.forEach((e, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'emoji-opt' + (i === 0 ? ' selected' : '');
    btn.textContent = e;
    btn.onclick = () => {
      document.querySelectorAll('.emoji-opt').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      document.getElementById('form-emoji').value = e;
    };
    el.appendChild(btn);
  });
}

// ── Testimonials ──────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {emoji:'🇵🇱',name:'Monika R.',origin:'Warsaw → London',avatar:'🧑',text:'I\'d been in London for 3 years without Ptasie Mleczko. Found Katarzyna\'s listing on EuShop and nearly cried when I opened the box. Worth every penny of the finder\'s fee.',stars:5},
  {emoji:'🇳🇱',name:'Daan V.',origin:'Amsterdam → Berlin',avatar:'👨',text:'Nobody in Berlin understands drop (salty liquorice). EuShop connected me with Piet who had a whole bag. My German colleagues thought I was insane. I was in heaven.',stars:5},
  {emoji:'🇭🇺',name:'Eszter K.',origin:'Budapest → Vienna',avatar:'👩',text:'Túró Rudi kept refrigerated, fresh from Budapest. I found a listing 2km from my apartment. I\'ve since become a regular customer. EuShop is the best idea ever.',stars:5},
  {emoji:'🇮🇪',name:'Seán M.',origin:'Dublin → Munich',avatar:'🧔',text:'Tayto crisps. That\'s all I\'ll say. If you\'re Irish and living abroad, you already know. Found a box through EuShop and it genuinely made my week.',stars:5},
  {emoji:'🇸🇪',name:'Linnea B.',origin:'Stockholm → Paris',avatar:'👱',text:'Swedish bilar (foam cars) are my comfort food. Found a lister near Bastille who had 2kg. We ended up having fika together. EuShop is a community, not just a marketplace.',stars:5},
  {emoji:'🇷🇴',name:'Andrei P.',origin:'Cluj-Napoca → Brussels',avatar:'👦',text:'ROM chocolate is deeply tied to my childhood. I posted a request on EuShop and within 24 hours someone reached out saying they had 10 bars. Incredible.',stars:5},
];
function buildTestimonials() {
  const grid = document.getElementById('testimonials-grid');
  if (!grid) return;
  TESTIMONIALS.forEach((t, i) => {
    const card = document.createElement('div');
    card.className = 'testimonial-card fade-in';
    card.innerHTML = `
      <div class="testimonial-quote">❝</div>
      <p class="testimonial-text">${t.text}</p>
      <div class="testimonial-author">
        <div class="testimonial-avatar">${t.avatar}</div>
        <div>
          <div class="testimonial-name">${t.name} ${t.emoji}</div>
          <div class="testimonial-origin">${t.origin}</div>
          <div class="testimonial-stars">${'★'.repeat(t.stars)}</div>
        </div>
      </div>`;
    grid.appendChild(card);
    setTimeout(() => card.classList.add('visible'), i * 100);
  });
}

// ── FAQ ───────────────────────────────────────────────────────────────────
const FAQS = [
  {q:'Is EuShop free to use?', a:'Yes, completely free. EuShop is a community platform. We don\'t charge any fees — the finder\'s fee goes directly from buyer to seller, agreed between them.'},
  {q:'How does the finder\'s fee work?', a:'When you list a food, you set your own price. It\'s not a commission — it\'s whatever you decide is fair for sourcing, carrying, or storing the item. Most listings are €4–€15.'},
  {q:'How do I contact a lister?', a:'Click "View Details" on any listing, then hit the Contact button. If they left an email, it opens your mail client. If they left a WhatsApp number, it opens a pre-filled WhatsApp message.'},
  {q:'Can I list food I\'ve brought from home?', a:'Absolutely — that\'s the whole idea! Brought back some Mozartkugeln, a bag of drop, or some Fazer Blue from your last trip home? List it for other expats to find.'},
  {q:'Is this legal?', a:'Selling small quantities of food between private individuals for personal consumption is generally fine in most EU countries. Always check your local rules. EuShop is not responsible for transactions — we\'re just connecting people.'},
  {q:'What countries does EuShop cover?', a:'All 27 EU member states, plus Norway, Iceland, and Switzerland. The catalog includes specialty foods from every country with descriptions and categories.'},
  {q:'Can I delete my listing?', a:'Yes! Open the listing\'s detail view and click "Delete My Listing". It\'s instantly removed from the public feed and from your My Listings section.'},
  {q:'What if I can\'t find what I\'m looking for?', a:'Use the "Request a Food" section to post what you\'re looking for. Anyone who has it can reach out to you directly. It\'s a reverse listing!'},
];
function buildFAQ() {
  const list = document.getElementById('faq-list');
  if (!list) return;
  FAQS.forEach((f, i) => {
    const item = document.createElement('div');
    item.className = 'faq-item';
    item.innerHTML = `
      <button class="faq-question" id="faq-q-${i}" onclick="toggleFAQ(${i})">
        ${f.q}
        <span class="faq-chevron">▾</span>
      </button>
      <div class="faq-answer" id="faq-a-${i}">
        <p>${f.a}</p>
      </div>`;
    list.appendChild(item);
  });
}
function toggleFAQ(i) {
  const q = document.getElementById('faq-q-' + i);
  const a = document.getElementById('faq-a-' + i);
  const isOpen = a.classList.contains('open');
  // Close all
  document.querySelectorAll('.faq-answer').forEach(el => el.classList.remove('open'));
  document.querySelectorAll('.faq-question').forEach(el => el.classList.remove('open'));
  if (!isOpen) { q.classList.add('open'); a.classList.add('open'); }
}

// ── Back to Top ───────────────────────────────────────────────────────────
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    btn?.classList.toggle('visible', window.scrollY > 400);
  });
}

// ── Cookie Banner ─────────────────────────────────────────────────────────
function initCookieBanner() {
  if (localStorage.getItem('eushop_cookies')) return;
  setTimeout(() => document.getElementById('cookie-banner')?.classList.add('show'), 1800);
}
function acceptCookies() {
  localStorage.setItem('eushop_cookies', '1');
  const b = document.getElementById('cookie-banner');
  if (b) { b.style.transform = 'translateY(100%)'; setTimeout(() => b.remove(), 400); }
  showToast('🍪 Cookies accepted — now go find some actual speculoos!');
}

// ── "Also from Country" in detail modal ──────────────────────────────────
function buildAlsoFrom(countryCode, currentId) {
  const others = CATALOG.filter(f => f.country === countryCode).slice(0, 8);
  if (!others.length) return '';
  const chips = others.map(f =>
    `<span class="also-chip" onclick="filterByFoodName('${f.name.replace(/'/g, "'")}')">${f.icon} ${f.name}</span>`
  ).join('');
  const c = COUNTRIES.find(x => x.code === countryCode);
  return `<div class="also-from">
    <div class="also-from-title">More from ${c?.name || countryCode}</div>
    <div class="also-from-chips">${chips}</div>
  </div>`;
}
function filterByFoodName(name) {
  closeDetailModal();
  const input = document.getElementById('listings-search');
  if (input) { input.value = name; renderListings(); }
  document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' });
}

 / /   D a r k   M o d e 
 f u n c t i o n   i n i t D a r k M o d e ( )   { 
     c o n s t   s a v e d   =   l o c a l S t o r a g e . g e t I t e m ( ' e u s h o p _ t h e m e ' ) ; 
     i f   ( s a v e d   = = =   ' d a r k ' )   a p p l y D a r k ( t r u e ,   f a l s e ) ; 
 } 
 f u n c t i o n   t o g g l e D a r k M o d e ( )   { 
     c o n s t   i s D a r k   =   d o c u m e n t . d o c u m e n t E l e m e n t . g e t A t t r i b u t e ( ' d a t a - t h e m e ' )   = = =   ' d a r k ' ; 
     a p p l y D a r k ( ! i s D a r k ) ; 
 } 
 f u n c t i o n   a p p l y D a r k ( o n ,   s a v e   =   t r u e )   { 
     c o n s t   b t n   =   d o c u m e n t . g e t E l e m e n t B y I d ( ' d a r k - m o d e - t o g g l e ' ) ; 
     i f   ( o n )   { 
         d o c u m e n t . d o c u m e n t E l e m e n t . s e t A t t r i b u t e ( ' d a t a - t h e m e ' ,   ' d a r k ' ) ; 
         i f   ( b t n )   b t n . t e x t C o n t e n t   =   S t r i n g . f r o m C o d e P o i n t ( 0 x 2 6 0 0 , 0 x F E 0 F ) ; 
         i f   ( s a v e )   l o c a l S t o r a g e . s e t I t e m ( ' e u s h o p _ t h e m e ' ,   ' d a r k ' ) ; 
     }   e l s e   { 
         d o c u m e n t . d o c u m e n t E l e m e n t . r e m o v e A t t r i b u t e ( ' d a t a - t h e m e ' ) ; 
         i f   ( b t n )   b t n . t e x t C o n t e n t   =   S t r i n g . f r o m C o d e P o i n t ( 0 x 1 F 3 1 9 ) ; 
         i f   ( s a v e )   l o c a l S t o r a g e . s e t I t e m ( ' e u s h o p _ t h e m e ' ,   ' l i g h t ' ) ; 
     } 
 } 
 
 / /   V i e w   C o u n t e r 
 f u n c t i o n   g e t V i e w s ( )   {   r e t u r n   J S O N . p a r s e ( l o c a l S t o r a g e . g e t I t e m ( ' e u s h o p _ v i e w s ' )   | |   ' { } ' ) ;   } 
 f u n c t i o n   i n c r e m e n t V i e w ( i d )   { 
     c o n s t   v   =   g e t V i e w s ( ) ;   v [ i d ]   =   ( v [ i d ]   | |   0 )   +   1 ; 
     l o c a l S t o r a g e . s e t I t e m ( ' e u s h o p _ v i e w s ' ,   J S O N . s t r i n g i f y ( v ) ) ;   r e t u r n   v [ i d ] ; 
 } 
 f u n c t i o n   g e t V i e w C o u n t ( i d )   {   r e t u r n   g e t V i e w s ( ) [ i d ]   | |   0 ;   } 
 f u n c t i o n   i s H o t ( i d )   {   r e t u r n   g e t V i e w C o u n t ( i d )   > =   5 ;   } 
 f u n c t i o n   i s N e w ( l i s t i n g )   { 
     i f   ( ! l i s t i n g . d a t e )   r e t u r n   f a l s e ; 
     c o n s t   a g e   =   ( D a t e . n o w ( )   -   n e w   D a t e ( l i s t i n g . d a t e ) . g e t T i m e ( ) )   /   ( 1 0 0 0   *   6 0   *   6 0 ) ; 
     r e t u r n   a g e   <   4 8 ; 
 } 
 
 / /   R e c e n t l y   V i e w e d 
 f u n c t i o n   g e t R V ( )   {   r e t u r n   J S O N . p a r s e ( l o c a l S t o r a g e . g e t I t e m ( ' e u s h o p _ r v ' )   | |   ' [ ] ' ) ;   } 
 f u n c t i o n   a d d T o R V ( i d )   { 
     l e t   r v   =   g e t R V ( ) . f i l t e r ( x   = >   x   ! = =   i d ) ; 
     r v . u n s h i f t ( i d ) ;   i f   ( r v . l e n g t h   >   8 )   r v   =   r v . s l i c e ( 0 ,   8 ) ; 
     l o c a l S t o r a g e . s e t I t e m ( ' e u s h o p _ r v ' ,   J S O N . s t r i n g i f y ( r v ) ) ; 
     r e n d e r R e c e n t l y V i e w e d ( ) ; 
 } 
 f u n c t i o n   c l e a r R e c e n t l y V i e w e d ( )   { 
     l o c a l S t o r a g e . r e m o v e I t e m ( ' e u s h o p _ r v ' ) ; 
     c o n s t   b a r   =   d o c u m e n t . g e t E l e m e n t B y I d ( ' r e c e n t l y - v i e w e d - b a r ' ) ; 
     i f   ( b a r )   b a r . s t y l e . d i s p l a y   =   ' n o n e ' ; 
 } 
 f u n c t i o n   r e n d e r R e c e n t l y V i e w e d ( )   { 
     c o n s t   b a r   =   d o c u m e n t . g e t E l e m e n t B y I d ( ' r e c e n t l y - v i e w e d - b a r ' ) ; 
     c o n s t   t r a c k   =   d o c u m e n t . g e t E l e m e n t B y I d ( ' r v - t r a c k ' ) ; 
     i f   ( ! b a r   | |   ! t r a c k )   r e t u r n ; 
     c o n s t   r v   =   g e t R V ( ) . m a p ( i d   = >   a l l L i s t i n g s . f i n d ( l   = >   l . i d   = = =   i d ) ) . f i l t e r ( B o o l e a n ) ; 
     i f   ( ! r v . l e n g t h )   {   b a r . s t y l e . d i s p l a y   =   ' n o n e ' ;   r e t u r n ;   } 
     b a r . s t y l e . d i s p l a y   =   ' ' ; 
     t r a c k . i n n e r H T M L   =   r v . m a p ( l   = >   { 
         c o n s t   f c   =   ( l . c o u n t r y   | |   ' e u ' ) . t o L o w e r C a s e ( ) ; 
         r e t u r n   ' < d i v   c l a s s = " r v - p i l l "   o n c l i c k = " o p e n D e t a i l M o d a l ( \ ' '   +   l . i d   +   ' \ ' ) " > '   + 
             ' < i m g   s r c = " h t t p s : / / f l a g c d n . c o m / w 4 0 / '   +   f c   +   ' . p n g "   a l t = " " / > '   + 
             ' < s p a n > '   +   ( l . e m o j i   | |   ' ' )   +   '   '   +   l . f o o d   +   ' < / s p a n > '   + 
             ' < s p a n   s t y l e = " c o l o r : v a r ( - - g r a y - 4 0 0 ) ; f o n t - s i z e : . 7 5 r e m " > E U R '   +   l . f e e   +   ' < / s p a n > '   + 
             ' < / d i v > ' ; 
     } ) . j o i n ( ' ' ) ; 
 } 
 
 / /   L i s t i n g   S t a t u s 
 f u n c t i o n   s e t L i s t i n g S t a t u s ( i d ,   s t a t u s )   { 
     c o n s t   l   =   a l l L i s t i n g s . f i n d ( x   = >   x . i d   = = =   i d ) ; 
     i f   ( ! l )   r e t u r n ; 
     l . s t a t u s   =   s t a t u s ;   s a v e L i s t i n g s ( ) ;   r e n d e r M y L i s t i n g s ( ) ;   r e n d e r L i s t i n g s ( ) ; 
     s h o w T o a s t ( ' S t a t u s   u p d a t e d :   '   +   s t a t u s ) ; 
 } 
 
 / /   C h i p   C o u n t s 
 f u n c t i o n   u p d a t e C h i p C o u n t s ( )   { 
     [ ' c h o c o l a t e ' , ' c a n d y ' , ' s a v o r y ' , ' b i s c u i t ' , ' s w e e t ' , ' d r i n k ' ] . f o r E a c h ( c a t   = >   { 
         c o n s t   b t n   =   d o c u m e n t . g e t E l e m e n t B y I d ( ' c h i p - '   +   c a t ) ; 
         i f   ( ! b t n )   r e t u r n ; 
         c o n s t   c o u n t   =   a l l L i s t i n g s . f i l t e r ( l   = >   l . c a t e g o r y   = = =   c a t ) . l e n g t h ; 
         l e t   s   =   b t n . q u e r y S e l e c t o r ( ' . c h i p - c o u n t ' ) ; 
         i f   ( ! s )   {   s   =   d o c u m e n t . c r e a t e E l e m e n t ( ' s p a n ' ) ;   s . c l a s s N a m e   =   ' c h i p - c o u n t ' ;   b t n . a p p e n d C h i l d ( s ) ;   } 
         s . t e x t C o n t e n t   =   c o u n t ; 
     } ) ; 
     c o n s t   f a v B t n   =   d o c u m e n t . g e t E l e m e n t B y I d ( ' c h i p - f a v s ' ) ; 
     i f   ( f a v B t n )   { 
         l e t   s   =   f a v B t n . q u e r y S e l e c t o r ( ' . c h i p - c o u n t ' ) ; 
         i f   ( ! s )   {   s   =   d o c u m e n t . c r e a t e E l e m e n t ( ' s p a n ' ) ;   s . c l a s s N a m e   =   ' c h i p - c o u n t ' ;   f a v B t n . a p p e n d C h i l d ( s ) ;   } 
         s . t e x t C o n t e n t   =   f a v o r i t e s . s i z e ; 
     } 
 } 
 
 / /   D e l i v e r y   T o g g l e 
 f u n c t i o n   s e t D e l i v e r y ( v a l )   { 
     c o n s t   h i d d e n   =   d o c u m e n t . g e t E l e m e n t B y I d ( ' f o r m - d e l i v e r y ' ) ; 
     i f   ( h i d d e n )   h i d d e n . v a l u e   =   v a l ; 
     [ ' c o l l e c t i o n ' , ' d e l i v e r y ' , ' b o t h ' ] . f o r E a c h ( v   = >   { 
         c o n s t   e l   =   d o c u m e n t . g e t E l e m e n t B y I d ( ' d t o g g l e - '   +   v ) ; 
         i f   ( e l )   e l . c l a s s L i s t . t o g g l e ( ' a c t i v e ' ,   v   = = =   v a l ) ; 
     } ) ; 
 } 
 
 / /   A n i m a t e d   H e r o   C o u n t e r 
 f u n c t i o n   a n i m a t e C o u n t e r ( e l ,   t a r g e t ,   d u r a t i o n )   { 
     i f   ( ! e l )   r e t u r n ; 
     d u r a t i o n   =   d u r a t i o n   | |   1 2 0 0 ; 
     c o n s t   s t e p   =   t a r g e t   /   ( d u r a t i o n   /   1 6 ) ; 
     l e t   c u r   =   0 ; 
     c o n s t   t   =   s e t I n t e r v a l ( f u n c t i o n ( )   { 
         c u r   =   M a t h . m i n ( c u r   +   s t e p ,   t a r g e t ) ; 
         e l . t e x t C o n t e n t   =   M a t h . f l o o r ( c u r ) ; 
         i f   ( c u r   > =   t a r g e t )   c l e a r I n t e r v a l ( t ) ; 
     } ,   1 6 ) ; 
 } 
 f u n c t i o n   r u n H e r o C o u n t e r s ( )   { 
     c o n s t   o b s   =   n e w   I n t e r s e c t i o n O b s e r v e r ( f u n c t i o n ( e n t r i e s )   { 
         e n t r i e s . f o r E a c h ( f u n c t i o n ( e )   { 
             i f   ( e . i s I n t e r s e c t i n g )   { 
                 a n i m a t e C o u n t e r ( d o c u m e n t . g e t E l e m e n t B y I d ( ' s t a t - l i s t i n g s ' ) ,   a l l L i s t i n g s . l e n g t h ) ; 
                 a n i m a t e C o u n t e r ( d o c u m e n t . g e t E l e m e n t B y I d ( ' s t a t - f o o d s ' ) ,   2 0 0 ) ; 
                 a n i m a t e C o u n t e r ( d o c u m e n t . g e t E l e m e n t B y I d ( ' s t a t - c o u n t r i e s ' ) ,   2 7 ) ; 
                 o b s . d i s c o n n e c t ( ) ; 
             } 
         } ) ; 
     } ,   {   t h r e s h o l d :   0 . 5   } ) ; 
     c o n s t   h e r o   =   d o c u m e n t . g e t E l e m e n t B y I d ( ' h e r o - s t a t s ' ) ; 
     i f   ( h e r o )   o b s . o b s e r v e ( h e r o ) ; 
 } 
 