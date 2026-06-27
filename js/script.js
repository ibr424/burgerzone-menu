// ── NAV ──
function go(id, btn) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  var sec = document.getElementById(id);
  if (!sec) return;
  var navH = (document.querySelector('.nav-outer') || {offsetHeight:56}).offsetHeight;
  var top = sec.getBoundingClientRect().top + window.pageYOffset - navH - 6;
  window.scrollTo({ top: top, behavior: 'smooth' });
}

// ── SCROLL SPY ──
(function() {
  function initSpy() {
    var sections = document.querySelectorAll('.sec');
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          document.querySelectorAll('.nav-btn').forEach(function(b) {
            var m = /go\('(\w+)'/.exec(b.getAttribute('onclick') || '');
            b.classList.toggle('on', !!(m && m[1] === id));
          });
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });
    sections.forEach(function(s) { observer.observe(s); });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSpy);
  } else {
    initSpy();
  }
})();

// ── LANGUAGE ──
function setLang(lang) {
  var ar = lang === 'ar';
  document.documentElement.lang = lang;
  document.documentElement.dir = ar ? 'rtl' : 'ltr';
  document.body.classList.toggle('ar', ar);
  document.getElementById('btn-en').classList.toggle('on', !ar);
  document.getElementById('btn-ar').classList.toggle('on', ar);
  document.querySelectorAll('[data-en]').forEach(function(el) {
    var val = el.getAttribute(ar ? 'data-ar' : 'data-en');
    if (!val) return;
    if (el.tagName === 'BUTTON' || el.classList.contains('nav-btn')) el.textContent = val;
    else el.innerHTML = val;
  });
  document.querySelectorAll('.cname').forEach(function(el) {
    var val = el.getAttribute(ar ? 'data-ar' : 'data-en');
    if (val) el.textContent = val;
  });
  updateTypeUI();
  renderCart();
}

// ── ORDER NUMBERS ──
function todayKey() { return new Date().toISOString().slice(0,10); }
function peekNum() {
  var s = JSON.parse(localStorage.getItem('fb_o') || '{"d":"","n":0}');
  return String((s.d === todayKey() ? s.n : 0) + 1).padStart(3,'0');
}
function nextNum() {
  var s = JSON.parse(localStorage.getItem('fb_o') || '{"d":"","n":0}');
  if (s.d !== todayKey()) { s.d = todayKey(); s.n = 0; }
  s.n++;
  localStorage.setItem('fb_o', JSON.stringify(s));
  return String(s.n).padStart(3,'0');
}

// ── ORDER TYPE ──
var orderType = 'dine';
function setType(t, btn) {
  orderType = t;
  document.querySelectorAll('.ot-btn').forEach(function(b){b.classList.remove('on');});
  btn.classList.add('on');
  updateTypeUI();
}
function updateTypeUI() {
  var ar = document.body.classList.contains('ar');
  var lbl = document.getElementById('typeLabel');
  var inp = document.getElementById('typeInput');
  if (!lbl || !inp) return;
  if (orderType === 'dine') {
    lbl.textContent = ar ? 'رقم الطاولة' : 'Table Number';
    inp.placeholder = ar ? 'مثال: طاولة 5' : 'e.g. Table 5';
  } else if (orderType === 'pickup') {
    lbl.textContent = ar ? 'اسمك للاستلام' : 'Your Name for Pickup';
    inp.placeholder = ar ? 'اكتب اسمك' : 'Enter your name';
  } else {
    lbl.textContent = ar ? 'عنوان التوصيل' : 'Delivery Address';
    inp.placeholder = ar ? 'اكتب عنوانك كاملاً' : 'Enter your full address';
  }
}

// ── CART ──
var WA = '971509605007';
var cart = {};

// ── ITEM MODAL ──
var _mBtn = null, _mQty = 1;

function addItem(btn) {
  var ar = document.body.classList.contains('ar');
  var card = btn.closest('.card');
  var cname = card.querySelector('.cname');
  var name   = cname.getAttribute('data-en') || cname.textContent.trim();
  var arName = cname.getAttribute('data-ar') || name;
  var price  = parseInt(card.dataset.price) || 0;
  var img    = card.querySelector('img') ? card.querySelector('img').src : '';
  var desc   = card.querySelector('.cdesc') ? card.querySelector('.cdesc').textContent.trim() : '';
  var badge  = card.querySelector('.badge');
  _mBtn = btn; _mQty = 1;
  var imgEl = document.getElementById('imImg');
  imgEl.innerHTML = (img
    ? '<img src="'+img+'">'
    : '<div class="im-img-emoji">🥗</div>') +
    '<button class="im-close" onclick="closeItemModal()">✕</button>';
  document.getElementById('imBadgeRow').innerHTML = badge ? badge.outerHTML : '';
  document.getElementById('imName').textContent = ar ? arName : name;
  document.getElementById('imDesc').textContent = desc;
  document.getElementById('imPrice').textContent = price + ' AED';
  document.getElementById('imQty').textContent = 1;
  document.getElementById('imQtyLbl').textContent = ar ? 'الكمية' : 'Quantity';
  _updateImBtn(price);
  document.getElementById('itemModal').classList.add('open');
}
function closeItemModal() {
  document.getElementById('itemModal').classList.remove('open');
  _mBtn = null;
}
function chgMQty(d) {
  _mQty = Math.max(1, _mQty + d);
  document.getElementById('imQty').textContent = _mQty;
  if (_mBtn) {
    var price = parseInt(_mBtn.closest('.card').dataset.price) || 0;
    _updateImBtn(price);
  }
}
function _updateImBtn(price) {
  var ar = document.body.classList.contains('ar');
  document.getElementById('imAddBtn').textContent =
    (ar ? 'أضف للسلة — ' : 'Add to Cart — ') + (_mQty * price) + ' AED';
}
function addFromModal() {
  if (!_mBtn) return;
  var ar = document.body.classList.contains('ar');
  var card = _mBtn.closest('.card');
  var cname = card.querySelector('.cname');
  var name   = cname.getAttribute('data-en') || cname.textContent.trim();
  var arName = cname.getAttribute('data-ar') || name;
  var price  = parseInt(card.dataset.price) || 0;
  var img    = card.querySelector('img') ? card.querySelector('img').src : '';
  var id     = 'i_' + name.replace(/\s+/g,'_');
  if (cart[id]) cart[id].qty += _mQty;
  else cart[id] = {name:name, arName:arName, price:price, qty:_mQty, img:img};
  updateFab();
  closeItemModal();
  _mBtn = null;
}

