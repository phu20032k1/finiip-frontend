(() => {
  'use strict';

  const API = '/api/v112/accounting';
  let specs = null;
  let observer = null;
  let rendering = false;

  const esc = (s = '') => String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
  const money = (n) => Number(n || 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + ' ₫';
  const today = () => new Date().toISOString().slice(0, 10);
  const notify = (m) => { if (typeof showToast === 'function') showToast(m, 4200); };

  function headers(extra = {}) {
    const cfg = window.FINIIP_CONFIG || {};
    const h = {
      'X-Workspace-ID': localStorage.getItem('finiip_workspace_id') || cfg.WORKSPACE_ID || 'personal',
      'X-User-ID': localStorage.getItem('finiip_user_id') || 'v112-user',
      ...extra,
    };
    const key = sessionStorage.getItem('finiip_api_key') || cfg.API_KEY || '';
    if (key) h['X-API-Key'] = key;
    return h;
  }

  async function req(path, options = {}) {
    if (typeof api === 'function') return api(`${API}${path}`, options);
    const cfg = window.FINIIP_CONFIG || {};
    const base = (localStorage.getItem('finiip_api_base') || cfg.API_BASE_URL || '').replace(/\/$/, '');
    const response = await fetch(`${base}${API}${path}`, { ...options, headers: headers(options.headers || {}) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.detail || `HTTP ${response.status}`);
    return payload;
  }

  async function core(path) {
    if (typeof api === 'function') return api(path);
    const cfg = window.FINIIP_CONFIG || {};
    const base = (localStorage.getItem('finiip_api_base') || cfg.API_BASE_URL || '').replace(/\/$/, '');
    const response = await fetch(base + path, { headers: headers() });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.detail || `HTTP ${response.status}`);
    return data;
  }

  function loadCss() {
    if (document.querySelector('link[data-v112-operations]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = 'accounting-operations-v112.css?v=1.12.0'; link.dataset.v112Operations = '1';
    document.head.appendChild(link);
  }

  async function loadSpecs() {
    if (specs) return specs;
    const data = await req('/modules');
    specs = data.modules || [];
    return specs;
  }

  function activeModule() {
    return document.querySelector('#accModuleNav')?.dataset.active || 'overview';
  }

  function specFor(key) {
    return (specs || []).find((x) => x.key === key) || null;
  }

  async function ensureOperationsCard() {
    if (rendering) return;
    const content = document.querySelector('#accContent');
    const key = activeModule();
    if (!content || key === 'overview' || content.querySelector('.acc-v112-ops')) return;
    rendering = true;
    const card = document.createElement('section');
    card.className = 'acc-card acc-v112-ops';
    const head = content.querySelector('.acc-module-head');
    if (head?.nextSibling) content.insertBefore(card, head.nextSibling); else content.prepend(card);
    card.innerHTML = '<div class="acc-loader">Đang kết nối sổ nghiệp vụ V112…</div>';
    try {
      await loadSpecs();
      const s = specFor(key);
      if (!s) throw new Error('Phân hệ chưa có trong hợp đồng V112');
      card.innerHTML = `
        <div class="acc-v112-toolbar">
          <div><span class="acc-v112-pill online">V112 API</span><strong>Sổ nghiệp vụ ${esc(s.name)}</strong><small id="v112DocCount"></small></div>
          <div class="acc-v112-buttons">
            <button type="button" class="secondary-btn" data-v112-action="masters" data-v112-module="${esc(key)}">Danh mục</button>
            ${key === 'ai-control' ? '<button type="button" class="secondary-btn" data-v112-action="reconcile">Đối chiếu</button>' : ''}
            <button type="button" class="secondary-btn" data-v112-action="refresh" data-v112-module="${esc(key)}">↻</button>
            <button type="button" class="primary-btn" data-v112-action="create" data-v112-module="${esc(key)}">+ Tạo chứng từ</button>
          </div>
        </div>
        <div class="acc-v112-docs" data-v112-docs><div class="acc-loader">Đang tải chứng từ…</div></div>`;
      await refreshDocs(key, card);
    } catch (error) {
      card.innerHTML = `<div class="acc-v112-toolbar"><div><span class="acc-v112-pill offline">V112 API</span><strong>Sổ nghiệp vụ chưa khả dụng</strong></div></div><div class="v112-api-warning">Frontend V112 đã sẵn sàng nhưng backend hiện tại chưa có API <code>${API}</code>. Merge/deploy backend V112 trước; các chức năng AI và dữ liệu lõi V111 vẫn hoạt động bình thường.<br><small>${esc(error.message)}</small></div>`;
    } finally { rendering = false; }
  }

  async function refreshDocs(key = activeModule(), card = document.querySelector('.acc-v112-ops')) {
    if (!card) return;
    const root = card.querySelector('[data-v112-docs]');
    if (!root) return;
    root.innerHTML = '<div class="acc-loader">Đang tải chứng từ…</div>';
    try {
      const data = await req(`/documents?module=${encodeURIComponent(key)}&limit=50`);
      const items = data.items || [];
      const count = card.querySelector('#v112DocCount'); if (count) count.textContent = `· ${Number(data.total || items.length).toLocaleString('vi-VN')} chứng từ`;
      if (!items.length) { root.innerHTML = '<div class="acc-empty">Chưa có chứng từ V112 trong phân hệ này.</div>'; return; }
      root.innerHTML = items.map((x) => `
        <article class="acc-v112-doc" data-v112-id="${x.id}">
          <div><strong>${esc(x.document_no)}</strong><small>${esc(x.document_date)} · ${esc(x.document_type)}</small></div>
          <div><strong>${esc(x.partner || x.description || 'Không có đối tượng')}</strong><small>${esc(x.description || '')}</small></div>
          <div class="amount">${money(x.total_amount)}<small class="acc-v112-status ${esc(x.status)}">${esc(x.status)}</small></div>
          <div class="acc-v112-actions">
            ${x.status === 'draft' ? `<button data-v112-action="approve" data-v112-id="${x.id}" data-v112-module="${esc(key)}">Duyệt</button>` : ''}
            ${['draft', 'approved'].includes(x.status) ? `<button data-v112-action="post" data-v112-id="${x.id}" data-v112-module="${esc(key)}">Ghi sổ</button><button data-v112-action="cancel" data-v112-id="${x.id}" data-v112-module="${esc(key)}">Hủy</button>` : ''}
            ${x.status !== 'posted' ? `<button class="danger" data-v112-action="delete" data-v112-id="${x.id}" data-v112-module="${esc(key)}">Xóa</button>` : ''}
          </div>
        </article>`).join('');
    } catch (error) { root.innerHTML = `<div class="acc-error">Không tải được sổ V112: ${esc(error.message)}</div>`; }
  }

  async function accountsOptions(selected = '') {
    const items = await core('/accounts').catch(() => []);
    return '<option value="">— Chọn tài khoản —</option>' + items.map((a) => `<option value="${esc(a.code)}" ${String(a.code) === String(selected) ? 'selected' : ''}>${esc(a.code)} · ${esc(a.name)}</option>`).join('');
  }

  async function openCreate(key) {
    const s = specFor(key) || (await loadSpecs(), specFor(key));
    if (!s) return notify('Không tìm thấy cấu hình phân hệ');
    const accountOpts = await accountsOptions();
    const html = `
      <form class="v112-form" id="v112CreateForm">
        <label><span>Loại chứng từ</span><select name="document_type" required>${(s.document_types || []).map((x) => `<option value="${esc(x)}">${esc(x)}</option>`).join('')}</select></label>
        <label><span>Ngày chứng từ</span><input type="date" name="document_date" value="${today()}" required></label>
        <label><span>Số chứng từ</span><input name="document_no" placeholder="Để trống để tự sinh"></label>
        <label><span>Đối tượng</span><input name="partner" placeholder="Khách hàng, NCC, nhân viên…"></label>
        <label class="span-2"><span>Diễn giải</span><textarea name="description" rows="3" placeholder="Nội dung nghiệp vụ"></textarea></label>
        <label><span>Giá trị trước thuế</span><input type="number" min="0" step="0.01" name="amount" value="0"></label>
        <label><span>Thuế / khoản cộng thêm</span><input type="number" min="0" step="0.01" name="tax_amount" value="0"></label>
        <label><span>Tài khoản Nợ</span><select name="debit_account_code">${accountOpts}</select></label>
        <label><span>Tài khoản Có</span><select name="credit_account_code">${accountOpts}</select></label>
        <div class="v112-form-note">Có thể lưu nháp khi chưa chọn tài khoản. Khi bấm <b>Ghi sổ</b>, Finiip bắt buộc kiểm tra tài khoản và kỳ kế toán.</div>
        <button class="primary-btn span-2" type="submit">Lưu chứng từ nháp</button>
      </form>`;
    if (typeof openModal !== 'function') return alert('Trình tạo chứng từ V112 chưa sẵn sàng.');
    openModal({ title: `Tạo chứng từ · ${s.name}`, kicker: 'FINIIP V112', wide: true, html, onOpen: (modal) => {
      modal.querySelector('#v112CreateForm')?.addEventListener('submit', async (event) => {
        event.preventDefault(); const form = new FormData(event.currentTarget); const btn = event.currentTarget.querySelector('button[type="submit"]'); btn.disabled = true;
        const payload = {
          module: key, document_type: form.get('document_type'), document_no: form.get('document_no') || null, document_date: form.get('document_date') || null,
          partner: form.get('partner') || null, description: form.get('description') || null, amount: Number(form.get('amount') || 0), tax_amount: Number(form.get('tax_amount') || 0),
          debit_account_code: form.get('debit_account_code') || null, credit_account_code: form.get('credit_account_code') || null, metadata: { source: 'finiip_frontend_v112' },
        };
        try {
          await req('/documents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          if (typeof closeModal === 'function') closeModal(); notify('Đã lưu chứng từ V112'); await refreshDocs(key);
        } catch (e) { notify(`Không lưu được: ${e.message}`); btn.disabled = false; }
      });
    }});
  }

  async function approveDoc(id, key) {
    await req(`/documents/${id}/approve`, { method: 'POST' }); notify('Đã duyệt chứng từ'); await refreshDocs(key);
  }

  async function cancelDoc(id, key) {
    if (!confirm('Hủy chứng từ này?')) return;
    await req(`/documents/${id}/cancel`, { method: 'POST' }); notify('Đã hủy chứng từ'); await refreshDocs(key);
  }

  async function deleteDoc(id, key) {
    if (!confirm('Xóa chứng từ nháp này?')) return;
    await req(`/documents/${id}`, { method: 'DELETE' }); notify('Đã xóa chứng từ'); await refreshDocs(key);
  }

  async function postDoc(id, key) {
    const data = await req(`/documents/${id}`); const d = data.document || {};
    const accountOptsDebit = await accountsOptions(d.debit_account_code || '');
    const accountOptsCredit = await accountsOptions(d.credit_account_code || '');
    const html = `
      <form class="v112-form" id="v112PostForm">
        <div class="span-2 v112-api-ready"><b>${esc(d.document_no)}</b> · ${money(d.total_amount)}<br>${esc(d.description || d.partner || '')}</div>
        <label><span>Tài khoản Nợ *</span><select name="debit" required>${accountOptsDebit}</select></label>
        <label><span>Tài khoản Có *</span><select name="credit" required>${accountOptsCredit}</select></label>
        <label><span>Loại giao dịch</span><select name="transaction_type"><option value="">Tự xác định</option><option value="income">Thu / doanh thu</option><option value="expense">Chi / chi phí</option></select></label>
        <label><span>Phân loại</span><input name="category" placeholder="Ví dụ: mua hàng, bán hàng…"></label>
        <div class="v112-form-note">Ghi sổ sẽ tạo <b>Transaction + JournalEntry thật</b> trong lõi Finiip và khóa chứng từ V112 khỏi sửa/xóa trực tiếp.</div>
        <button class="primary-btn span-2" type="submit">Duyệt thông tin & ghi sổ</button>
      </form>`;
    openModal({ title: 'Ghi sổ chứng từ', kicker: 'FINIIP V112 · DOUBLE ENTRY', wide: true, html, onOpen: (modal) => {
      modal.querySelector('#v112PostForm')?.addEventListener('submit', async (event) => {
        event.preventDefault(); const f = new FormData(event.currentTarget); const btn = event.currentTarget.querySelector('button[type="submit"]'); btn.disabled = true;
        try {
          await req(`/documents/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ debit_account_code: f.get('debit'), credit_account_code: f.get('credit') }) });
          await req(`/documents/${id}/post`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ post_to_ledger: true, transaction_type: f.get('transaction_type') || null, category: f.get('category') || null }) });
          if (typeof closeModal === 'function') closeModal(); notify('Đã ghi sổ chứng từ V112'); await refreshDocs(key);
        } catch (e) { notify(`Không ghi sổ được: ${e.message}`); btn.disabled = false; }
      });
    }});
  }

  async function openMasters(key) {
    const s = specFor(key) || (await loadSpecs(), specFor(key));
    const types = s?.masters || [];
    if (!types.length) return notify('Phân hệ này chưa có danh mục riêng');
    const html = `
      <div class="v112-master-tabs">${types.map((t, i) => `<button type="button" data-v112-master-type="${esc(t)}" class="${i === 0 ? 'active' : ''}">${esc(t)}</button>`).join('')}</div>
      <form class="v112-form" id="v112MasterForm">
        <input type="hidden" name="entity_type" value="${esc(types[0])}">
        <label><span>Mã</span><input name="code" required></label><label><span>Tên</span><input name="name" required></label>
        <button type="submit" class="primary-btn span-2">Thêm danh mục</button>
      </form>
      <div class="v112-master-list" id="v112MasterList"><div class="acc-loader">Đang tải…</div></div>`;
    openModal({ title: `Danh mục · ${s.name}`, kicker: 'FINIIP V112', wide: true, html, onOpen: (modal) => {
      const form = modal.querySelector('#v112MasterForm'); const list = modal.querySelector('#v112MasterList');
      const load = async (type) => {
        try { const data = await req(`/masters/${encodeURIComponent(type)}?status=`); const items = data.items || []; list.innerHTML = items.length ? items.map((x) => `<div class="v112-master-row"><div><strong>${esc(x.code)} · ${esc(x.name)}</strong><small>${esc(x.status)}</small></div><button type="button" data-v112-master-delete="${x.id}" data-v112-master-type="${esc(type)}">Xóa</button></div>`).join('') : '<div class="acc-empty">Chưa có danh mục.</div>'; } catch (e) { list.innerHTML = `<div class="acc-error">${esc(e.message)}</div>`; }
      };
      modal.querySelectorAll('[data-v112-master-type]').forEach((b) => b.addEventListener('click', () => { modal.querySelectorAll('[data-v112-master-type]').forEach(x => x.classList.remove('active')); b.classList.add('active'); form.elements.entity_type.value = b.dataset.v112MasterType; load(b.dataset.v112MasterType); }));
      form.addEventListener('submit', async (e) => { e.preventDefault(); const f = new FormData(form); try { await req(`/masters/${encodeURIComponent(f.get('entity_type'))}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: f.get('code'), name: f.get('name'), status: 'active', data: {} }) }); form.elements.code.value = ''; form.elements.name.value = ''; notify('Đã thêm danh mục'); await load(f.get('entity_type')); } catch (err) { notify(`Không thêm được: ${err.message}`); } });
      list.addEventListener('click', async (e) => { const b = e.target.closest('[data-v112-master-delete]'); if (!b || !confirm('Xóa danh mục này?')) return; try { await req(`/masters/${encodeURIComponent(b.dataset.v112MasterType)}/${b.dataset.v112MasterDelete}`, { method: 'DELETE' }); notify('Đã xóa danh mục'); await load(b.dataset.v112MasterType); } catch (err) { notify(`Không xóa được: ${err.message}`); } });
      load(types[0]);
    }});
  }

  async function openReconciliation() {
    try {
      const data = await req('/reconciliation');
      const html = `<div class="${data.status === 'ok' ? 'v112-api-ready' : 'v112-api-warning'}">Kết quả: <b>${data.status === 'ok' ? 'Không có cảnh báo trọng yếu' : `${data.issues} vấn đề cần chú ý`}</b> · ${esc(data.checked_at || '')}</div><div class="v112-reconcile">${(data.checks || []).map((x) => `<div class="v112-check ${esc(x.severity)}"><span class="dot"></span><span>${esc(x.label)}</span><strong>${Number(x.count || 0).toLocaleString('vi-VN')}</strong></div>`).join('')}</div>`;
      openModal({ title: 'Đối chiếu kế toán', kicker: 'FINIIP V112 · CONTROL CENTER', wide: true, html });
    } catch (e) { notify(`Không chạy được đối chiếu: ${e.message}`); }
  }

  async function action(event) {
    const b = event.target.closest('[data-v112-action]'); if (!b) return;
    event.preventDefault(); event.stopPropagation();
    const a = b.dataset.v112Action, key = b.dataset.v112Module || activeModule(), id = b.dataset.v112Id;
    b.disabled = true;
    try {
      if (a === 'create') await openCreate(key);
      if (a === 'refresh') await refreshDocs(key);
      if (a === 'approve') await approveDoc(id, key);
      if (a === 'post') await postDoc(id, key);
      if (a === 'cancel') await cancelDoc(id, key);
      if (a === 'delete') await deleteDoc(id, key);
      if (a === 'masters') await openMasters(key);
      if (a === 'reconcile') await openReconciliation();
    } catch (e) { notify(`V112: ${e.message}`); }
    finally { b.disabled = false; }
  }

  function watch() {
    const root = document.querySelector('#accContent');
    if (!root || observer) return;
    observer = new MutationObserver(() => setTimeout(ensureOperationsCard, 0));
    observer.observe(root, { childList: true });
    document.addEventListener('click', action, true);
    document.addEventListener('click', (e) => { if (e.target.closest('[data-module]')) setTimeout(ensureOperationsCard, 40); }, true);
    ensureOperationsCard();
  }

  function init() {
    loadCss();
    const timer = setInterval(() => {
      if (document.querySelector('#accContent')) { clearInterval(timer); watch(); }
    }, 120);
    setTimeout(() => clearInterval(timer), 12000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
