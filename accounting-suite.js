(() => {
  'use strict';

  const VERSION = '1.12.0';
  const MODULES = [
    { key:'overview', icon:'◫', name:'Tổng quan', desc:'Dòng tiền, doanh thu, chi phí, công nợ, cảnh báo và việc cần xử lý.', features:['Dashboard quản trị','Cảnh báo dữ liệu','Việc cần làm','Phân tích AI'] },
    { key:'cash', icon:'₫', name:'Quỹ', desc:'Thu tiền, chi tiền, kiểm kê quỹ và sổ quỹ.', features:['Phiếu thu','Phiếu chi','Kiểm kê quỹ','Sổ quỹ','Đối chiếu tiền mặt'] },
    { key:'bank', icon:'▣', name:'Ngân hàng', desc:'Thu/chi qua ngân hàng, đối chiếu và tự động gợi ý hạch toán.', features:['Ủy nhiệm chi','Thu tiền gửi','Sao kê','Đối chiếu ngân hàng','AI gợi ý hạch toán'] },
    { key:'purchase', icon:'↓', name:'Mua hàng', desc:'Đơn mua, nhận hàng, hóa đơn đầu vào, trả hàng và công nợ NCC.', features:['Đơn mua hàng','Hợp đồng mua','Mua hàng','Hóa đơn đầu vào','Trả/giảm giá','Công nợ NCC'] },
    { key:'sales', icon:'↑', name:'Bán hàng', desc:'Báo giá, đơn hàng, hóa đơn, thu nợ, trả hàng và công nợ KH.', features:['Báo giá','Đơn bán','Bán hàng','Hóa đơn','Trả/giảm giá','Thu nợ','Công nợ KH'] },
    { key:'inventory', icon:'◇', name:'Kho', desc:'Nhập xuất tồn, chuyển kho, kiểm kê và tính giá xuất kho.', features:['Nhập kho','Xuất kho','Chuyển kho','Kiểm kê','Tồn kho','Tính giá xuất kho'] },
    { key:'fixed-assets', icon:'▤', name:'Tài sản cố định', desc:'Ghi tăng, khấu hao, điều chuyển, đánh giá lại và ghi giảm.', features:['Ghi tăng TSCĐ','Khấu hao','Điều chuyển','Đánh giá lại','Ghi giảm','Sổ tài sản'] },
    { key:'tools', icon:'⌘', name:'CCDC & chi phí trả trước', desc:'Ghi tăng, phân bổ, điều chuyển và ghi giảm công cụ, chi phí trả trước.', features:['Ghi tăng CCDC','Phân bổ','Điều chuyển','Ghi giảm','Chi phí trả trước'] },
    { key:'payroll', icon:'◎', name:'Tiền lương', desc:'Bảng lương, bảo hiểm, thuế TNCN và hạch toán lương.', features:['Bảng lương','BHXH/BHYT/BHTN','Thuế TNCN','Hạch toán lương','Thanh toán lương'] },
    { key:'tax', icon:'%', name:'Thuế', desc:'VAT, TNDN, TNCN, đối chiếu hóa đơn và hồ sơ khai thuế.', features:['VAT đầu vào/ra','TNDN','TNCN','Đối chiếu hóa đơn','Tờ khai','Nộp thuế'] },
    { key:'costing', icon:'∑', name:'Giá thành', desc:'Tập hợp chi phí, phân bổ và tính giá thành theo đối tượng.', features:['Tập hợp chi phí','Phân bổ','Dở dang','Tính giá thành','So sánh kế hoạch/thực tế'] },
    { key:'ledger', icon:'≡', name:'Tổng hợp & Sổ cái', desc:'Chứng từ nghiệp vụ khác, sổ cái, khóa sổ và kết chuyển.', features:['Chứng từ khác','Sổ nhật ký','Sổ cái','Kết chuyển','Khóa sổ','Kiểm tra cân đối'] },
    { key:'invoice', icon:'▧', name:'Hóa đơn điện tử', desc:'Quản lý hóa đơn đầu ra/đầu vào, trạng thái và kiểm tra rủi ro.', features:['Hóa đơn bán ra','Hóa đơn đầu vào','Phát hành','Điều chỉnh/thay thế','Kiểm tra rủi ro'] },
    { key:'reports', icon:'▥', name:'Báo cáo', desc:'BCTC, quản trị, công nợ, kho, thuế và xuất Excel/PDF/Word.', features:['Bảng cân đối','KQKD','Lưu chuyển tiền tệ','Công nợ','Kho','Thuế','Báo cáo quản trị'] },
    { key:'ai-control', icon:'✦', name:'AI & Đối chiếu', desc:'Tự động hạch toán, soát xét, phát hiện sai lệch và học từ chỉnh sửa.', features:['AI hạch toán','Review queue','Đối chiếu sổ sách','Phát hiện bất thường','Học từ feedback'] },
  ];

  const WORKFLOWS = {
    cash: ['Lập phiếu thu/chi', 'Chọn đối tượng & tài khoản', 'Kiểm tra chứng từ', 'Ghi sổ', 'Đối chiếu sổ quỹ'],
    bank: ['Nhập/sync sao kê', 'Ghép giao dịch', 'AI gợi ý định khoản', 'Duyệt bút toán', 'Đối chiếu số dư'],
    purchase: ['Đơn mua/Hợp đồng', 'Nhận hàng/dịch vụ', 'Nhận hóa đơn', 'Hạch toán & VAT', 'Theo dõi công nợ', 'Thanh toán'],
    sales: ['Báo giá/Đơn hàng', 'Giao hàng', 'Ghi nhận doanh thu', 'Xuất hóa đơn', 'Theo dõi công nợ', 'Thu tiền'],
    inventory: ['Nhập kho', 'Xuất/chuyển kho', 'Tính giá xuất kho', 'Kiểm kê', 'Đối chiếu kho - sổ cái'],
    'fixed-assets': ['Ghi tăng', 'Xác định nguyên giá', 'Tính khấu hao', 'Điều chuyển/đánh giá lại', 'Ghi giảm'],
    tools: ['Ghi tăng', 'Phân bổ kỳ', 'Điều chuyển', 'Đối chiếu', 'Ghi giảm'],
    payroll: ['Nhập dữ liệu lương', 'Tính lương', 'Tính BH/thuế', 'Duyệt', 'Hạch toán', 'Thanh toán'],
    tax: ['Thu thập chứng từ', 'Đối chiếu hóa đơn', 'Tính nghĩa vụ', 'Lập tờ khai', 'Nộp & theo dõi'],
    costing: ['Tập hợp chi phí', 'Chọn đối tượng', 'Phân bổ', 'Đánh giá dở dang', 'Tính giá thành', 'Phân tích chênh lệch'],
    ledger: ['Kiểm tra chứng từ', 'Ghi sổ', 'Đối chiếu tài khoản', 'Kết chuyển', 'Khóa kỳ', 'Lập BCTC'],
    invoice: ['Tiếp nhận dữ liệu', 'Kiểm tra thông tin', 'Phát hành/ghi nhận', 'Theo dõi trạng thái', 'Điều chỉnh nếu cần'],
    reports: ['Chọn kỳ', 'Tổng hợp số liệu', 'Kiểm tra đối chiếu', 'Lập báo cáo', 'Xuất & lưu hồ sơ'],
    'ai-control': ['Nhận dữ liệu', 'AI phân loại', 'Đánh giá độ tin cậy', 'Người dùng duyệt/sửa', 'Ghi sổ', 'Học từ phản hồi'],
  };

  const PROMPTS = {
    cash: 'Rà soát các giao dịch tiền mặt, phân loại thu/chi, đề xuất bút toán và kiểm tra chênh lệch sổ quỹ.',
    bank: 'Phân tích giao dịch ngân hàng, ghép nội dung giao dịch với nghiệp vụ kế toán, đề xuất định khoản và các giao dịch cần duyệt thủ công.',
    purchase: 'Kiểm tra quy trình mua hàng từ đơn mua đến hóa đơn đầu vào, công nợ và thanh toán; chỉ ra chứng từ thiếu, VAT và bút toán cần ghi nhận.',
    sales: 'Kiểm tra quy trình bán hàng, doanh thu, hóa đơn, công nợ và thu tiền; chỉ ra sai lệch và bút toán cần điều chỉnh.',
    inventory: 'Đối chiếu nhập xuất tồn với sổ cái, tìm âm kho, tồn kho bất thường, chứng từ chưa tính giá và đề xuất xử lý.',
    'fixed-assets': 'Rà soát tài sản cố định: nguyên giá, thời gian sử dụng, khấu hao, điều chuyển và ghi giảm; lập bảng kiểm tra chi tiết.',
    tools: 'Rà soát công cụ dụng cụ và chi phí trả trước; kiểm tra kỳ phân bổ, số đã phân bổ, còn lại và bút toán.',
    payroll: 'Tính và kiểm tra bảng lương, bảo hiểm, thuế TNCN, khoản khấu trừ và bút toán hạch toán lương.',
    tax: 'Rà soát VAT, TNDN, TNCN theo dữ liệu và tài liệu tôi cung cấp; nêu nghĩa vụ, rủi ro, hồ sơ cần kiểm tra và căn cứ.',
    costing: 'Tập hợp chi phí và tính giá thành theo dữ liệu tôi cung cấp; giải thích phương pháp, phân bổ, dở dang và chênh lệch.',
    ledger: 'Kiểm tra sổ cái, bút toán, cân đối Nợ/Có, tài khoản bất thường, kết chuyển và điều kiện khóa sổ.',
    invoice: 'Kiểm tra hóa đơn điện tử đầu vào/đầu ra, trạng thái, thông tin bắt buộc, rủi ro và bút toán liên quan.',
    reports: 'Lập bộ báo cáo tài chính và báo cáo quản trị từ dữ liệu tôi cung cấp; kiểm tra tính nhất quán và nêu cảnh báo.',
    'ai-control': 'Soát xét các bút toán do AI đề xuất, ưu tiên các trường hợp độ tin cậy thấp, chỉ ra lỗi và tạo danh sách cần duyệt.',
  };

  const money = (n) => Number(n || 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + ' ₫';
  const esc = (s='') => String(s).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

  function getApi(path, options = {}) {
    if (typeof api === 'function') return api(path, options);
    const cfg = window.FINIIP_CONFIG || {};
    const base = (localStorage.getItem('finiip_api_base') || cfg.API_BASE_URL || '').replace(/\/$/, '');
    const headers = { ...(options.headers || {}) };
    const key = sessionStorage.getItem('finiip_api_key') || cfg.API_KEY || '';
    if (key) headers['X-API-Key'] = key;
    const workspace = localStorage.getItem('finiip_workspace_id') || cfg.WORKSPACE_ID || 'personal';
    const user = localStorage.getItem('finiip_user_id') || 'accounting-suite';
    headers['X-Workspace-ID'] = workspace; headers['X-User-ID'] = user;
    return fetch(base + path, { ...options, headers }).then(async (r) => {
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.detail || `HTTP ${r.status}`);
      return data;
    });
  }

  function toast(msg) { if (typeof showToast === 'function') showToast(msg, 4200); }

  function injectNav() {
    const nav = document.querySelector('.main-nav');
    if (!nav || nav.querySelector('[data-view="accounting"]')) return;
    const btn = document.createElement('button');
    btn.className = 'nav-item'; btn.type = 'button'; btn.dataset.view = 'accounting';
    btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M4 20V8h16v12M7 8V4h10v4M8 12h3v3H8Zm5 0h3v3h-3ZM8 17h3v3H8Zm5 0h3v3h-3Z"/></svg><span class="sidebar-label">Kế toán</span><span class="badge sidebar-label accounting-nav-badge">V112</span>';
    nav.appendChild(btn);
    btn.addEventListener('click', openAccounting);
  }

  function injectPanel() {
    const main = document.querySelector('.main-panel');
    const composer = document.querySelector('#composerWrap');
    if (!main || document.querySelector('#accountingView')) return;
    const section = document.createElement('section');
    section.className = 'workspace-page workspace-view hidden accounting-suite';
    section.id = 'accountingView'; section.dataset.viewPanel = 'accounting';
    section.innerHTML = `
      <div class="page-container accounting-container">
        <div class="accounting-hero">
          <div><p class="page-eyebrow">FINIIP ACCOUNTING SUITE · V112</p><h1>Kế toán & quản trị tài chính</h1><p>Trung tâm nghiệp vụ hợp nhất: chứng từ, sổ sách, thuế, công nợ, báo cáo và AI kiểm soát.</p></div>
          <div class="accounting-hero-actions"><button type="button" class="secondary-btn" data-acc-action="refresh">↻ Làm mới</button><button type="button" class="primary-btn" data-acc-action="ai">✦ Hỏi AI kế toán</button></div>
        </div>
        <div class="acc-toolbar"><div class="acc-search"><span>⌕</span><input id="accSearch" type="search" placeholder="Tìm phân hệ hoặc chức năng: hóa đơn, kho, lương, VAT..." /></div><div class="acc-period"><span>Kỳ:</span><strong id="accPeriodLabel">Tháng hiện tại</strong></div></div>
        <div class="acc-kpis" id="accKpis"><div class="acc-skeleton"></div><div class="acc-skeleton"></div><div class="acc-skeleton"></div><div class="acc-skeleton"></div></div>
        <div class="acc-layout">
          <aside class="acc-module-nav" id="accModuleNav"></aside>
          <main class="acc-content" id="accContent"></main>
        </div>
      </div>`;
    main.insertBefore(section, composer || null);
    section.addEventListener('click', handleClick);
    document.querySelector('#accSearch')?.addEventListener('input', (e) => renderModuleNav(e.target.value));
  }

  async function openAccounting() {
    if (typeof switchView === 'function') switchView('accounting');
    else {
      document.querySelectorAll('.workspace-view').forEach((p) => p.classList.toggle('hidden', p.id !== 'accountingView'));
      document.querySelector('#composerWrap')?.classList.add('hidden');
    }
    document.querySelectorAll('.nav-item').forEach((n) => n.classList.toggle('active', n.dataset.view === 'accounting'));
    const title = document.querySelector('#topbarTitle'); const sub = document.querySelector('#topbarSubtitle');
    if (title) title.textContent = 'Finiip Accounting'; if (sub) sub.textContent = 'Kế toán · Thuế · Sổ sách · Báo cáo · AI kiểm soát';
    renderModuleNav();
    await refreshDashboard();
    renderModule('overview');
  }

  function renderModuleNav(filter='') {
    const root = document.querySelector('#accModuleNav'); if (!root) return;
    const q = filter.trim().toLowerCase();
    const items = MODULES.filter((m) => !q || (m.name + ' ' + m.desc + ' ' + m.features.join(' ')).toLowerCase().includes(q));
    root.innerHTML = items.map((m) => `<button type="button" class="acc-module-item ${m.key === (root.dataset.active || 'overview') ? 'active' : ''}" data-module="${m.key}"><span>${m.icon}</span><div><strong>${esc(m.name)}</strong><small>${esc(m.desc)}</small></div></button>`).join('') || '<div class="acc-empty">Không tìm thấy chức năng phù hợp.</div>';
  }

  function renderOverview() {
    const content = document.querySelector('#accContent'); if (!content) return;
    content.innerHTML = `
      <section class="acc-card acc-overview-head"><div><span class="card-kicker">TRUNG TÂM ĐIỀU HÀNH</span><h2>Việc kế toán cần xử lý</h2></div><button class="acc-text-btn" data-acc-action="reconcile">Chạy kiểm tra đối chiếu →</button></section>
      <div class="acc-grid-2">
        <section class="acc-card"><h3>Quy trình nhanh</h3><div class="acc-quick-grid">${['purchase','sales','bank','tax','ledger','reports'].map((key) => { const m=MODULES.find(x=>x.key===key); return `<button data-module="${key}" class="acc-quick"><span>${m.icon}</span><strong>${m.name}</strong><small>${m.features.slice(0,3).join(' · ')}</small></button>`; }).join('')}</div></section>
        <section class="acc-card"><h3>AI kiểm soát</h3><div id="accAlerts" class="acc-alerts"><div class="acc-loader">Đang kiểm tra dữ liệu…</div></div><button class="primary-btn acc-full" data-module="ai-control">Mở trung tâm AI & đối chiếu</button></section>
      </div>
      <section class="acc-card"><div class="acc-section-title"><div><span class="card-kicker">PHÂN HỆ</span><h3>Toàn bộ nghiệp vụ</h3></div><small>${MODULES.length - 1} nhóm chức năng</small></div><div class="acc-feature-grid">${MODULES.filter(m=>m.key!=='overview').map(m=>`<button class="acc-feature-card" data-module="${m.key}"><span class="acc-feature-icon">${m.icon}</span><strong>${m.name}</strong><p>${m.desc}</p><div>${m.features.slice(0,4).map(f=>`<span>${f}</span>`).join('')}</div></button>`).join('')}</div></section>`;
    loadAlerts();
  }

  function renderModule(key) {
    const nav = document.querySelector('#accModuleNav'); if (nav) { nav.dataset.active = key; renderModuleNav(document.querySelector('#accSearch')?.value || ''); }
    if (key === 'overview') return renderOverview();
    const m = MODULES.find((x) => x.key === key) || MODULES[0];
    const flow = WORKFLOWS[key] || ['Nhập dữ liệu','Kiểm tra','Duyệt','Ghi sổ','Báo cáo'];
    const content = document.querySelector('#accContent'); if (!content) return;
    content.innerHTML = `
      <section class="acc-card acc-module-head"><div class="acc-title-icon">${m.icon}</div><div><span class="card-kicker">PHÂN HỆ</span><h2>${esc(m.name)}</h2><p>${esc(m.desc)}</p></div><div class="acc-module-actions"><button class="secondary-btn" data-acc-action="data" data-module-key="${m.key}">Xem dữ liệu</button><button class="primary-btn" data-acc-action="prompt" data-module-key="${m.key}">✦ Phân tích bằng AI</button></div></section>
      <section class="acc-card"><h3>Quy trình nghiệp vụ</h3><div class="acc-flow">${flow.map((s,i)=>`<div><span>${i+1}</span><strong>${esc(s)}</strong></div>`).join('<i>→</i>')}</div></section>
      <div class="acc-grid-2"><section class="acc-card"><h3>Chức năng</h3><div class="acc-checklist">${m.features.map(f=>`<button data-acc-feature="${esc(f)}" data-module-key="${m.key}"><span>✓</span><strong>${esc(f)}</strong><small>Mở trợ lý nghiệp vụ / thao tác liên quan</small></button>`).join('')}</div></section><section class="acc-card"><h3>Dữ liệu gần đây</h3><div id="accModuleData"><div class="acc-loader">Đang tải dữ liệu liên quan…</div></div></section></div>
      <section class="acc-card acc-note"><strong>Finiip V112</strong><p>Phân hệ này dùng chung lõi chứng từ, tài khoản, hóa đơn, AI, báo cáo và RAG hiện có. Các nghiệp vụ chuyên sâu chưa có bảng dữ liệu riêng sẽ được xử lý qua AI + báo cáo cho đến khi backend bổ sung sổ chi tiết tương ứng.</p></section>`;
    loadModuleData(key);
  }

  async function refreshDashboard() {
    const root = document.querySelector('#accKpis'); if (!root) return;
    const now = new Date(); document.querySelector('#accPeriodLabel').textContent = `Tháng ${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`;
    try {
      const [status, sales, purchases, txs] = await Promise.all([
        getApi('/system/status').catch(()=>({counts:{}})),
        getApi('/sales-invoices').catch(()=>[]),
        getApi('/purchase-invoices').catch(()=>[]),
        getApi('/transactions?limit=500').catch(()=>[]),
      ]);
      const revenue = sales.reduce((s,x)=>s+Number(x.total_amount||0),0);
      const purchase = purchases.reduce((s,x)=>s+Number(x.total_amount||0),0);
      const pending = txs.filter(x=>x.status==='draft').length + Number(status.counts?.ai_review_items||0);
      root.innerHTML = `
        <div class="acc-kpi"><span>Doanh thu hóa đơn</span><strong>${money(revenue)}</strong><small>${sales.length} hóa đơn bán</small></div>
        <div class="acc-kpi"><span>Mua hàng đầu vào</span><strong>${money(purchase)}</strong><small>${purchases.length} hóa đơn mua</small></div>
        <div class="acc-kpi"><span>Giao dịch</span><strong>${Number(status.counts?.transactions ?? txs.length).toLocaleString('vi-VN')}</strong><small>${Number(status.counts?.journal_entries||0).toLocaleString('vi-VN')} bút toán</small></div>
        <div class="acc-kpi ${pending ? 'warn':''}"><span>Cần xử lý</span><strong>${pending.toLocaleString('vi-VN')}</strong><small>Nháp + hàng đợi AI</small></div>`;
    } catch (e) { root.innerHTML = `<div class="acc-error">Không tải được dashboard: ${esc(e.message)}</div>`; }
  }

  async function loadAlerts() {
    const root = document.querySelector('#accAlerts'); if (!root) return;
    try {
      const [txs, sales, purchases] = await Promise.all([getApi('/transactions?limit=500').catch(()=>[]), getApi('/sales-invoices').catch(()=>[]), getApi('/purchase-invoices').catch(()=>[])]);
      const draft = txs.filter(x=>x.status==='draft').length;
      const low = txs.filter(x=>x.ai_confidence != null && Number(x.ai_confidence)<0.7).length;
      const unpaidSales = sales.filter(x=>String(x.status).toLowerCase().includes('unpaid')).length;
      const unpaidPurchases = purchases.filter(x=>String(x.status).toLowerCase().includes('unpaid')).length;
      const alerts = [
        [draft, 'Giao dịch nháp chưa xác nhận'], [low, 'Giao dịch AI độ tin cậy thấp'], [unpaidSales, 'Hóa đơn bán chưa thu'], [unpaidPurchases, 'Hóa đơn mua chưa trả']
      ].filter(([n])=>n>0);
      root.innerHTML = alerts.length ? alerts.map(([n,t])=>`<div class="acc-alert"><span>!</span><div><strong>${n.toLocaleString('vi-VN')}</strong><small>${esc(t)}</small></div></div>`).join('') : '<div class="acc-good">✓ Chưa phát hiện việc tồn đọng từ dữ liệu lõi hiện có.</div>';
    } catch(e) { root.innerHTML = `<div class="acc-error">${esc(e.message)}</div>`; }
  }

  function rowTable(headers, rows) {
    if (!rows.length) return '<div class="acc-empty">Chưa có dữ liệu.</div>';
    return `<div class="acc-table-wrap"><table class="acc-table"><thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }

  async function loadModuleData(key) {
    const root = document.querySelector('#accModuleData'); if (!root) return;
    try {
      let html = '';
      if (key === 'purchase') {
        const items = await getApi('/purchase-invoices'); html = rowTable(['Ngày','Số HĐ','Nhà cung cấp','Tổng tiền'], items.slice(0,8).map(x=>[x.invoice_date,x.invoice_number,x.supplier_name,money(x.total_amount)]));
      } else if (key === 'sales' || key === 'invoice') {
        const items = await getApi('/sales-invoices'); html = rowTable(['Ngày','Số HĐ','Khách hàng','Tổng tiền'], items.slice(0,8).map(x=>[x.invoice_date,x.invoice_number,x.customer_name,money(x.total_amount)]));
      } else if (key === 'ledger' || key === 'cash' || key === 'bank') {
        const items = await getApi('/transactions?limit=20'); html = rowTable(['Ngày','Diễn giải','Số tiền','Trạng thái'], items.slice(0,8).map(x=>[x.transaction_date,x.description,money(x.amount),x.status]));
      } else if (key === 'ai-control') {
        const [txs, status] = await Promise.all([getApi('/transactions?limit=100'),getApi('/system/status')]);
        const issues = txs.filter(x=>x.status==='draft'||(x.ai_confidence!=null&&Number(x.ai_confidence)<0.7)).slice(0,8);
        html = `<div class="acc-mini-stats"><span><b>${status.counts?.ai_review_items||0}</b> review queue</span><span><b>${status.counts?.ai_corrections||0}</b> corrections</span></div>` + rowTable(['Ngày','Diễn giải','Tin cậy','Trạng thái'], issues.map(x=>[x.transaction_date,x.description,x.ai_confidence==null?'—':Math.round(Number(x.ai_confidence)*100)+'%',x.status]));
      } else if (key === 'reports') {
        html = '<div class="acc-action-box"><strong>Tạo báo cáo đa tệp</strong><p>Finiip đã có engine đọc PDF/Word/Excel và xuất Word, Excel, PDF.</p><button class="primary-btn" data-acc-action="reports">Mở Tài liệu & báo cáo</button></div>';
      } else {
        const st = await getApi('/system/status').catch(()=>({counts:{}}));
        html = `<div class="acc-action-box"><strong>Sẵn sàng dùng lõi kế toán hiện có</strong><p>${Number(st.counts?.accounts||0)} tài khoản · ${Number(st.counts?.transactions||0)} giao dịch · ${Number(st.counts?.journal_entries||0)} bút toán.</p><button class="secondary-btn" data-acc-action="prompt" data-module-key="${key}">Phân tích nghiệp vụ này bằng AI</button></div>`;
      }
      root.innerHTML = html;
    } catch(e) { root.innerHTML = `<div class="acc-error">Không tải được dữ liệu: ${esc(e.message)}</div>`; }
  }

  function sendPrompt(key, feature='') {
    const base = PROMPTS[key] || `Hỗ trợ nghiệp vụ ${MODULES.find(m=>m.key===key)?.name || key}.`;
    const prompt = feature ? `${base}\n\nTập trung vào chức năng: ${feature}. Trình bày quy trình, dữ liệu cần nhập, kiểm tra, định khoản, rủi ro và kết quả cần xuất.` : base;
    if (typeof switchView === 'function') switchView('chat');
    const input = document.querySelector('#messageInput'); if (input) { input.value = prompt; input.dispatchEvent(new Event('input')); input.focus(); }
    toast('Đã đưa yêu cầu nghiệp vụ sang Trò chuyện AI');
  }

  function handleClick(e) {
    const moduleBtn = e.target.closest('[data-module]');
    if (moduleBtn) { renderModule(moduleBtn.dataset.module); return; }
    const feature = e.target.closest('[data-acc-feature]');
    if (feature) { sendPrompt(feature.dataset.moduleKey, feature.dataset.accFeature); return; }
    const action = e.target.closest('[data-acc-action]'); if (!action) return;
    const a = action.dataset.accAction;
    if (a === 'refresh') { refreshDashboard(); if ((document.querySelector('#accModuleNav')?.dataset.active||'overview')==='overview') loadAlerts(); toast('Đã làm mới dữ liệu kế toán'); }
    if (a === 'ai') sendPrompt('ai-control');
    if (a === 'prompt') sendPrompt(action.dataset.moduleKey || 'ledger');
    if (a === 'reports') { if (typeof switchView === 'function') switchView('documents'); }
    if (a === 'data') loadModuleData(action.dataset.moduleKey || 'ledger');
    if (a === 'reconcile') sendPrompt('ai-control', 'Kiểm tra đối chiếu chứng từ, sổ sách và phát hiện chênh lệch');
  }

  function loadCss() {
    if (document.querySelector('link[data-finiip-accounting-suite]')) return;
    const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = 'accounting-suite.css'; link.dataset.finiipAccountingSuite = VERSION; document.head.appendChild(link);
  }

  function init() {
    loadCss(); injectNav(); injectPanel();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