function updateFab() {
  var total = Object.values(cart).reduce(function(s,i){return s+i.qty;},0);
  var fab = document.getElementById('cartFab');
  document.getElementById('cartBadge').textContent = total;
  if (total > 0) fab.classList.add('show'); else fab.classList.remove('show');
  var numEl = document.getElementById('orderNumVal');
  if (numEl) numEl.textContent = '#' + peekNum();
}

function renderCart() {
  var ar = document.body.classList.contains('ar');
  var keys = Object.keys(cart);
  var body = document.getElementById('cartBody');
  var bottom = document.getElementById('cartBottom');
  var totalEl = document.getElementById('cartTotal');

  if (keys.length === 0) {
    body.innerHTML = '<div class="cart-empty"><div class="cart-empty-icon">🛒</div><div>' + (ar?'سلتك فارغة — أضف شيئاً!':'Your cart is empty — add something!') + '</div></div>';
    bottom.style.display = 'none';
    return;
  }

  bottom.style.display = 'block';
  var total = keys.reduce(function(s,k){return s+cart[k].qty*cart[k].price;},0);
  totalEl.textContent = total + ' AED';
  document.getElementById('orderNumVal').textContent = '#' + peekNum();

  body.innerHTML = '<div class="cart-items">' + keys.map(function(id) {
    var it = cart[id];
    var displayName = ar ? (it.arName || it.name) : it.name;
    return '<div class="cart-item">' +
      '<img class="ci-img" src="' + it.img + '">' +
      '<div class="ci-info"><div class="ci-name">' + it.name + '</div><div class="ci-price">' + (it.price*it.qty) + ' AED</div></div>' +
      '<div class="ci-controls">' +
        '<button class="ci-btn" onclick="changeQty(\'' + id + '\',-1)">&#8722;</button>' +
        '<span class="ci-qty">' + it.qty + '</span>' +
        '<button class="ci-btn" onclick="changeQty(\'' + id + '\',1)">+</button>' +
      '</div></div>';
  }).join('') + '</div>';
}

function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) delete cart[id];
  updateFab();
  renderCart();
}

function openCart() {
  document.getElementById('cartOverlay').classList.add('open');
  renderCart();
  updateTypeUI();
}
function closeCart() { document.getElementById('cartOverlay').classList.remove('open'); }
function closeOutside(e) { if (e.target === document.getElementById('cartOverlay')) closeCart(); }

function sendOrder() {
  var keys = Object.keys(cart);
  if (!keys.length) return;
  var ar = document.body.classList.contains('ar');
  var num = nextNum();
  var typeVal = document.getElementById('typeInput').value.trim();
  var notes = document.getElementById('cartNotes').value.trim();
  var total = keys.reduce(function(s,k){return s+cart[k].qty*cart[k].price;},0);
  var typeLabels = {dine: ar?'🍽️ داخل المطعم':'🍽️ Dine In', pickup: ar?'🛍️ استلام':'🛍️ Pickup', delivery: ar?'🚗 توصيل':'🚗 Delivery'};
  var inputLabels = {dine: ar?'الطاولة':'Table', pickup: ar?'الاسم':'Name', delivery: ar?'العنوان':'Address'};

  var msg = ar
    ? '🥗 *طلب جديد — FitBites*\n🔢 *رقم الطلب: #' + num + '*\n' + typeLabels[orderType]
    : '🥗 *New Order — FitBites*\n🔢 *Order #' + num + '*\n' + typeLabels[orderType];

  if (typeVal) msg += '\n' + inputLabels[orderType] + ': ' + typeVal;
  msg += '\n\n';
  keys.forEach(function(id){
    var it = cart[id];
    msg += '• ' + it.name + ' x' + it.qty + ' — ' + (it.price*it.qty) + ' AED\n';
  });
  msg += ar ? '\n💰 *الإجمالي: ' + total + ' AED*' : '\n💰 *Total: ' + total + ' AED*';
  if (notes) msg += (ar?'\n📝 *ملاحظات:* ':'\n📝 *Notes:* ') + notes;

  window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(msg), '_blank');

  closeCart();
  document.getElementById('sTitle').textContent = ar ? 'تم إرسال طلبك! 🎉' : 'Order Sent! 🎉';
  document.getElementById('sSub').textContent = ar ? 'رقم طلبك اليوم هو' : "Today's order number";
  document.getElementById('sNum').textContent = '#' + num;
  document.getElementById('sDetail').textContent = typeLabels[orderType] + (typeVal?' · '+inputLabels[orderType]+': '+typeVal:'') + ' · ' + total + ' AED';
  document.getElementById('sClose').textContent = ar ? 'تم ✓' : 'Done ✓';
  document.getElementById('successOverlay').classList.add('show');

  cart = {};
  document.getElementById('cartNotes').value = '';
  document.getElementById('typeInput').value = '';
  updateFab();
}

