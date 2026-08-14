(() => {
  'use strict';

  const VERSION = '1.13.0';
  const API = '/api/v112/accounting';

  const FEATURE_MAP = {
    cash: {
      'Phiếu thu': 'receipt', 'Phiếu chi': 'payment', 'Kiểm kê quỹ': 'cash_count',
      'Sổ quỹ': null, 'Đối chiếu tiền mặt': '@reconcile'
    },
    bank: {
      'Ủy nhiệm chi': 'bank_payment', 'Thu tiền gửi': 'bank_receipt', 'Sao kê': 'bank_statement',
      'Đối chiếu ngân hàng': 'bank_reconciliation', 'AI gợi ý hạch toán': '@ai-control'
    },
    purchase: {
      'Đơn mua hàng': 'purchase_order', 'Hợp đồng mua': 'purchase_contract', 'Mua hàng': 'purchase_receipt',
      'Hóa đơn đầu vào': 'purchase_invoice', 'Trả/giảm giá': 'purchase_return', 'Công nợ NCC': null
    },
    sales: {
      'Báo giá': 'quotation', 'Đơn bán': 'sales_order', 'Bán hàng': 'sales_invoice', 'Hóa đơn': 'sales_invoice',
      'Trả/giảm giá': 'sales_return', 'Thu nợ': 'customer_receipt', 'Công nợ KH': null
    },
    inventory: {
      'Nhập kho': 'stock_receipt', 'Xuất kho': 'stock_issue', 'Chuyển kho': 'stock_transfer',
      'Kiểm kê': 'stock_count', 'Tồn kho': null, 'Tính giá xuất kho': 'stock_revaluation'
    },
    'fixed-assets': {
      'Ghi tăng TSCĐ': 'asset_increase', 'Khấu hao': 'depreciation', 'Điều chuyển': 'asset_transfer',
      'Đánh giá lại': 'asset_revaluation', 'Ghi giảm': 'asset_decrease', 'Sổ tài sản': null
    },
    tools: {
      'Ghi tăng CCDC': 'tool_increase', 'Phân bổ': 'tool_allocation', 'Điều chuyển': 'tool_transfer',
      'Ghi giảm': 'tool_decrease', 'Chi phí trả trước': 'prepaid_expense'
    },
    payroll: {
      'Bảng lương': 'payroll_sheet', 'BHXH/BHYT/BHTN': 'insurance', 'Thuế TNCN': 'pit_withholding',
      'Hạch toán lương': 'payroll_sheet', 'Thanh toán lương': 'salary_payment'
    },
    tax: {
      'VAT đầu vào/ra': 'vat_declaration', 'TNDN': 'cit_declaration', 'TNCN': 'pit_declaration',
      'Đối chiếu hóa đơn': 'invoice_reconciliation', 'Tờ khai': 'vat_declaration', 'Nộp thuế': 'tax_payment'
    },
    costing: {
      'Tập hợp chi phí': 'cost_collection', 'Phân bổ': 'cost_allocation', 'Dở dang': 'wip_evaluation',
      'Tính giá thành': 'costing_sheet', 'So sánh kế hoạch/thực tế': null
    },
    ledger: {
      'Chứng từ khác': 'general_voucher', 'Sổ nhật ký': null, 'Sổ cái': null,
      'Kết chuyển': 'closing_entry', 'Khóa sổ': 'closing_entry', 'Kiểm tra cân đối': '@reconcile'
    },
    invoice: {
      'Hóa đơn bán ra': 'outgoing_invoice', 'Hóa đơn đầu vào': 'incoming_invoice', 'Phát hành': 'outgoing_invoice',
      'Điều chỉnh/thay thế': 'invoice_adjustment', 'Kiểm tra rủi ro': 'invoice_reconciliation'
    },
    reports: {
      'Bảng cân đối': '@reports', 'KQKD': '@reports', 'Lưu chuyển tiền tệ': '@reports',
      'Công nợ': '@reports', 'Kho': '@reports', 'Thuế': '@reports', 'Báo cáo quản trị': '@reports'
    },
    'ai-control': {
      'AI hạch toán': 'ai_review_case', 'Review queue': 'ai_review_case', 'Đối chiếu sổ sách': 'reconciliation_case',
      'Phát hiện bất thường': 'reconciliation_case', 'Học từ feedback': '@ai-control'
    }
  };

  const esc = (s = '') => String(s).replace(/[&<>"']/g, (m) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[m]));
  const money = (n) => Number(n || 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + ' ₫';
  const notify = (m) => { if (typeof showToast === 'function') showToast(m, 4200); };

  function headers(extra = {}) {
    const cfg = window.FINIIP_CONFIG || {};
    const h = {
      'X-Workspace-ID': localStorage.getItem('finiip_workspace_id') || cfg.WORKSPACE_ID || 'personal',
      'X-User-ID': localStorage.getItem('finiip_user_id') || 'v113-user',
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

  function activeModule() {
    return document.querySelector('#accModuleNav')?.dataset.active || 'overview';
  }

  function switchAccountingModule(key) {
    const button = document.querySelector(`[data-module="${CSS.escape(key)}"]`);
    if (button) button.click();
  }

  async function waitForCreateButton(key, timeout = 2500) {
    const started = Date.now();
    while (Date.now() - started < timeout) {
      const b = document.querySelector(`[data-v112-action="create"][data-v112-module="${CSS.escape(key)}"]`);
      if (b) return b;
      await new Promise((r) => setTimeout(r, 60));
    }
    return null;
  }

  async function openCreateForType(key, documentType) {
    if (activeModule() !== key) switchAccountingModule(key);
    const button = await waitForCreateButton(key);
    if (!button) throw new Error('Chưa tải được khu vực chứng từ API');
    button.click();
    const started = Date.now();
    while (Date.now() - started < 2500) {
      const select = document.querySelector('#v112CreateForm select[name="document_type"]');
      if (select) {
        if (documentType && [...select.options].some((o) => o.value === documentType)) select.value = documentType;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        return;
      }
      await new Promise((r) => setTimeout(r, 50));
    }
    throw new Error('Form chứng từ chưa mở được');
  }

  function statusLabel(status) {
    return ({ draft:'Nháp', approved:'Đã duyệt', posted:'Đã ghi sổ', cancelled:'Đã hủy' })[status] || status || '—';
  }

  async function openFeatureBrowser(key, feature, documentType) {
    const query = new URLSearchParams({ module: key, limit: '100' });
    if (documentType) query.set('document_type', documentType);
    const data = await req(`/documents?${query}`);
    const items = data.items || [];
    const title = `${feature} · ${items.length.toLocaleString('vi-VN')} chứng từ`;
    const rows = items.length ? items.map((x) => `
      <tr data-v113-doc="${x.id}">
        <td><button type="button" class="acc-text-btn" data-v113-view="${x.id}">${esc(x.document_no)}</button></td>
        <td>${esc(x.document_date)}</td>
        <td>${esc(x.partner || '—')}</td>
        <td>${esc(x.description || '')}</td>
        <td style="text-align:right"><strong>${money(x.total_amount)}</strong></td>
        <td><span class="acc-v112-status ${esc(x.status)}">${esc(statusLabel(x.status))}</span></td>
      </tr>`).join('') : '<tr><td colspan="6"><div class="acc-empty">Chưa có chứng từ.</div></td></tr>';
    const html = `
      <div class="acc-v112-toolbar" style="margin-bottom:14px">
        <div><span class="acc-v112-pill online">API</span><strong>${esc(feature)}</strong><small>${documentType ? ` · ${esc(documentType)}` : ' · toàn bộ phân hệ'}</small></div>
        ${documentType ? `<button type="button" class="primary-btn" data-v113-create="${esc(documentType)}" data-v113-module="${esc(key)}">+ Thêm mới</button>` : ''}
      </div>
      <div class="acc-table-wrap"><table class="acc-table"><thead><tr><th>Số chứng từ</th><th>Ngày</th><th>Đối tượng</th><th>Diễn giải</th><th style="text-align:right">Giá trị</th><th>Trạng thái</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    if (typeof openModal !== 'function') throw new Error('Modal chưa sẵn sàng');
    openModal({ title, kicker: `FINIIP ACCOUNTING · V${VERSION}`, wide: true, html, onOpen: (modal) => {
      modal.querySelector('[data-v113-create]')?.addEventListener('click', async (e) => {
        const b = e.currentTarget; if (typeof closeModal === 'function') closeModal();
        try { await openCreateForType(b.dataset.v113Module, b.dataset.v113Create); } catch (err) { notify(err.message); }
      });
      modal.querySelectorAll('[data-v113-view]').forEach((b) => b.addEventListener('click', () => openDocumentDetail(Number(b.dataset.v113View), key, feature, documentType)));
    }});
  }

  async function openDocumentDetail(id, key, feature, documentType) {
    const data = await req(`/documents/${id}`); const d = data.document || {};
    const editable = !['posted', 'cancelled'].includes(d.status);
    const html = `
      <form class="v112-form" id="v113EditForm">
        <div class="span-2 v112-api-ready"><b>${esc(d.document_no)}</b> · ${esc(statusLabel(d.status))} · ${money(d.total_amount)}</div>
        <label><span>Ngày chứng từ</span><input type="date" name="document_date" value="${esc(d.document_date || '')}" ${editable ? '' : 'disabled'}></label>
        <label><span>Số chứng từ</span><input name="document_no" value="${esc(d.document_no || '')}" ${editable ? '' : 'disabled'}></label>
        <label class="span-2"><span>Đối tượng</span><input name="partner" value="${esc(d.partner || '')}" ${editable ? '' : 'disabled'}></label>
        <label class="span-2"><span>Diễn giải</span><textarea name="description" rows="3" ${editable ? '' : 'disabled'}>${esc(d.description || '')}</textarea></label>
        <label><span>Giá trị trước thuế</span><input type="number" min="0" step="0.01" name="amount" value="${Number(d.amount || 0)}" ${editable ? '' : 'disabled'}></label>
        <label><span>Thuế / cộng thêm</span><input type="number" min="0" step="0.01" name="tax_amount" value="${Number(d.tax_amount || 0)}" ${editable ? '' : 'disabled'}></label>
        <div class="span-2 v112-form-note">Nợ: <b>${esc(d.debit_account_code || '—')}</b> · Có: <b>${esc(d.credit_account_code || '—')}</b> · Ledger: <b>${esc(d.ledger_status || 'not_posted')}</b></div>
        ${editable ? '<button class="secondary-btn span-2" type="submit">Lưu thay đổi</button>' : ''}
      </form>`;
    openModal({ title: `Chứng từ ${d.document_no || id}`, kicker: 'FINIIP · CHI TIẾT CHỨNG TỪ', wide: true, html, onOpen: (modal) => {
      modal.querySelector('#v113EditForm')?.addEventListener('submit', async (event) => {
        event.preventDefault(); const f = new FormData(event.currentTarget); const btn = event.currentTarget.querySelector('button[type="submit"]'); if (btn) btn.disabled = true;
        try {
          await req(`/documents/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({
            document_no:f.get('document_no'), document_date:f.get('document_date'), partner:f.get('partner') || null,
            description:f.get('description') || null, amount:Number(f.get('amount') || 0), tax_amount:Number(f.get('tax_amount') || 0)
          }) });
          notify('Đã cập nhật chứng từ'); if (typeof closeModal === 'function') closeModal(); await openFeatureBrowser(key, feature, documentType);
        } catch (err) { notify(`Không lưu được: ${err.message}`); if (btn) btn.disabled = false; }
      });
    }});
  }

  async function openReconciliation() {
    const data = await req('/reconciliation');
    const html = `<div class="${data.status === 'ok' ? 'v112-api-ready' : 'v112-api-warning'}">Kết quả: <b>${data.status === 'ok' ? 'Không có cảnh báo trọng yếu' : `${data.issues} vấn đề cần chú ý`}</b></div><div class="v112-reconcile">${(data.checks || []).map((x) => `<div class="v112-check ${esc(x.severity)}"><span class="dot"></span><span>${esc(x.label)}</span><strong>${Number(x.count || 0).toLocaleString('vi-VN')}</strong></div>`).join('')}</div>`;
    openModal({ title:'Đối chiếu kế toán', kicker:'FINIIP · CONTROL CENTER API', wide:true, html });
  }

  async function routeFeature(button) {
    const key = button.dataset.moduleKey || activeModule();
    const feature = button.dataset.accFeature || '';
    const target = FEATURE_MAP[key]?.[feature];
    if (target === '@reports') {
      if (typeof switchView === 'function') switchView('documents');
      return;
    }
    if (target === '@reconcile') { await openReconciliation(); return; }
    if (target === '@ai-control') { switchAccountingModule('ai-control'); return; }
    await openFeatureBrowser(key, feature, target || null);
  }

  function polishUi() {
    document.querySelectorAll('[data-acc-feature] small').forEach((el) => { el.textContent = 'Mở nghiệp vụ và dữ liệu API'; });
    document.querySelectorAll('.accounting-nav-badge').forEach((el) => { el.textContent = 'V113'; });
    const eye = document.querySelector('.accounting-hero .page-eyebrow'); if (eye) eye.textContent = 'FINIIP ACCOUNTING SUITE · V113';
    document.querySelectorAll('.acc-note p').forEach((p) => { p.textContent = 'Các chức năng trong phân hệ này thao tác trực tiếp trên API kế toán. AI chỉ được mở khi người dùng chủ động chọn chức năng AI.'; });
  }

  document.addEventListener('click', (event) => {
    const feature = event.target.closest('[data-acc-feature]');
    if (feature) {
      event.preventDefault(); event.stopImmediatePropagation();
      routeFeature(feature).catch((e) => notify(`API kế toán: ${e.message}`));
      return;
    }
    const reconcile = event.target.closest('[data-acc-action="reconcile"]');
    if (reconcile) {
      event.preventDefault(); event.stopImmediatePropagation();
      openReconciliation().catch((e) => notify(`Đối chiếu: ${e.message}`));
    }
  }, true);

  const observer = new MutationObserver(() => polishUi());
  const init = () => {
    polishUi();
    const root = document.querySelector('#accountingView');
    if (root) observer.observe(root, { childList:true, subtree:true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();