function closeSuccess() { document.getElementById('successOverlay').classList.remove('show'); }

// ══════════════════════════════════════════════════════════════
// ADMIN PANEL
// ══════════════════════════════════════════════════════════════

var ADMIN_PASS = '123456';
var isAdmin = false;
var _adb = null;

var THEMES = {
  green:  {p:'#16A34A',pl:'#22C55E',pp:'#F0FDF4',pm:'#DCFCE7',pd:'#14532D'},
  blue:   {p:'#2563EB',pl:'#3B82F6',pp:'#EFF6FF',pm:'#DBEAFE',pd:'#1E3A8A'},
  purple: {p:'#7C3AED',pl:'#8B5CF6',pp:'#F5F3FF',pm:'#EDE9FE',pd:'#4C1D95'},
  orange: {p:'#EA580C',pl:'#F97316',pp:'#FFF7ED',pm:'#FFEDD5',pd:'#7C2D12'},
  teal:   {p:'#0D9488',pl:'#14B8A6',pp:'#F0FDFA',pm:'#CCFBF1',pd:'#134E4A'},
  red:    {p:'#DC2626',pl:'#EF4444',pp:'#FEF2F2',pm:'#FEE2E2',pd:'#7F1D1D'},
  pink:   {p:'#DB2777',pl:'#EC4899',pp:'#FDF2F8',pm:'#FCE7F3',pd:'#831843'},
  navy:   {p:'#1E40AF',pl:'#2563EB',pp:'#EFF6FF',pm:'#DBEAFE',pd:'#1E3A8A'}
};

function _adbGet() {
  if (!_adb) {
    try { _adb = JSON.parse(localStorage.getItem('fitbites_admin_v1')) || {}; }
    catch(e) { _adb = {}; }
  }
  if (!_adb.items) _adb.items = {};
  if (!_adb.newItems) _adb.newItems = [];
  if (!_adb.newCats) _adb.newCats = [];
  if (!_adb.hiddenCats) _adb.hiddenCats = [];
  return _adb;
}

function _adbSave() {
  localStorage.setItem('fitbites_admin_v1', JSON.stringify(_adb));
}

function _esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Assign stable admin IDs to all existing cards
function _ensureCardIds() {
  document.querySelectorAll('.card:not([data-aid])').forEach(function(card, i) {
    var ne = card.querySelector('.cname');
    var base = ne ? (ne.getAttribute('data-en') || ne.textContent).trim().replace(/[^a-z0-9]/gi,'_').toLowerCase() : 'item';
    card.dataset.aid = base + '_' + i;
  });
}

// Apply stored admin data to DOM on page load
function _applyAdminDB() {
  var db = _adbGet();

  // Add data-cat attrs to existing nav buttons
  document.querySelectorAll('.nav-btn[onclick]').forEach(function(btn) {
    var m = btn.getAttribute('onclick').match(/go\('([^']+)'/);
    if (m && !btn.dataset.cat) btn.dataset.cat = m[1];
  });

  if (db.wa) WA = db.wa;
  if (db.logo) _setLogo(db.logo);
  if (db.theme) _applyTheme(db.theme);
  if (db.heroName) _setHeroName(db.heroName);
  if (db.tagline) {
    var tl = document.querySelector('.hero-tag');
    if (tl) { tl.setAttribute('data-en', db.tagline); tl.textContent = db.tagline; }
  }
  if (db.footerInfo) {
    var fi = document.querySelector('.footer-info');
    if (fi) { fi.setAttribute('data-en', db.footerInfo); fi.textContent = db.footerInfo; }
  }
  if (db.wa) {
    var waLink = document.querySelector('.wa-cta');
    if (waLink) waLink.href = 'https://wa.me/' + db.wa;
  }

  _ensureCardIds();

  // Apply item changes
  Object.keys(db.items).forEach(function(aid) {
    var card = document.querySelector('[data-aid="' + aid + '"]');
    if (!card) return;
    var d = db.items[aid];
    if (d.deleted) { card.remove(); return; }
    if (d.hidden) card.classList.add('ap-hidden');
    if (d.price != null) {
      card.dataset.price = d.price;
      var pe = card.querySelector('.cprice');
      if (pe) pe.innerHTML = d.price + ' <small>AED</small>';
    }
    if (d.nameEn) {
      var ne = card.querySelector('.cname');
      if (ne) { ne.setAttribute('data-en', d.nameEn); ne.textContent = d.nameEn; }
    }
    if (d.desc) {
      var de = card.querySelector('.cdesc');
      if (de) { de.setAttribute('data-en', d.desc); de.textContent = d.desc; }
    }
    if (d.img) {
      var ie = card.querySelector('.cimg img');
      if (ie) ie.src = d.img;
    }
  });

  // Render new items
  db.newItems.forEach(function(item) {
    if (item.deleted) return;
    if (document.querySelector('[data-aid="ni_' + item.id + '"]')) return;
    var sec = document.getElementById(item.catId);
    if (!sec) return;
    var grid = sec.querySelector('.grid');
    if (grid) grid.insertAdjacentHTML('beforeend', _buildNewCard(item));
  });

  // Render new categories
  db.newCats.forEach(function(cat) {
    if (!document.getElementById(cat.id)) {
      _addCatSection(cat);
      _addCatNavBtn(cat);
    }
  });

  // Hidden categories
  db.hiddenCats.forEach(function(catId) {
    var btn = document.querySelector('.nav-btn[data-cat="' + catId + '"]');
    if (btn) btn.style.display = 'none';
  });
}

function _buildNewCard(item) {
  var imgPart = item.img
    ? '<img src="' + _esc(item.img) + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">'
    : '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:40px;">🍽️</div>';
  return '<div class="card" data-price="' + (item.price||0) + '" data-aid="ni_' + item.id + '"' + (item.hidden?' style="display:none"':'') + '>' +
    '<div class="cimg">' + imgPart + '</div>' +
    '<div class="cbody">' +
    '<div class="cname" data-en="' + _esc(item.nameEn) + '"' + (item.nameAr?' data-ar="' + _esc(item.nameAr) + '"':'') + '>' + _esc(item.nameEn) + '</div>' +
    '<div class="cdesc" data-en="' + _esc(item.desc||'') + '">' + _esc(item.desc||'') + '</div>' +
    '<div class="cfoot"><div class="cprice">' + (item.price||0) + ' <small>AED</small></div>' +
    '<button class="add-btn" onclick="addItem(this)">+</button></div></div></div>';
}

function _addCatSection(cat) {
  var html = '<section class="sec" id="' + _esc(cat.id) + '">' +
    '<div class="sec-head"><div class="sec-title" data-en="' + _esc(cat.nameEn) + '">' + _esc(cat.nameEn) + '</div></div>' +
    '<div class="grid"></div></section>';
  var footer = document.querySelector('.footer');
  if (footer) footer.insertAdjacentHTML('beforebegin', html);
}

function _addCatNavBtn(cat) {
  var nav = document.querySelector('.nav');
  if (!nav) return;
  var btn = document.createElement('button');
  btn.className = 'nav-btn';
  btn.dataset.cat = cat.id;
  btn.setAttribute('data-en', cat.nameEn);
  if (cat.nameAr) btn.setAttribute('data-ar', cat.nameAr);
  btn.textContent = cat.nameEn;
  btn.onclick = function(){ go(cat.id, btn); };
  nav.appendChild(btn);
}

function _setLogo(src) {
  var hi = document.querySelector('.hero-icon');
  if (!hi) return;
  if (src && (src.startsWith('data:') || src.startsWith('http'))) {
    hi.innerHTML = '<img src="' + src + '" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">';
  } else if (src) {
    hi.textContent = src;
  }
}

function _setHeroName(name) {
  var hn = document.querySelector('.hero-name');
  if (!hn) return;
  var parts = name.split('|');
  if (parts.length === 2) {
    hn.innerHTML = _esc(parts[0]) + '<span>' + _esc(parts[1]) + '</span>';
  } else {
    hn.textContent = name;
  }
}

function _applyTheme(key) {
  var t = THEMES[key];
  if (!t) return;
  var r = document.documentElement.style;
  r.setProperty('--green', t.p);
  r.setProperty('--green-light', t.pl);
  r.setProperty('--green-pale', t.pp);
  r.setProperty('--green-mid', t.pm);
  r.setProperty('--green-dark', t.pd);
}

// ── Login ──
function openAdminLogin() {
  document.getElementById('adminPwInput').value = '';
  document.getElementById('adminPwError').textContent = '';
  document.getElementById('adminPwInput').classList.remove('err');
  document.getElementById('adminLoginBg').classList.add('open');
  setTimeout(function(){ document.getElementById('adminPwInput').focus(); }, 250);
}
function closeAdminLogin() {
  document.getElementById('adminLoginBg').classList.remove('open');
}
function checkAdminPw() {
  var val = document.getElementById('adminPwInput').value;
  if (val === ADMIN_PASS) {
    closeAdminLogin();
    openAdminPanel();
  } else {
    var inp = document.getElementById('adminPwInput');
    document.getElementById('adminPwError').textContent = 'Only Admin';
    inp.classList.add('err');
    inp.value = '';
    setTimeout(function(){ inp.classList.remove('err'); }, 400);
    setTimeout(function(){ inp.focus(); }, 100);
  }
}

// ── Panel ──
function openAdminPanel() {
  isAdmin = true;
  _ensureCardIds();
  document.getElementById('adminPanel').classList.add('open');
  document.getElementById('adminModeBar').classList.add('show');
  apSwitchTab('items');
}
function closeAdminPanel() {
  document.getElementById('adminPanel').classList.remove('open');
}
function apExitAdmin() {
  isAdmin = false;
  document.getElementById('adminModeBar').classList.remove('show');
  closeAdminPanel();
}
function apSwitchTab(name) {
  document.querySelectorAll('.ap-tab').forEach(function(t){ t.classList.toggle('on', t.dataset.tab === name); });
  document.querySelectorAll('.ap-sec').forEach(function(s){ s.classList.toggle('on', s.id === 'ap-' + name); });
  var fns = {items:apRenderItems, categories:apRenderCats, contact:apRenderContact, branding:apRenderBranding, text:apRenderText};
  if (fns[name]) fns[name]();
}

// ── ITEMS tab ──
function apRenderItems() {
  var db = _adbGet();
  var rows = '';
  document.querySelectorAll('.card[data-aid]').forEach(function(card) {
    var aid = card.dataset.aid;
    var ne = card.querySelector('.cname');
    var name = ne ? (ne.getAttribute('data-en') || ne.textContent.trim()) : 'Item';
    var price = card.dataset.price || '0';
    var sec = card.closest('.sec');
    var catId = sec ? sec.id : '—';
    var hidden = card.classList.contains('ap-hidden');
    rows += '<div class="ap-item">' +
      '<div class="ap-item-icon">🍽️</div>' +
      '<div class="ap-item-info">' +
        '<div class="ap-item-name">' + _esc(name) + '</div>' +
        '<div class="ap-item-meta">' + _esc(price) + ' AED · ' + _esc(catId) + '</div>' +
      '</div>' +
      '<div class="ap-item-actions">' +
        '<label class="ap-toggle" title="' + (hidden ? 'Show' : 'Hide') + '">' +
          '<input type="checkbox"' + (hidden ? '' : ' checked') + ' onchange="apToggleItem(\'' + _esc(aid) + '\',this.checked)">' +
          '<span class="ap-toggle-sl"></span>' +
        '</label>' +
        '<button class="ap-btn sm" onclick="apEditItem(\'' + _esc(aid) + '\')">✏️</button>' +
        '<button class="ap-btn sm red" onclick="apDeleteItem(\'' + _esc(aid) + '\')">🗑</button>' +
      '</div>' +
    '</div>';
  });
  document.getElementById('ap-items').innerHTML =
    '<div class="ap-card" style="margin-bottom:0"><div class="ap-card-title">Menu Items</div>' + (rows || '<div style="color:var(--gray);font-size:13px;">No items found.</div>') + '</div>' +
    '<div style="margin-top:12px;"><button class="ap-btn full" onclick="apOpenAddItem()">+ Add New Item</button></div>';
}

function apToggleItem(aid, visible) {
  var card = document.querySelector('[data-aid="' + aid + '"]');
  if (!card) return;
  var db = _adbGet();
  if (!db.items[aid]) db.items[aid] = {};
  db.items[aid].hidden = !visible;
  if (visible) card.classList.remove('ap-hidden');
  else card.classList.add('ap-hidden');
  if (aid.startsWith('ni_')) {
    var ni = db.newItems.find(function(i){ return 'ni_'+i.id === aid; });
    if (ni) ni.hidden = !visible;
  }
  _adbSave();
}

function apDeleteItem(aid) {
  if (!confirm('Delete this item? This cannot be undone.')) return;
  var card = document.querySelector('[data-aid="' + aid + '"]');
  if (card) card.remove();
  var db = _adbGet();
  if (!db.items[aid]) db.items[aid] = {};
  db.items[aid].deleted = true;
  if (aid.startsWith('ni_')) {
    var ni = db.newItems.find(function(i){ return 'ni_'+i.id === aid; });
    if (ni) ni.deleted = true;
  }
  _adbSave();
  apRenderItems();
}

function apEditItem(aid) {
  var card = document.querySelector('[data-aid="' + aid + '"]');
  if (!card) return;
  var ne = card.querySelector('.cname');
  var de = card.querySelector('.cdesc');
  var name = ne ? (ne.getAttribute('data-en') || ne.textContent.trim()) : '';
  var desc = de ? (de.getAttribute('data-en') || de.textContent.trim()) : '';
  var price = card.dataset.price || '';

  var modal = document.getElementById('apEditModal');
  modal.innerHTML = '<div class="ap-modal-box">' +
    '<div class="ap-modal-title">✏️ Edit Item</div>' +
    '<label class="ap-lbl">Name (English)</label>' +
    '<input class="ap-inp" id="apEName" value="' + _esc(name) + '" placeholder="Item name">' +
    '<label class="ap-lbl">Description</label>' +
    '<input class="ap-inp" id="apEDesc" value="' + _esc(desc) + '" placeholder="Short description">' +
    '<label class="ap-lbl">Price (AED)</label>' +
    '<input class="ap-inp" id="apEPrice" type="number" value="' + _esc(price) + '" placeholder="0">' +
    '<label class="ap-lbl">Photo — upload to replace</label>' +
    '<div class="ap-upload" onclick="document.getElementById(\'apEFile\').click()">' +
      '<input type="file" id="apEFile" accept="image/*" style="display:none" onchange="apFilePreview(this,\'apEPrev\')">' +
      '<div class="ap-upload-label">📸 Tap to upload new photo</div>' +
      '<img id="apEPrev" class="ap-upload-preview">' +
    '</div>' +
    '<div class="ap-row" style="gap:8px;margin-top:4px;">' +
      '<button class="ap-btn full" onclick="apSaveItem(\'' + _esc(aid) + '\')">Save Changes</button>' +
      '<button class="ap-btn gray" onclick="closeApModal()">Cancel</button>' +
    '</div>' +
  '</div>';
  modal.classList.add('open');
}

function apSaveItem(aid) {
  var card = document.querySelector('[data-aid="' + aid + '"]');
  if (!card) return;
  var db = _adbGet();
  if (!db.items[aid]) db.items[aid] = {};
  var name = document.getElementById('apEName').value.trim();
  var desc = document.getElementById('apEDesc').value.trim();
  var price = parseInt(document.getElementById('apEPrice').value) || 0;
  var prev = document.getElementById('apEPrev');

  if (name) {
    db.items[aid].nameEn = name;
    var ne = card.querySelector('.cname');
    if (ne) { ne.setAttribute('data-en', name); ne.textContent = name; }
  }
  if (desc) {
    db.items[aid].desc = desc;
    var de = card.querySelector('.cdesc');
    if (de) { de.setAttribute('data-en', desc); de.textContent = desc; }
  }
  db.items[aid].price = price;
  card.dataset.price = price;
  var pe = card.querySelector('.cprice');
  if (pe) pe.innerHTML = price + ' <small>AED</small>';

  if (prev && prev.src && prev.style.display !== 'none' && prev.src.startsWith('data:')) {
    db.items[aid].img = prev.src;
    var ci = card.querySelector('.cimg');
    if (ci) {
      var existing = ci.querySelector('img');
      if (existing) existing.src = prev.src;
      else ci.insertAdjacentHTML('afterbegin', '<img src="' + prev.src + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">');
    }
  }
  if (aid.startsWith('ni_')) {
    var ni = db.newItems.find(function(i){ return 'ni_'+i.id === aid; });
    if (ni) {
      if (name) ni.nameEn = name;
      if (desc) ni.desc = desc;
      ni.price = price;
      if (prev && prev.src && prev.style.display !== 'none' && prev.src.startsWith('data:')) ni.img = prev.src;
    }
  }
  _adbSave();
  closeApModal();
  apRenderItems();
}

// Add new item modal
var _addImgData = null;

function apOpenAddItem() {
  _addImgData = null;
  var catOpts = '';
  document.querySelectorAll('.nav-btn[data-cat]').forEach(function(btn) {
    catOpts += '<option value="' + _esc(btn.dataset.cat) + '">' + _esc(btn.getAttribute('data-en') || btn.textContent.trim()) + '</option>';
  });

  var modal = document.getElementById('apEditModal');
  modal.innerHTML = '<div class="ap-modal-box">' +
    '<div class="ap-modal-title">+ Add New Item</div>' +
    '<label class="ap-lbl">Category</label>' +
    '<select class="ap-inp" id="apACat">' + catOpts + '</select>' +
    '<label class="ap-lbl">Name (English)</label>' +
    '<input class="ap-inp" id="apAName" placeholder="Item name">' +
    '<label class="ap-lbl">Name (Arabic) — optional</label>' +
    '<input class="ap-inp" id="apANameAr" placeholder="اسم العنصر">' +
    '<label class="ap-lbl">Description</label>' +
    '<input class="ap-inp" id="apADesc" placeholder="Short description">' +
    '<label class="ap-lbl">Price (AED)</label>' +
    '<input class="ap-inp" id="apAPrice" type="number" placeholder="0">' +
    '<label class="ap-lbl">Photo</label>' +
    '<div class="ap-upload" onclick="document.getElementById(\'apAFile\').click()">' +
      '<input type="file" id="apAFile" accept="image/*" style="display:none" onchange="apCaptureAddImg(this)">' +
      '<div class="ap-upload-label" id="apAUploadLbl">📸 Tap to upload photo</div>' +
      '<img id="apAPrev" class="ap-upload-preview">' +
    '</div>' +
    '<div class="ap-row" style="gap:8px;margin-top:4px;">' +
      '<button class="ap-btn full" onclick="apConfirmAddItem()">Add Item</button>' +
      '<button class="ap-btn gray" onclick="closeApModal()">Cancel</button>' +
    '</div>' +
  '</div>';
  modal.classList.add('open');
}

function apCaptureAddImg(input) {
  var file = input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    _addImgData = e.target.result;
    var prev = document.getElementById('apAPrev');
    var lbl = document.getElementById('apAUploadLbl');
    if (prev) { prev.src = _addImgData; prev.style.display = 'block'; }
    if (lbl) lbl.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function apConfirmAddItem() {
  var catId = (document.getElementById('apACat') || {}).value || '';
  var nameEn = (document.getElementById('apAName') || {}).value.trim();
  var nameAr = (document.getElementById('apANameAr') || {}).value.trim();
  var desc = (document.getElementById('apADesc') || {}).value.trim();
  var price = parseInt((document.getElementById('apAPrice') || {}).value) || 0;
  if (!nameEn) { alert('Please enter item name'); return; }
  if (!catId) { alert('Please select a category'); return; }
  var db = _adbGet();
  var id = Date.now();
  var item = {id:id, catId:catId, nameEn:nameEn, nameAr:nameAr, desc:desc, price:price, img:_addImgData||'', hidden:false, deleted:false};
  db.newItems.push(item);
  _adbSave();
  var sec = document.getElementById(catId);
  if (sec) {
    var grid = sec.querySelector('.grid');
    if (grid) grid.insertAdjacentHTML('beforeend', _buildNewCard(item));
  }
  closeApModal();
  apRenderItems();
}

function apFilePreview(input, previewId) {
  var file = input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    var el = document.getElementById(previewId);
    if (el) { el.src = e.target.result; el.style.display = 'block'; }
  };
  reader.readAsDataURL(file);
}

function closeApModal() {
  document.getElementById('apEditModal').classList.remove('open');
}

// ── CATEGORIES tab ──
function apRenderCats() {
  var db = _adbGet();
  var cats = [];
  document.querySelectorAll('.nav-btn[data-cat]').forEach(function(btn) {
    cats.push({id: btn.dataset.cat, name: btn.getAttribute('data-en') || btn.textContent.trim(), hidden: btn.style.display === 'none'});
  });
  var rows = cats.map(function(cat) {
    return '<div class="ap-cat-row">' +
      '<div class="ap-cat-icon">📂</div>' +
      '<div class="ap-cat-info"><div class="ap-cat-name">' + _esc(cat.name) + '</div><div class="ap-cat-id">#' + _esc(cat.id) + '</div></div>' +
      '<label class="ap-toggle">' +
        '<input type="checkbox"' + (cat.hidden ? '' : ' checked') + ' onchange="apToggleCat(\'' + _esc(cat.id) + '\',this.checked)">' +
        '<span class="ap-toggle-sl"></span>' +
      '</label>' +
    '</div>';
  }).join('');
  document.getElementById('ap-categories').innerHTML =
    '<div class="ap-card"><div class="ap-card-title">Categories (toggle to show/hide in menu)</div>' + rows + '</div>' +
    '<div class="ap-card" style="margin-top:12px;">' +
      '<div class="ap-card-title">+ New Category</div>' +
      '<label class="ap-lbl">ID (lowercase, no spaces e.g. salads)</label>' +
      '<input class="ap-inp" id="apCId" placeholder="salads">' +
      '<label class="ap-lbl">Name (English)</label>' +
      '<input class="ap-inp" id="apCNameEn" placeholder="Salads">' +
      '<label class="ap-lbl">Name (Arabic)</label>' +
      '<input class="ap-inp" id="apCNameAr" placeholder="سلطات">' +
      '<button class="ap-btn full" onclick="apAddCat()">Create Category</button>' +
    '</div>';
}

function apToggleCat(catId, visible) {
  var db = _adbGet();
  var btn = document.querySelector('.nav-btn[data-cat="' + catId + '"]');
  if (btn) btn.style.display = visible ? '' : 'none';
  if (visible) db.hiddenCats = db.hiddenCats.filter(function(c){ return c !== catId; });
  else if (!db.hiddenCats.includes(catId)) db.hiddenCats.push(catId);
  _adbSave();
}

function apAddCat() {
  var id = (document.getElementById('apCId').value || '').trim().replace(/\s+/g,'_').toLowerCase();
  var nameEn = (document.getElementById('apCNameEn').value || '').trim();
  var nameAr = (document.getElementById('apCNameAr').value || '').trim();
  if (!id || !nameEn) { alert('Please fill in the category ID and English name'); return; }
  if (document.getElementById(id)) { alert('A category with this ID already exists'); return; }
  var db = _adbGet();
  var cat = {id:id, nameEn:nameEn, nameAr:nameAr};
  db.newCats.push(cat);
  _adbSave();
  _addCatSection(cat);
  _addCatNavBtn(cat);
  document.getElementById('apCId').value = '';
  document.getElementById('apCNameEn').value = '';
  document.getElementById('apCNameAr').value = '';
  apRenderCats();
}

// ── CONTACT tab ──
function apRenderContact() {
  var db = _adbGet();
  document.getElementById('ap-contact').innerHTML =
    '<div class="ap-card">' +
      '<div class="ap-card-title">📱 WhatsApp Order Number</div>' +
      '<label class="ap-lbl">Phone number with country code (digits only)</label>' +
      '<input class="ap-inp" id="apWA" type="tel" value="' + _esc(db.wa || WA) + '" placeholder="971509605007">' +
      '<div style="font-size:11px;color:var(--gray);margin-bottom:12px;">Example: 971509605007 (UAE +971)</div>' +
      '<button class="ap-btn full" onclick="apSaveWA()">Save Number</button>' +
    '</div>';
}

function apSaveWA() {
  var val = (document.getElementById('apWA').value || '').replace(/[^0-9]/g,'');
  if (val.length < 6) { alert('Please enter a valid number'); return; }
  var db = _adbGet();
  db.wa = val;
  WA = val;
  _adbSave();
  var waLink = document.querySelector('.wa-cta');
  if (waLink) waLink.href = 'https://wa.me/' + val;
  alert('WhatsApp number updated to +' + val);
}

// ── BRANDING tab ──
function apRenderBranding() {
  var db = _adbGet();
  var currentTheme = db.theme || 'green';
  var swatches = Object.keys(THEMES).map(function(key) {
    return '<div class="theme-swatch' + (key === currentTheme ? ' on' : '') + '" style="background:' + THEMES[key].p + ';" onclick="apApplyTheme(\'' + key + '\')" title="' + key + '"></div>';
  }).join('');

  document.getElementById('ap-branding').innerHTML =
    '<div class="ap-card">' +
      '<div class="ap-card-title">🎨 Color Theme</div>' +
      '<div style="font-size:12px;color:var(--gray);margin-bottom:8px;">Choose a color for the entire menu</div>' +
      '<div class="theme-grid">' + swatches + '</div>' +
    '</div>' +
    '<div class="ap-card" style="margin-top:12px;">' +
      '<div class="ap-card-title">🖼️ Logo / Icon</div>' +
      '<div class="ap-upload" onclick="document.getElementById(\'apLogoFile\').click()">' +
        '<input type="file" id="apLogoFile" accept="image/*" style="display:none" onchange="apUploadLogo(this)">' +
        '<div class="ap-upload-label">📸 Upload a logo image</div>' +
        '<img id="apLogoPrev" class="ap-upload-preview">' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:6px;margin-top:6px;">' +
        '<label class="ap-lbl" style="margin:0;white-space:nowrap;">Or emoji:</label>' +
        '<input class="ap-inp" id="apLogoEmoji" placeholder="🥗" style="margin:0;font-size:20px;text-align:center;max-width:70px;padding:7px;">' +
        '<button class="ap-btn sm" onclick="apSetLogoEmoji()" style="flex-shrink:0;">Set</button>' +
      '</div>' +
    '</div>';
}

function apApplyTheme(key) {
  _applyTheme(key);
  var db = _adbGet();
  db.theme = key;
  _adbSave();
  document.querySelectorAll('.theme-swatch').forEach(function(sw, i) {
    sw.classList.toggle('on', Object.keys(THEMES)[i] === key);
  });
}

function apUploadLogo(input) {
  var file = input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    var src = e.target.result;
    _setLogo(src);
    var db = _adbGet();
    db.logo = src;
    _adbSave();
    var prev = document.getElementById('apLogoPrev');
    if (prev) { prev.src = src; prev.style.display = 'block'; }
  };
  reader.readAsDataURL(file);
}

function apSetLogoEmoji() {
  var emoji = (document.getElementById('apLogoEmoji').value || '').trim();
  if (!emoji) return;
  _setLogo(emoji);
  var db = _adbGet();
  db.logo = emoji;
  _adbSave();
}

// ── TEXT tab ──
function apRenderText() {
  var db = _adbGet();
  document.getElementById('ap-text').innerHTML =
    '<div class="ap-card">' +
      '<div class="ap-card-title">✏️ Header / Hero Text</div>' +
      '<label class="ap-lbl">Restaurant name (use | to split color, e.g. Fit|Bites)</label>' +
      '<input class="ap-inp" id="apTHeroName" value="' + _esc(db.heroName || 'Fit|Bites') + '">' +
      '<label class="ap-lbl">Tagline</label>' +
      '<input class="ap-inp" id="apTTagline" value="' + _esc(db.tagline || 'Clean Food · Real Results') + '">' +
      '<button class="ap-btn full" onclick="apSaveText()">Save Header Text</button>' +
    '</div>' +
    '<div class="ap-card" style="margin-top:12px;">' +
      '<div class="ap-card-title">📍 Footer Info</div>' +
      '<input class="ap-inp" id="apTFooter" value="' + _esc(db.footerInfo || '📍 Dubai, UAE · 🚗 Delivery Available · 📸 @fitbites') + '" placeholder="📍 Location · Info...">' +
      '<button class="ap-btn full" onclick="apSaveFooter()">Save Footer</button>' +
    '</div>';
}

function apSaveText() {
  var heroName = (document.getElementById('apTHeroName').value || '').trim();
  var tagline = (document.getElementById('apTTagline').value || '').trim();
  var db = _adbGet();
  if (heroName) { db.heroName = heroName; _setHeroName(heroName); }
  if (tagline) {
    db.tagline = tagline;
    var tl = document.querySelector('.hero-tag');
    if (tl) { tl.setAttribute('data-en', tagline); tl.textContent = tagline; }
  }
  _adbSave();
  alert('Header text saved!');
}

function apSaveFooter() {
  var fi = (document.getElementById('apTFooter').value || '').trim();
  var db = _adbGet();
  db.footerInfo = fi;
  _adbSave();
  var el = document.querySelector('.footer-info');
  if (el) { el.setAttribute('data-en', fi); el.textContent = fi; }
  alert('Footer text saved!');
}

// ── Init admin on page load ──
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.nav-btn[onclick]').forEach(function(btn) {
    var m = btn.getAttribute('onclick').match(/go\('([^']+)'/);
    if (m && !btn.dataset.cat) btn.dataset.cat = m[1];
  });
  _applyAdminDB();
});