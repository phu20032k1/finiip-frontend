const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const elements = {
  sidebar: $('#sidebar'), collapseBtn: $('#collapseBtn'), mobileMenu: $('#mobileMenu'), brandBtn: $('#brandBtn'),
  newChatBtn: $('#newChatBtn'), historySection: $('#historySection'), historyList: $('#historyList'), refreshHistoryBtn: $('#refreshHistoryBtn'),
  input: $('#messageInput'), sendBtn: $('#sendBtn'), welcomeState: $('#welcomeState'), conversation: $('#conversation'), chatStage: $('#chatStage'),
  composer: $('#composer'), composerWrap: $('#composerWrap'), attachBtn: $('#attachBtn'), fileInput: $('#fileInput'), attachmentTray: $('#attachmentTray'),
  chatDropOverlay: $('#chatDropOverlay'), toast: $('#toast'), toastText: $('#toastText'), sourceToggle: $('#sourceToggle'), deepToggle: $('#deepToggle'),
  apiStatusBtn: $('#apiStatusBtn'), apiStatusText: $('#apiStatusText'), charCount: $('#charCount'),
  shareBtn: $('#shareBtn'), conversationMenuBtn: $('#conversationMenuBtn'), capabilitiesBtn: $('#capabilitiesBtn'), capabilityCardBtn: $('#capabilityCardBtn'),
  profileBtn: $('#profileBtn'), profileName: $('#profileName'), profileAvatar: $('#profileAvatar'), profileWorkspace: $('#profileWorkspace'),
  topbarTitle: $('#topbarTitle'), topbarSubtitle: $('#topbarSubtitle'), documentBadge: $('#documentBadge'), knowledgeBadge: $('#knowledgeBadge'),
  documentsView: $('#documentsView'), reportFileInput: $('#reportFileInput'), reportDropzone: $('#reportDropzone'), reportSelectedFiles: $('#reportSelectedFiles'),
  reportTitle: $('#reportTitle'), reportInstruction: $('#reportInstruction'), reportTaskType: $('#reportTaskType'), reportOutputFormat: $('#reportOutputFormat'),
  reportStyle: $('#reportStyle'), createReportBtn: $('#createReportBtn'), reportProgress: $('#reportProgress'), reportProgressTitle: $('#reportProgressTitle'),
  reportProgressText: $('#reportProgressText'), refreshReportsBtn: $('#refreshReportsBtn'), reportHistory: $('#reportHistory'), reportCountLabel: $('#reportCountLabel'),
  fileCapabilityList: $('#fileCapabilityList'), reportFormatHint: $('#reportFormatHint'),
  knowledgeView: $('#knowledgeView'), knowledgeStats: $('#knowledgeStats'), knowledgeList: $('#knowledgeList'), knowledgeSearch: $('#knowledgeSearch'),
  refreshKnowledgeBtn: $('#refreshKnowledgeBtn'), knowledgeFileInput: $('#knowledgeFileInput'), knowledgeDropzone: $('#knowledgeDropzone'),
  knowledgeFileLabel: $('#knowledgeFileLabel'), knowledgeTitle: $('#knowledgeTitle'), knowledgeCategory: $('#knowledgeCategory'), knowledgeStatus: $('#knowledgeStatus'),
  knowledgeTags: $('#knowledgeTags'), uploadKnowledgeBtn: $('#uploadKnowledgeBtn'),
  modalBackdrop: $('#modalBackdrop'), modal: $('#modal'), modalKicker: $('#modalKicker'), modalTitle: $('#modalTitle'), modalBody: $('#modalBody'),
  modalFooter: $('#modalFooter'), modalCloseBtn: $('#modalCloseBtn'),
};

const config = window.FINIIP_CONFIG || {};
const state = {
  apiBase: (localStorage.getItem('finiip_api_base') || config.API_BASE_URL || 'http://localhost:8000').replace(/\/$/, ''),
  apiKey: sessionStorage.getItem('finiip_api_key') || config.API_KEY || '',
  workspaceId: localStorage.getItem('finiip_workspace_id') || config.WORKSPACE_ID || 'personal',
  userName: localStorage.getItem('finiip_user_name') || config.USER_NAME || 'Phú',
  userId: localStorage.getItem('finiip_user_id') || '',
  conversationId: null,
  pendingAttachments: [],
  reportFiles: [],
  knowledgeFile: null,
  deep: false,
  busy: false,
  currentView: 'chat',
  status: null,
  capabilities: null,
  fileCapabilities: null,
  reportPollers: new Map(),
  maxMessageChars: 100000,
  maxAttachments: 12,
};

if (!state.userId) {
  state.userId = window.crypto?.randomUUID?.() || `user-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  localStorage.setItem('finiip_user_id', state.userId);
}

const icon = (name) => {
  const icons = {
    bot: '<svg viewBox="0 0 24 24"><path d="M8.2 6.5A5.6 5.6 0 0 1 18 10.2c0 3.1-2.5 5.6-5.6 5.6H8.7A4.7 4.7 0 0 1 4 11.1a4.6 4.6 0 0 1 4.2-4.6Z"/><path d="M8.5 11.7h7M10 14.2h4"/></svg>',
    copy: '<svg viewBox="0 0 24 24"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>',
    up: '<svg viewBox="0 0 24 24"><path d="M7 10v10H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2ZM7 10l4-8c1.5 0 3 1 3 3v3h4.6a2 2 0 0 1 2 2.3l-1.1 8a2 2 0 0 1-2 1.7H7"/></svg>',
    down: '<svg viewBox="0 0 24 24"><path d="M7 14V4H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2ZM7 14l4 8c1.5 0 3-1 3-3v-3h4.6a2 2 0 0 0 2-2.3l-1.1-8A2 2 0 0 0 17.5 4H7"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg>',
    download: '<svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 20h14"/></svg>',
    file: '<svg viewBox="0 0 24 24"><path d="M6 3.5h8l4 4v13H6Z"/><path d="M14 3.5v4h4"/></svg>',
    source: '<svg viewBox="0 0 24 24"><path d="M4 5h16v14H4Z"/><path d="M8 9h8M8 13h5"/></svg>',
    warning: '<svg viewBox="0 0 24 24"><path d="M12 3 2.8 20h18.4Z"/><path d="M12 9v5M12 17h.01"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13"/></svg>',
    edit: '<svg viewBox="0 0 24 24"><path d="m4 20 4.5-1 10-10-3.5-3.5-10 10Z"/><path d="m13.5 7 3.5 3.5"/></svg>',
    archive: '<svg viewBox="0 0 24 24"><path d="M4 7h16v13H4Z"/><path d="M3 4h18v3H3ZM9 11h6"/></svg>',
    refresh: '<svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/></svg>',
    eye: '<svg viewBox="0 0 24 24"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>',
  };
  return icons[name] || '';
};

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#039;');

const prettyBytes = (bytes = 0) => {
  const n = Number(bytes || 0);
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 ** 2).toFixed(1)} MB`;
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const formatRelative = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const seconds = Math.max(0, (Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Vừa xong';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  if (seconds < 172800) return 'Hôm qua';
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

function inlineMarkdown(value = '') {
  let text = escapeHtml(value);
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/(^|\s)\*([^*]+)\*(?=\s|$)/g, '$1<em>$2</em>');
  text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  return text;
}

function renderMarkdown(value = '') {
  const lines = String(value || '').replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let listType = null;
  let code = false;
  let codeLines = [];
  const closeList = () => { if (listType) { out.push(`</${listType}>`); listType = null; } };

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];
    const trimmed = raw.trim();
    if (trimmed.startsWith('```')) {
      closeList();
      if (code) {
        out.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
        codeLines = [];
      }
      code = !code;
      continue;
    }
    if (code) { codeLines.push(raw); continue; }
    if (!trimmed) { closeList(); out.push('<div class="answer-space"></div>'); continue; }

    if (trimmed.includes('|') && i + 1 < lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[i + 1])) {
      closeList();
      const rows = [];
      const splitRow = (row) => row.replace(/^\s*\||\|\s*$/g, '').split('|').map((cell) => inlineMarkdown(cell.trim()));
      rows.push(splitRow(raw));
      i += 2;
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) { rows.push(splitRow(lines[i])); i += 1; }
      i -= 1;
      out.push('<div class="table-scroll"><table><thead><tr>' + rows[0].map((cell) => `<th>${cell}</th>`).join('') + '</tr></thead><tbody>' + rows.slice(1).map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('') + '</tbody></table></div>');
      continue;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.+)/);
    if (heading) { closeList(); const level = Math.min(4, heading[1].length + 1); out.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`); continue; }
    const unordered = raw.match(/^\s*[-*]\s+(.+)/);
    if (unordered) { if (listType !== 'ul') { closeList(); listType = 'ul'; out.push('<ul>'); } out.push(`<li>${inlineMarkdown(unordered[1])}</li>`); continue; }
    const ordered = raw.match(/^\s*\d+[.)]\s+(.+)/);
    if (ordered) { if (listType !== 'ol') { closeList(); listType = 'ol'; out.push('<ol>'); } out.push(`<li>${inlineMarkdown(ordered[1])}</li>`); continue; }
    closeList();
    if (trimmed.startsWith('>')) out.push(`<blockquote>${inlineMarkdown(trimmed.replace(/^>\s?/, ''))}</blockquote>`);
    else out.push(`<p>${inlineMarkdown(raw)}</p>`);
  }
  closeList();
  if (codeLines.length) out.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
  return out.join('');
}


function cleanAssistantContent(content = '', hasGeneratedFile = false) {
  let text = String(content || '');
  text = text.replace(/^\s*(Nguồn nội bộ|Nguồn tham khảo|Source)\s*:\s*(?:knowledge_base\/|services\/|data\/).*$/gim, '');
  text = text.replace(/\n?Giao diện có thể dùng nút tải xuống từ trường `generated_file\.download_url`\.?/gi, '');
  if (hasGeneratedFile) {
    text = text.replace(/\n?Mình đã tạo file \*\*[^*]+\*\*\.?/gi, '');
  }
  return text.replace(/\n{3,}/g, '\n\n').trim();
}

function prettySourceTitle(source = {}) {
  const raw = String(source.title || source.file_name || source.filename || 'Tài liệu tham chiếu');
  const base = raw.split(/[\\/]/).pop().replace(/\.(md|txt|pdf|docx?|xlsx?|csv|json|html?)$/i, '').replace(/[_-]+/g, ' ').trim();
  const map = {
    'accounting accounts': 'Hệ thống tài khoản kế toán',
    'he thong tai khoan': 'Hệ thống tài khoản kế toán',
    'ke toan co ban': 'Kiến thức kế toán cơ bản',
    'vat hoa don': 'VAT và hóa đơn',
    'cau hoi thuong gap': 'Câu hỏi nghiệp vụ thường gặp',
  };
  return map[base.toLowerCase()] || base.replace(/\b\w/g, (char) => char.toUpperCase()) || 'Tài liệu tham chiếu';
}

function apiHeaders(extra = {}) {
  const headers = { 'X-User-ID': state.userId, 'X-Workspace-ID': state.workspaceId, ...extra };
  if (state.apiKey) headers['X-API-Key'] = state.apiKey;
  return headers;
}

async function api(path, options = {}) {
  const response = await fetch(`${state.apiBase}${path}`, { ...options, headers: apiHeaders(options.headers || {}) });
  const contentType = response.headers.get('content-type') || '';
  let payload = null;
  if (response.status !== 204) {
    try { payload = contentType.includes('application/json') ? await response.json() : await response.text(); } catch { payload = {}; }
  }
  if (!response.ok) {
    const detail = typeof payload === 'string' ? payload : (typeof payload?.detail === 'string' ? payload.detail : JSON.stringify(payload?.detail || payload || {}));
    throw new Error(detail || `HTTP ${response.status}`);
  }
  return payload || {};
}

async function downloadWithHeaders(path, filename = 'finiip-file') {
  const url = path.startsWith('http') ? path : `${state.apiBase}${path}`;
  const response = await fetch(url, { headers: apiHeaders() });
  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try { const data = await response.json(); detail = data.detail || detail; } catch {}
    throw new Error(detail);
  }
  const blob = await response.blob();
  const disposition = response.headers.get('content-disposition') || '';
  const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)/i);
  const safeName = match ? decodeURIComponent(match[1]) : filename;
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = safeName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1500);
}

function showToast(message, duration = 2800) {
  elements.toastText.textContent = message;
  elements.toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => elements.toast.classList.remove('show'), duration);
}

function openModal({ title, kicker = 'FINIIP', html = '', footer = '', wide = false, onOpen = null }) {
  elements.modalKicker.textContent = kicker;
  elements.modalTitle.textContent = title;
  elements.modalBody.innerHTML = html;
  elements.modalFooter.innerHTML = footer;
  elements.modalFooter.classList.toggle('hidden', !footer);
  elements.modal.classList.toggle('modal-wide', wide);
  elements.modalBackdrop.classList.remove('hidden');
  elements.modalBackdrop.setAttribute('aria-hidden', 'false');
  if (onOpen) onOpen(elements.modal);
}

function closeModal() {
  elements.modalBackdrop.classList.add('hidden');
  elements.modalBackdrop.setAttribute('aria-hidden', 'true');
  elements.modal.classList.remove('modal-wide');
  elements.modalBody.innerHTML = '';
  elements.modalFooter.innerHTML = '';
}

function setApiStatus(ok, label) {
  elements.apiStatusBtn.classList.toggle('offline', !ok);
  elements.apiStatusText.textContent = label;
}

function updateProfile() {
  elements.profileName.textContent = state.userName;
  elements.profileAvatar.textContent = (state.userName.trim()[0] || 'P').toUpperCase();
  elements.profileWorkspace.textContent = `Workspace: ${state.workspaceId}`;
}

async function checkApi() {
  setApiStatus(false, 'Đang kết nối API');
  try {
    const [status, capabilities] = await Promise.all([
      api('/api/v1/chat/status'),
      api('/api/v1/chat/capabilities').catch(() => null),
    ]);
    state.status = status;
    state.capabilities = capabilities;
    state.maxMessageChars = Number(status?.limits?.message_chars || capabilities?.long_question?.max_message_chars || 100000);
    state.maxAttachments = Number(status?.limits?.attachments_per_message || 12);
    elements.input.maxLength = state.maxMessageChars;
    setApiStatus(true, `API ${status.version || 'V110'} đã kết nối`);
    return true;
  } catch {
    state.status = null;
    state.capabilities = null;
    setApiStatus(false, 'Chưa kết nối API');
    return false;
  }
}

function autoResize() {
  elements.input.style.height = 'auto';
  elements.input.style.height = `${Math.min(elements.input.scrollHeight, 220)}px`;
  const length = elements.input.value.length;
  elements.charCount.textContent = length.toLocaleString('vi-VN');
  elements.charCount.classList.toggle('near-limit', length > state.maxMessageChars * 0.9);
  elements.sendBtn.disabled = state.busy || (!elements.input.value.trim() && !state.pendingAttachments.length);
}

function scrollBottom() {
  requestAnimationFrame(() => elements.chatStage.scrollTo({ top: elements.chatStage.scrollHeight, behavior: 'smooth' }));
}

function switchView(view) {
  state.currentView = view;
  $$('.workspace-view').forEach((panel) => panel.classList.toggle('hidden', panel.dataset.viewPanel !== view));
  $$('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.view === view));
  elements.composerWrap.classList.toggle('hidden', view !== 'chat');
  elements.historySection.classList.toggle('non-chat-history', view !== 'chat');
  const labels = {
    chat: ['Finiip Expert', 'Kế toán · Thuế · Pháp lý · Báo cáo'],
    documents: ['Tài liệu & báo cáo', 'Đọc file · OCR · Xuất Word, Excel, PDF'],
    knowledge: ['Kho kiến thức', 'Quản lý tài liệu RAG theo workspace'],
  };
  [elements.topbarTitle.textContent, elements.topbarSubtitle.textContent] = labels[view] || labels.chat;
  elements.shareBtn.classList.toggle('hidden', view !== 'chat');
  elements.conversationMenuBtn.classList.toggle('hidden', view !== 'chat');
  if (view === 'documents') { loadFileCapabilities(); refreshReportHistory(); }
  if (view === 'knowledge') { refreshKnowledge(); }
  if (window.innerWidth <= 960) elements.sidebar.classList.remove('mobile-open');
}

function resetChat() {
  switchView('chat');
  state.conversationId = null;
  state.pendingAttachments = [];
  renderAttachmentTray();
  elements.welcomeState.classList.remove('hidden');
  elements.conversation.classList.add('hidden');
  elements.conversation.innerHTML = '';
  elements.input.value = '';
  history.replaceState(null, '', location.pathname + location.search);
  autoResize();
  $$('.history-item').forEach((node) => node.classList.remove('selected'));
  elements.input.focus();
}

function addUserMessage(text, attachmentNames = []) {
  elements.welcomeState.classList.add('hidden');
  elements.conversation.classList.remove('hidden');
  const files = attachmentNames.length ? `<div class="message-files">${attachmentNames.map((name) => `<span>${icon('file')}${escapeHtml(name)}</span>`).join('')}</div>` : '';
  elements.conversation.insertAdjacentHTML('beforeend', `
    <article class="message-row user">
      <div class="message-avatar">${escapeHtml((state.userName[0] || 'P').toUpperCase())}</div>
      <div class="message-content"><div class="name">Bạn</div><div class="message-bubble"><p>${escapeHtml(text).replaceAll('\n', '<br>')}</p>${files}</div></div>
    </article>`);
}

function addTyping() {
  const typingId = `typing-${Date.now()}`;
  elements.conversation.insertAdjacentHTML('beforeend', `
    <article class="message-row" id="${typingId}">
      <div class="message-avatar">${icon('bot')}</div>
      <div class="message-content"><div class="name">Finiip Expert <span>· đang phân tích</span></div><div class="message-bubble typing-bubble"><span class="typing"><i></i><i></i><i></i></span><small class="typing-status">Đang hiểu yêu cầu và tìm kiến thức phù hợp…</small></div></div>
    </article>`);
  return typingId;
}

function updateTyping(typingId, analysis) {
  const status = $(`#${typingId} .typing-status`);
  if (!status || !analysis) return;
  const count = Number(analysis.task_count || analysis.tasks?.length || 1);
  if (analysis.is_complex || count > 1) status.textContent = `Đã nhận diện ${count} đầu việc · đang xử lý lần lượt và tổng hợp…`;
  else if (analysis.needs_calculation) status.textContent = 'Đã nhận diện bài toán số · đang kiểm tra công thức và kết quả…';
  else if (analysis.needs_file) status.textContent = 'Đang chọn các phần liên quan trong tài liệu đính kèm…';
}

function normalizeSourceCards(cards = [], citations = []) {
  const items = cards.length ? cards : citations;
  return (items || []).slice(0, 12).map((source, index) => ({
    index: source.index || index + 1,
    title: prettySourceTitle(source),
    badge: source.badge || (source.chunk_id ? 'Tài liệu RAG' : 'Tệp tham chiếu'),
    location: source.location || source.section || (source.page ? `Trang ${source.page}` : 'Kho kiến thức Finiip'),
    excerpt: source.excerpt || '',
  }));
}

function sourceMarkup(cards = [], citations = []) {
  const sources = normalizeSourceCards(cards, citations);
  if (!sources.length) return '';
  return `<details class="source-section">
    <summary>${icon('source')}<span><strong>${sources.length} nguồn tham chiếu</strong><small>Nguồn được tách riêng, không làm rối câu trả lời</small></span><span class="source-chevron">⌄</span></summary>
    <div class="source-card-grid">${sources.map((source) => `
      <article class="source-card"><div class="source-card-top"><span class="source-index">${String(source.index).padStart(2, '0')}</span><span class="source-badge">${escapeHtml(source.badge)}</span></div><strong>${escapeHtml(source.title)}</strong><small>${escapeHtml(source.location)}</small>${source.excerpt ? `<p>${escapeHtml(source.excerpt)}</p>` : ''}</article>`).join('')}</div>
  </details>`;
}

function generatedFileMarkup(file) {
  if (!file) return '';
  if (file.status === 'failed') return `<div class="quality-notice danger">${icon('warning')}<div><strong>Chưa tạo được file</strong><small>${escapeHtml(file.error || 'Backend báo lỗi khi xuất file.')}</small></div></div>`;
  if (file.status !== 'done' || !file.download_url) return `<div class="file-result pending">${icon('file')}<div><strong>File đang được chuẩn bị</strong><small>${escapeHtml(file.filename || file.output_format || 'Báo cáo')}</small></div></div>`;
  return `<div class="file-result"><span class="file-result-icon">${icon('file')}</span><div><strong>${escapeHtml(file.filename || `bao-cao.${file.output_format || 'docx'}`)}</strong><small>Đã tạo xong · ${String(file.output_format || '').toUpperCase()}</small></div><button type="button" data-download-path="${escapeHtml(file.download_url)}" data-download-name="${escapeHtml(file.filename || 'finiip-report')}">${icon('download')}Tải file</button></div>`;
}

function qualityMarkup(quality = {}) {
  const warnings = quality.warnings || quality.issues || [];
  if (!warnings.length) return '';
  return `<details class="quality-notice"><summary>${icon('warning')}<span>Có ${warnings.length} lưu ý cần kiểm tra</span></summary><ul>${warnings.map((item) => `<li>${escapeHtml(String(item).replaceAll('_', ' '))}</li>`).join('')}</ul></details>`;
}

function metaMarkup(extras = {}) {
  const analysis = extras.requestAnalysis || {};
  const chips = [];
  if (extras.confidence && extras.confidence !== 'unknown') chips.push(`Tin cậy: ${String(extras.confidence).replaceAll('_', ' ')}`);
  if (analysis.task_count > 1 || extras.subtaskCount > 1) chips.push(`${extras.subtaskCount || analysis.task_count} đầu việc`);
  if (extras.llmUsed) chips.push('AI tổng hợp');
  if (extras.followupContextUsed) chips.push('Đã dùng ngữ cảnh trước');
  return chips.length ? `<div class="answer-meta">${chips.map((chip) => `<span>${escapeHtml(chip)}</span>`).join('')}</div>` : '';
}

function suggestedMarkup(items = []) {
  if (!items.length) return '';
  return `<div class="followup-block"><span>Hỏi tiếp</span><div>${items.slice(0, 4).map((item) => `<button type="button" data-followup="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join('')}</div></div>`;
}

function bindMessageActions(article, message) {
  $('[data-copy]', article)?.addEventListener('click', async () => {
    await navigator.clipboard.writeText(message.content || '');
    showToast('Đã sao chép câu trả lời');
  });
  $$('[data-rating]', article).forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        await api(`/api/v1/chat/messages/${message.id}/feedback`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rating: button.dataset.rating }) });
        $$('[data-rating]', article).forEach((node) => node.classList.remove('selected'));
        button.classList.add('selected');
        showToast('Cảm ơn bạn đã đánh giá');
      } catch (error) { showToast(`Không lưu được đánh giá: ${error.message}`); }
    });
  });
  $$('[data-download-path]', article).forEach((button) => {
    button.addEventListener('click', async () => {
      button.disabled = true;
      try { await downloadWithHeaders(button.dataset.downloadPath, button.dataset.downloadName); showToast('Đã tải file'); }
      catch (error) { showToast(`Không tải được file: ${error.message}`, 5000); }
      finally { button.disabled = false; }
    });
  });
  $$('[data-followup]', article).forEach((button) => button.addEventListener('click', () => submitMessage(button.dataset.followup)));
}

function addAssistantMessage(message, extras = {}) {
  elements.welcomeState.classList.add('hidden');
  elements.conversation.classList.remove('hidden');
  const metadata = message.metadata || {};
  const generatedFile = extras.generatedFile || metadata.generated_file;
  const quality = extras.quality || metadata.quality || {};
  const article = document.createElement('article');
  article.className = 'message-row';
  article.innerHTML = `
    <div class="message-avatar">${icon('bot')}</div>
    <div class="message-content">
      <div class="name">Finiip Expert <span>· vừa xong</span></div>
      <div class="message-bubble answer-body">${renderMarkdown(cleanAssistantContent(message.content || '', Boolean(generatedFile?.download_url)))}</div>
      ${metaMarkup({ ...extras, requestAnalysis: extras.requestAnalysis || metadata.request_analysis, confidence: extras.confidence || message.confidence, subtaskCount: extras.subtaskCount || metadata.subtask_count, llmUsed: extras.llmUsed ?? metadata.llm_used, followupContextUsed: extras.followupContextUsed ?? metadata.followup_context_used })}
      ${generatedFileMarkup(generatedFile)}
      ${qualityMarkup(quality)}
      ${sourceMarkup(extras.sourceCards || [], extras.citations || message.citations || [])}
      ${suggestedMarkup(extras.suggestedQuestions || [])}
      <div class="message-actions"><button type="button" title="Sao chép" data-copy>${icon('copy')}</button><button type="button" title="Hữu ích" data-rating="up">${icon('up')}</button><button type="button" title="Chưa tốt" data-rating="down">${icon('down')}</button></div>
    </div>`;
  elements.conversation.appendChild(article);
  bindMessageActions(article, message);
  scrollBottom();
}

function addErrorMessage(message) {
  elements.welcomeState.classList.add('hidden');
  elements.conversation.classList.remove('hidden');
  elements.conversation.insertAdjacentHTML('beforeend', `<article class="message-row error-row"><div class="message-avatar">!</div><div class="message-content"><div class="name">Không gửi được</div><div class="message-bubble"><p>${escapeHtml(message)}</p></div></div></article>`);
  scrollBottom();
}

function renderHistory(items) {
  if (!items.length) { elements.historyList.innerHTML = '<div class="history-empty sidebar-label">Chưa có cuộc trò chuyện</div>'; return; }
  elements.historyList.innerHTML = items.map((item, index) => `
    <div class="history-entry ${item.id === state.conversationId ? 'selected' : ''}">
      <button class="history-item" type="button" data-id="${escapeHtml(item.id)}"><span class="history-dot ${['', 'violet', 'amber', 'rose'][index % 4]}"></span><span class="history-text sidebar-label"><strong>${escapeHtml(item.title || 'Cuộc trò chuyện')}</strong><small>${formatRelative(item.last_message_at || item.updated_at)}</small></span></button>
      <button class="history-menu sidebar-label" type="button" data-menu-id="${escapeHtml(item.id)}" data-menu-title="${escapeHtml(item.title || 'Cuộc trò chuyện')}">•••</button>
    </div>`).join('');
  $$('.history-item', elements.historyList).forEach((item) => item.addEventListener('click', () => loadConversation(item.dataset.id)));
  $$('[data-menu-id]', elements.historyList).forEach((button) => button.addEventListener('click', (event) => { event.stopPropagation(); openConversationActions(button.dataset.menuId, button.dataset.menuTitle); }));
}

async function refreshHistory() {
  try { const data = await api('/api/v1/chat/conversations?limit=60'); renderHistory(data.items || []); }
  catch { elements.historyList.innerHTML = '<div class="history-empty sidebar-label">Chưa tải được lịch sử</div>'; }
}

async function ensureConversation() {
  if (state.conversationId) return state.conversationId;
  const data = await api('/api/v1/chat/conversations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
  state.conversationId = data.conversation.id;
  history.replaceState(null, '', `${location.pathname}${location.search}#chat=${state.conversationId}`);
  await refreshHistory();
  return state.conversationId;
}

async function loadConversation(id) {
  if (!id || state.busy) return;
  switchView('chat');
  state.conversationId = id;
  state.pendingAttachments = [];
  renderAttachmentTray();
  elements.welcomeState.classList.add('hidden');
  elements.conversation.classList.remove('hidden');
  elements.conversation.innerHTML = '<div class="loading-history"><span class="progress-spinner"></span>Đang tải cuộc trò chuyện…</div>';
  try {
    const data = await api(`/api/v1/chat/conversations/${id}/messages?limit=300`);
    elements.conversation.innerHTML = '';
    for (const message of data.items || []) {
      if (message.role === 'user') addUserMessage(message.content);
      else addAssistantMessage(message, { citations: message.citations || [], generatedFile: message.metadata?.generated_file, quality: message.metadata?.quality || {}, requestAnalysis: message.metadata?.request_analysis, subtaskCount: message.metadata?.subtask_count, llmUsed: message.metadata?.llm_used, followupContextUsed: message.metadata?.followup_context_used });
    }
    if (!(data.items || []).length) resetChat();
    history.replaceState(null, '', `${location.pathname}${location.search}#chat=${id}`);
    await refreshHistory();
    scrollBottom();
  } catch (error) { elements.conversation.innerHTML = ''; addErrorMessage(`Không tải được cuộc trò chuyện: ${error.message}`); }
}

async function submitMessage(value = elements.input.value.trim()) {
  const attachments = [...state.pendingAttachments];
  const text = String(value || '').trim() || (attachments.length ? 'Hãy đọc toàn bộ các tệp đính kèm, tóm tắt nội dung, chỉ ra số liệu quan trọng, rủi ro và đề xuất bước xử lý tiếp theo.' : '');
  if (!text || state.busy) return;
  if (text.length > state.maxMessageChars) { showToast(`Câu hỏi vượt giới hạn ${state.maxMessageChars.toLocaleString('vi-VN')} ký tự`); return; }
  state.busy = true;
  autoResize();
  let typingId = null;
  try {
    await ensureConversation();
    addUserMessage(text, attachments.map((item) => item.file_name));
    elements.input.value = '';
    state.pendingAttachments = [];
    renderAttachmentTray();
    autoResize();
    typingId = addTyping();
    scrollBottom();

    api('/api/v1/chat/analyze-request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text }) })
      .then((data) => updateTyping(typingId, data.analysis)).catch(() => {});

    const data = await api(`/api/v1/chat/conversations/${state.conversationId}/messages`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, mode: state.deep ? 'deep' : 'normal', include_sources: elements.sourceToggle.classList.contains('active'), attachment_ids: attachments.map((item) => item.id) }),
    });
    document.getElementById(typingId)?.remove();
    addAssistantMessage(data.message, {
      citations: data.citations || [], sourceCards: data.source_cards || [], generatedFile: data.generated_file,
      quality: data.quality || {}, suggestedQuestions: data.suggested_questions || [], confidence: data.confidence,
      requestAnalysis: data.request_analysis, subtaskCount: data.subtask_count, llmUsed: data.llm_used, followupContextUsed: data.followup_context_used,
    });
    await refreshHistory();
  } catch (error) {
    if (typingId) document.getElementById(typingId)?.remove();
    addErrorMessage(error.message || 'Backend chưa phản hồi.');
  } finally { state.busy = false; autoResize(); }
}

function renderAttachmentTray() {
  if (!state.pendingAttachments.length) { elements.attachmentTray.classList.add('hidden'); elements.attachmentTray.innerHTML = ''; autoResize(); return; }
  elements.attachmentTray.classList.remove('hidden');
  elements.attachmentTray.innerHTML = state.pendingAttachments.map((item) => `<span class="attachment-chip" data-id="${escapeHtml(item.id)}">${icon('file')}<span><strong>${escapeHtml(item.file_name)}</strong><small>${prettyBytes(item.size_bytes)} · đã đọc ${Number(item.text_length || 0).toLocaleString('vi-VN')} ký tự</small></span><button type="button" title="Bỏ tệp">${icon('close')}</button></span>`).join('');
  $$('.attachment-chip button', elements.attachmentTray).forEach((button) => button.addEventListener('click', async () => {
    const chip = button.closest('.attachment-chip');
    const id = chip.dataset.id;
    state.pendingAttachments = state.pendingAttachments.filter((item) => item.id !== id);
    renderAttachmentTray();
    try { await api(`/api/v1/chat/attachments/${id}`, { method: 'DELETE' }); } catch {}
  }));
  autoResize();
}

async function uploadFiles(files) {
  const list = [...(files || [])];
  if (!list.length) return;
  if (state.pendingAttachments.length + list.length > state.maxAttachments) { showToast(`Tối đa ${state.maxAttachments} tệp cho mỗi câu hỏi`); return; }
  await ensureConversation();
  let ok = 0;
  for (const file of list) {
    try {
      showToast(`Đang đọc ${file.name} (${ok + 1}/${list.length})…`, 12000);
      const form = new FormData(); form.append('file', file); form.append('conversation_id', state.conversationId);
      const data = await api('/api/v1/chat/attachments', { method: 'POST', body: form });
      state.pendingAttachments.push(data.attachment); ok += 1; renderAttachmentTray();
    } catch (error) { showToast(`Không đọc được ${file.name}: ${error.message}`, 5000); }
  }
  elements.fileInput.value = '';
  showToast(`Đã đọc ${ok}/${list.length} tệp`);
}

function openConversationActions(id = state.conversationId, title = 'Cuộc trò chuyện') {
  if (!id) { showToast('Chưa có cuộc trò chuyện đang mở'); return; }
  openModal({
    title: 'Tùy chọn cuộc trò chuyện', kicker: 'QUẢN LÝ',
    html: `<div class="action-list"><button data-action="rename">${icon('edit')}<span><strong>Đổi tên</strong><small>${escapeHtml(title)}</small></span></button><button data-action="archive">${icon('archive')}<span><strong>Lưu trữ</strong><small>Ẩn khỏi danh sách gần đây</small></span></button><button class="danger" data-action="delete">${icon('trash')}<span><strong>Xóa cuộc trò chuyện</strong><small>Xóa tin nhắn và tệp đính kèm</small></span></button></div>`,
    onOpen: (modal) => {
      $('[data-action="rename"]', modal).onclick = async () => {
        const next = prompt('Tên mới của cuộc trò chuyện:', title);
        if (!next?.trim()) return;
        await api(`/api/v1/chat/conversations/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: next.trim() }) });
        closeModal(); await refreshHistory(); showToast('Đã đổi tên cuộc trò chuyện');
      };
      $('[data-action="archive"]', modal).onclick = async () => {
        await api(`/api/v1/chat/conversations/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_archived: true }) });
        closeModal(); if (id === state.conversationId) resetChat(); await refreshHistory(); showToast('Đã lưu trữ cuộc trò chuyện');
      };
      $('[data-action="delete"]', modal).onclick = async () => {
        if (!confirm('Xóa vĩnh viễn cuộc trò chuyện này?')) return;
        await api(`/api/v1/chat/conversations/${id}`, { method: 'DELETE' });
        closeModal(); if (id === state.conversationId) resetChat(); await refreshHistory(); showToast('Đã xóa cuộc trò chuyện');
      };
    },
  });
}

function openSettings() {
  openModal({
    title: 'Kết nối backend', kicker: 'CẤU HÌNH',
    html: `<div class="modal-form"><label class="field"><span>URL backend</span><input id="settingsApiBase" value="${escapeHtml(state.apiBase)}" placeholder="https://finiip-backend.onrender.com" /></label><label class="field"><span>API key <small>(lưu trong phiên trình duyệt)</small></span><input id="settingsApiKey" type="password" value="${escapeHtml(state.apiKey)}" placeholder="Để trống nếu backend không yêu cầu" /></label><label class="field"><span>Workspace ID</span><input id="settingsWorkspace" value="${escapeHtml(state.workspaceId)}" /></label><label class="field"><span>Tên hiển thị</span><input id="settingsName" value="${escapeHtml(state.userName)}" /></label><div class="security-note">Không đặt secret quan trọng trong <code>config.js</code> nếu frontend được công khai. API key nhập ở đây chỉ lưu trong <code>sessionStorage</code>.</div></div>`,
    footer: '<button class="secondary-btn" data-cancel>Hủy</button><button class="primary-btn" data-save>Kết nối & lưu</button>',
    onOpen: (modal) => {
      $('[data-cancel]', modal).onclick = closeModal;
      $('[data-save]', modal).onclick = async () => {
        const base = $('#settingsApiBase', modal).value.trim().replace(/\/$/, '');
        if (!/^https?:\/\//.test(base)) { showToast('URL phải bắt đầu bằng http:// hoặc https://'); return; }
        state.apiBase = base;
        state.apiKey = $('#settingsApiKey', modal).value.trim();
        state.workspaceId = $('#settingsWorkspace', modal).value.trim() || 'personal';
        state.userName = $('#settingsName', modal).value.trim() || 'Phú';
        localStorage.setItem('finiip_api_base', state.apiBase); localStorage.setItem('finiip_workspace_id', state.workspaceId); localStorage.setItem('finiip_user_name', state.userName);
        if (state.apiKey) sessionStorage.setItem('finiip_api_key', state.apiKey); else sessionStorage.removeItem('finiip_api_key');
        updateProfile();
        const ok = await checkApi();
        if (ok) { closeModal(); await Promise.all([refreshHistory(), refreshReportHistory(), refreshKnowledge()]); showToast('Đã kết nối backend'); }
        else showToast('Đã lưu nhưng chưa kết nối được backend', 5000);
      };
    },
  });
}

function openCapabilities() {
  const caps = state.capabilities || {};
  const status = state.status || {};
  const calc = caps.calculation?.supported || [];
  const read = caps.files?.read || [];
  const output = caps.files?.export || [];
  openModal({
    title: 'Finiip có thể làm gì?', kicker: `BACKEND ${escapeHtml(status.version || 'V110')}`, wide: true,
    html: `<div class="capability-modal-grid">
      <article><span class="capability-icon">✦</span><h3>Hỏi dài & nhớ ngữ cảnh</h3><p>Tối đa ${Number(caps.long_question?.max_message_chars || state.maxMessageChars).toLocaleString('vi-VN')} ký tự, tự chia nhiều đầu việc và tổng hợp câu trả lời.</p></article>
      <article><span class="capability-icon">∑</span><h3>Tính toán kiểm soát</h3><p>${calc.length || 18} nhóm công thức: VAT, lợi nhuận, hòa vốn, lãi vay, NPV, IRR, tỷ số tài chính…</p></article>
      <article><span class="capability-icon">▤</span><h3>Đọc tài liệu</h3><p>${read.map((item) => item.toUpperCase()).join(', ') || 'PDF, DOCX, XLSX, CSV, ảnh OCR'}.</p></article>
      <article><span class="capability-icon">⇩</span><h3>Xuất báo cáo</h3><p>${output.map((item) => item.toUpperCase()).join(', ') || 'DOCX, XLSX, PDF, CSV, JSON, TXT, MD'}.</p></article>
    </div><div class="capability-status"><span class="${status.llm_configured ? 'ok' : 'warn'}">${status.llm_configured ? '✓ LLM tổng quát đã cấu hình' : '! Chưa có OPENAI_API_KEY — RAG và engine xác định vẫn hoạt động'}</span><span>Nhớ ${Number(status.limits?.remembered_context_chars || 20000).toLocaleString('vi-VN')} ký tự ngữ cảnh</span><span>Tối đa ${state.maxAttachments} tệp/tin nhắn</span></div>`,
  });
}

async function shareConversation() {
  if (!state.conversationId) { showToast('Chưa có cuộc trò chuyện để chia sẻ'); return; }
  const url = `${location.origin}${location.pathname}${location.search}#chat=${state.conversationId}`;
  await navigator.clipboard.writeText(url);
  showToast('Đã sao chép liên kết cuộc trò chuyện');
}

function renderReportFiles() {
  if (!state.reportFiles.length) { elements.reportSelectedFiles.classList.add('hidden'); elements.reportSelectedFiles.innerHTML = ''; return; }
  elements.reportSelectedFiles.classList.remove('hidden');
  elements.reportSelectedFiles.innerHTML = state.reportFiles.map((file, index) => `<div><span>${icon('file')}</span><span><strong>${escapeHtml(file.name)}</strong><small>${prettyBytes(file.size)}</small></span><button type="button" data-report-remove="${index}">${icon('close')}</button></div>`).join('');
  $$('[data-report-remove]', elements.reportSelectedFiles).forEach((button) => button.onclick = () => { state.reportFiles.splice(Number(button.dataset.reportRemove), 1); renderReportFiles(); });
}

function addReportFiles(files) {
  const list = [...(files || [])];
  const max = Number(state.fileCapabilities?.limits?.max_files || 10);
  state.reportFiles = [...state.reportFiles, ...list].slice(0, max);
  renderReportFiles();
  if (list.length && state.reportFiles.length < list.length) showToast(`Tối đa ${max} tệp cho một báo cáo`);
}

async function loadFileCapabilities() {
  if (state.fileCapabilities) return renderFileCapabilities();
  try { state.fileCapabilities = await api('/ai/v68/file-report/capabilities'); renderFileCapabilities(); }
  catch (error) { elements.fileCapabilityList.innerHTML = `<div class="empty-panel danger-text">Không tải được khả năng file: ${escapeHtml(error.message)}</div>`; }
}

function renderFileCapabilities() {
  const caps = state.fileCapabilities || {};
  const inputFormats = caps.input_formats || state.capabilities?.files?.read || [];
  const outputFormats = caps.output_formats || state.capabilities?.files?.export || [];
  const limits = caps.limits || {};
  elements.reportFormatHint.textContent = `${inputFormats.map((x) => String(x).toUpperCase()).join(', ')} · tối đa ${limits.max_files || 12} tệp`;
  elements.fileCapabilityList.innerHTML = `<div class="cap-row"><span>Định dạng đọc</span><strong>${inputFormats.length} loại</strong></div><div class="cap-tags">${inputFormats.map((x) => `<span>${escapeHtml(String(x).toUpperCase())}</span>`).join('')}</div><div class="cap-row"><span>Định dạng xuất</span><strong>${outputFormats.length} loại</strong></div><div class="cap-tags">${outputFormats.map((x) => `<span>${escapeHtml(String(x).toUpperCase())}</span>`).join('')}</div><div class="cap-row"><span>Giới hạn</span><strong>${limits.max_files || 12} tệp · ${limits.max_file_mb || '—'} MB/tệp</strong></div><div class="cap-row"><span>OCR ảnh/PDF scan</span><strong>${caps.features?.v110_image_ocr ? 'Có' : 'Theo backend'}</strong></div>`;
}

function setReportProgress(show, title = '', text = '') {
  elements.reportProgress.classList.toggle('hidden', !show);
  if (title) elements.reportProgressTitle.textContent = title;
  if (text) elements.reportProgressText.textContent = text;
  elements.createReportBtn.disabled = show;
}

async function createReport() {
  if (!state.reportFiles.length) { showToast('Hãy chọn ít nhất một tệp'); return; }
  const form = new FormData();
  state.reportFiles.forEach((file) => form.append('files', file));
  form.append('instruction', elements.reportInstruction.value.trim() || 'Đọc file và lập báo cáo phân tích chi tiết.');
  form.append('question', elements.reportInstruction.value.trim());
  form.append('task_type', elements.reportTaskType.value);
  form.append('output_format', elements.reportOutputFormat.value);
  form.append('report_style', elements.reportStyle.value);
  form.append('workspace_id', state.workspaceId); form.append('user_id', state.userId); form.append('title', elements.reportTitle.value.trim());
  setReportProgress(true, 'Đang tải tệp lên backend…', `${state.reportFiles.length} tệp · đầu ra ${elements.reportOutputFormat.value.toUpperCase()}`);
  try {
    const job = await api('/ai/v69/file-report/jobs', { method: 'POST', body: form });
    setReportProgress(true, 'Backend đang đọc và lập báo cáo…', `Mã tác vụ: ${job.job_id}`);
    state.reportFiles = []; renderReportFiles();
    await refreshReportHistory();
    pollReportJob(job.job_id, true);
  } catch (error) { setReportProgress(false); showToast(`Không tạo được báo cáo: ${error.message}`, 6000); }
}

async function pollReportJob(jobId, foreground = false) {
  if (!jobId || state.reportPollers.has(jobId)) return;
  let attempts = 0;
  const run = async () => {
    attempts += 1;
    try {
      const job = await api(`/ai/v69/file-report/jobs/${jobId}`);
      if (foreground) setReportProgress(true, job.status === 'running' ? 'Đang phân tích và tạo file…' : 'Đang chờ xử lý…', job.output_filename || `Lần kiểm tra ${attempts}`);
      if (job.status === 'done') {
        state.reportPollers.delete(jobId); if (foreground) setReportProgress(false);
        await refreshReportHistory(); showToast(`Đã tạo xong ${job.output_filename || 'báo cáo'}`, 5000); return;
      }
      if (['failed', 'deleted'].includes(job.status)) {
        state.reportPollers.delete(jobId); if (foreground) setReportProgress(false);
        await refreshReportHistory(); showToast(`Tác vụ thất bại: ${job.error || job.status}`, 6000); return;
      }
    } catch (error) {
      if (attempts > 5) { state.reportPollers.delete(jobId); if (foreground) setReportProgress(false); showToast(`Không kiểm tra được báo cáo: ${error.message}`); return; }
    }
    if (attempts < 120) state.reportPollers.set(jobId, setTimeout(run, 2000));
    else { state.reportPollers.delete(jobId); if (foreground) setReportProgress(false); }
  };
  state.reportPollers.set(jobId, setTimeout(run, 800));
}

function reportStatusLabel(status) {
  const labels = { done: 'Hoàn tất', running: 'Đang xử lý', queued: 'Đang chờ', pending: 'Đang chờ', failed: 'Thất bại', deleted: 'Đã xóa' };
  return labels[status] || status || 'Không rõ';
}

function renderReportHistory(items = []) {
  elements.documentBadge.textContent = items.length;
  elements.reportCountLabel.textContent = `${items.length} báo cáo`;
  if (!items.length) { elements.reportHistory.innerHTML = '<div class="empty-panel">Chưa có báo cáo nào. Hãy chọn tệp và tạo báo cáo đầu tiên.</div>'; return; }
  elements.reportHistory.innerHTML = items.map((job) => {
    const files = job.files || [];
    const filename = job.output_filename || job.title || `Báo cáo ${job.output_format || ''}`;
    return `<article class="report-row"><span class="report-file-icon">${icon('file')}</span><div class="report-main"><strong>${escapeHtml(filename)}</strong><small>${files.length} tệp nguồn · ${String(job.output_format || '').toUpperCase()} · ${formatDate(job.updated_at || job.created_at)}</small></div><span class="status-badge ${escapeHtml(job.status || '')}">${escapeHtml(reportStatusLabel(job.status))}</span><div class="row-actions">${job.status === 'done' ? `<button type="button" data-report-download="${escapeHtml(job.job_id)}" data-report-name="${escapeHtml(filename)}" title="Tải xuống">${icon('download')}</button>` : `<button type="button" data-report-poll="${escapeHtml(job.job_id)}" title="Kiểm tra lại">${icon('refresh')}</button>`}<button type="button" class="danger" data-report-delete="${escapeHtml(job.job_id)}" title="Xóa">${icon('trash')}</button></div></article>`;
  }).join('');
  $$('[data-report-download]', elements.reportHistory).forEach((button) => button.onclick = async () => {
    button.disabled = true; try { await downloadWithHeaders(`/ai/v69/file-report/jobs/${button.dataset.reportDownload}/download`, button.dataset.reportName); }
    catch (error) { showToast(`Không tải được: ${error.message}`); } finally { button.disabled = false; }
  });
  $$('[data-report-poll]', elements.reportHistory).forEach((button) => button.onclick = () => pollReportJob(button.dataset.reportPoll));
  $$('[data-report-delete]', elements.reportHistory).forEach((button) => button.onclick = async () => {
    if (!confirm('Xóa báo cáo này khỏi lịch sử?')) return;
    try { await api(`/ai/v70/file-report/history/${button.dataset.reportDelete}`, { method: 'DELETE' }); await refreshReportHistory(); showToast('Đã xóa báo cáo'); }
    catch (error) { showToast(`Không xóa được: ${error.message}`); }
  });
  items.filter((item) => ['queued', 'running', 'pending'].includes(item.status)).forEach((item) => pollReportJob(item.job_id));
}

async function refreshReportHistory() {
  try {
    const data = await api(`/ai/v70/file-report/history?workspace_id=${encodeURIComponent(state.workspaceId)}&user_id=${encodeURIComponent(state.userId)}&limit=100`);
    renderReportHistory(data.items || []);
  } catch (error) { elements.reportHistory.innerHTML = `<div class="empty-panel danger-text">Không tải được lịch sử báo cáo: ${escapeHtml(error.message)}</div>`; }
}

function renderKnowledgeStats(data = {}) {
  const cards = $$('div.stat-card', elements.knowledgeStats);
  const values = [data.total_documents ?? 0, data.total_chunks ?? 0, data.by_status?.active ?? 0, data.embedding?.provider || data.embedding?.mode || 'local'];
  cards.forEach((card, index) => { $('strong', card).textContent = typeof values[index] === 'number' ? values[index].toLocaleString('vi-VN') : values[index]; });
  elements.knowledgeBadge.textContent = Number(data.total_documents || 0);
}

function renderKnowledgeList(documents = []) {
  if (!documents.length) { elements.knowledgeList.innerHTML = '<div class="empty-panel">Chưa có tài liệu trong workspace này.</div>'; return; }
  elements.knowledgeList.innerHTML = documents.map((doc) => `<article class="knowledge-row" data-document-id="${escapeHtml(doc.id)}"><span class="knowledge-doc-icon">${icon('file')}</span><div class="knowledge-main"><div><strong>${escapeHtml(doc.title || doc.filename || 'Tài liệu')}</strong><span class="status-badge ${escapeHtml(doc.status)}">${escapeHtml(doc.status || 'active')}</span></div><small>${escapeHtml(doc.category || 'general')} · ${Number(doc.chunk_count || 0).toLocaleString('vi-VN')} chunks · ${formatDate(doc.updated_at || doc.created_at)}</small><div class="tag-line">${(doc.tags || []).slice(0, 5).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div></div><div class="row-actions"><button type="button" data-doc-action="view" title="Xem chi tiết">${icon('eye')}</button><button type="button" data-doc-action="reindex" title="Lập chỉ mục lại">${icon('refresh')}</button><button type="button" data-doc-action="status" title="${doc.status === 'active' ? 'Lưu trữ' : 'Kích hoạt'}">${doc.status === 'active' ? icon('archive') : icon('check')}</button><button type="button" class="danger" data-doc-action="delete" title="Xóa">${icon('trash')}</button></div></article>`).join('');
  $$('.knowledge-row', elements.knowledgeList).forEach((row) => {
    $$('[data-doc-action]', row).forEach((button) => button.onclick = () => handleKnowledgeAction(row.dataset.documentId, button.dataset.docAction, documents.find((d) => String(d.id) === row.dataset.documentId)));
  });
}

async function loadKnowledgeDocuments() {
  try {
    const q = elements.knowledgeSearch.value.trim();
    const path = `/ai/v84/rag/documents?limit=200&workspace_id=${encodeURIComponent(state.workspaceId)}${q ? `&q=${encodeURIComponent(q)}` : ''}`;
    const data = await api(path);
    renderKnowledgeList(data.documents || []);
  } catch (error) { elements.knowledgeList.innerHTML = `<div class="empty-panel danger-text">Không tải được kho kiến thức: ${escapeHtml(error.message)}</div>`; }
}

async function refreshKnowledge() {
  if (!state.apiBase) return;
  try {
    const [stats] = await Promise.all([
      api(`/ai/v84/rag/dashboard/status?workspace_id=${encodeURIComponent(state.workspaceId)}`),
      loadKnowledgeDocuments(),
    ]);
    renderKnowledgeStats(stats);
  } catch (error) { elements.knowledgeStats.innerHTML = `<div class="empty-panel danger-text">Không tải được thống kê: ${escapeHtml(error.message)}</div>`; }
}

async function uploadKnowledge() {
  if (!state.knowledgeFile) { showToast('Hãy chọn một tài liệu'); return; }
  elements.uploadKnowledgeBtn.disabled = true;
  const form = new FormData();
  form.append('file', state.knowledgeFile); form.append('title', elements.knowledgeTitle.value.trim()); form.append('category', elements.knowledgeCategory.value);
  form.append('document_type', 'document'); form.append('source', 'frontend_upload'); form.append('tags', elements.knowledgeTags.value.trim());
  form.append('uploaded_by', state.userName); form.append('status', elements.knowledgeStatus.value); form.append('workspace_id', state.workspaceId); form.append('user_id', state.userId); form.append('language', 'vi'); form.append('auto_chunk', 'true');
  try {
    showToast(`Đang đọc và lập chỉ mục ${state.knowledgeFile.name}…`, 12000);
    const data = await api('/ai/v84/rag/documents/upload', { method: 'POST', body: form });
    state.knowledgeFile = null; elements.knowledgeFileInput.value = ''; elements.knowledgeFileLabel.textContent = 'Chọn một tài liệu chính thức'; elements.knowledgeTitle.value = ''; elements.knowledgeTags.value = '';
    await refreshKnowledge(); showToast(`Đã thêm ${data.document?.title || 'tài liệu'} với ${data.chunks || 0} chunks`, 5000);
  } catch (error) { showToast(`Không tải được tài liệu: ${error.message}`, 6000); }
  finally { elements.uploadKnowledgeBtn.disabled = false; }
}

async function handleKnowledgeAction(documentId, action, doc = {}) {
  const scope = `workspace_id=${encodeURIComponent(state.workspaceId)}`;
  try {
    if (action === 'view') {
      const data = await api(`/ai/v84/rag/documents/${documentId}?include_chunks=true&chunk_limit=30&${scope}`);
      const detail = data.document || doc;
      const chunks = data.chunks || [];
      openModal({ title: detail.title || detail.filename || 'Chi tiết tài liệu', kicker: 'TÀI LIỆU RAG', wide: true, html: `<div class="document-detail-grid"><div><span>Trạng thái</span><strong>${escapeHtml(detail.status || 'active')}</strong></div><div><span>Danh mục</span><strong>${escapeHtml(detail.category || 'general')}</strong></div><div><span>Số chunks</span><strong>${Number(detail.chunk_count || chunks.length || 0).toLocaleString('vi-VN')}</strong></div><div><span>Cập nhật</span><strong>${formatDate(detail.updated_at || detail.created_at)}</strong></div></div><div class="document-meta"><p><strong>Tệp:</strong> ${escapeHtml(detail.filename || '—')}</p><p><strong>Thẻ:</strong> ${escapeHtml((detail.tags || []).join(', ') || '—')}</p><p><strong>Workspace:</strong> ${escapeHtml(detail.workspace_id || state.workspaceId)}</p></div><div class="chunk-preview"><h3>Nội dung đã lập chỉ mục</h3>${chunks.length ? chunks.slice(0, 10).map((chunk, index) => `<details><summary>Đoạn ${index + 1}</summary><p>${escapeHtml(chunk.content || chunk.text || JSON.stringify(chunk)).slice(0, 2500)}</p></details>`).join('') : '<div class="empty-panel">Backend không trả nội dung chunks trong lần xem này.</div>'}</div>` });
    }
    if (action === 'reindex') {
      showToast('Đang lập chỉ mục lại…', 8000);
      const data = await api(`/ai/v84/rag/documents/${documentId}/reindex?${scope}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chunk_size: 1200, overlap: 180 }) });
      showToast(data.ok ? `Đã lập chỉ mục ${data.chunks || ''} chunks` : `Chưa hoàn tất: ${data.error || 'không rõ lỗi'}`); await refreshKnowledge();
    }
    if (action === 'status') {
      const next = doc.status === 'active' ? 'archived' : 'active';
      await api(`/ai/v84/rag/documents/${documentId}/status?${scope}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) });
      await refreshKnowledge(); showToast(next === 'active' ? 'Đã kích hoạt tài liệu' : 'Đã lưu trữ tài liệu');
    }
    if (action === 'delete') {
      if (!confirm(`Xóa tài liệu “${doc.title || doc.filename || documentId}” khỏi RAG?`)) return;
      await api(`/ai/v84/rag/documents/${documentId}?${scope}`, { method: 'DELETE' });
      await refreshKnowledge(); showToast('Đã xóa tài liệu khỏi kho kiến thức');
    }
  } catch (error) { showToast(`Thao tác thất bại: ${error.message}`, 6000); }
}

function bindDropzone(element, input, onFiles) {
  element.addEventListener('click', () => input.click());
  ['dragenter', 'dragover'].forEach((eventName) => element.addEventListener(eventName, (event) => { event.preventDefault(); element.classList.add('dragging'); }));
  ['dragleave', 'drop'].forEach((eventName) => element.addEventListener(eventName, (event) => { event.preventDefault(); element.classList.remove('dragging'); }));
  element.addEventListener('drop', (event) => onFiles(event.dataTransfer.files));
  input.addEventListener('change', () => { onFiles(input.files); input.value = ''; });
}

let knowledgeSearchTimer = null;
elements.input.addEventListener('input', autoResize);
elements.input.addEventListener('keydown', (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submitMessage(); } });
elements.sendBtn.addEventListener('click', () => submitMessage());
elements.newChatBtn.addEventListener('click', resetChat);
elements.brandBtn.addEventListener('click', () => switchView('chat'));
elements.refreshHistoryBtn.addEventListener('click', refreshHistory);

elements.collapseBtn.addEventListener('click', () => { if (window.innerWidth <= 960) elements.sidebar.classList.remove('mobile-open'); else elements.sidebar.classList.toggle('collapsed'); });
elements.mobileMenu.addEventListener('click', () => elements.sidebar.classList.toggle('mobile-open'));

$$('.suggestion-card').forEach((card) => card.addEventListener('click', () => { switchView('chat'); submitMessage(card.dataset.prompt || ''); }));
$$('.nav-item').forEach((item) => item.addEventListener('click', () => switchView(item.dataset.view)));

elements.sourceToggle.addEventListener('click', () => elements.sourceToggle.classList.toggle('active'));
elements.deepToggle.addEventListener('click', () => { state.deep = !state.deep; elements.deepToggle.classList.toggle('active', state.deep); showToast(state.deep ? 'Đã bật phân tích sâu' : 'Đã tắt phân tích sâu'); });
elements.attachBtn.addEventListener('click', () => elements.fileInput.click());
elements.fileInput.addEventListener('change', () => uploadFiles(elements.fileInput.files));

['dragenter', 'dragover'].forEach((name) => elements.composer.addEventListener(name, (event) => { event.preventDefault(); elements.chatDropOverlay.classList.remove('hidden'); }));
['dragleave', 'drop'].forEach((name) => elements.composer.addEventListener(name, (event) => { event.preventDefault(); if (name === 'drop') uploadFiles(event.dataTransfer.files); elements.chatDropOverlay.classList.add('hidden'); }));

elements.apiStatusBtn.addEventListener('click', openSettings);
elements.profileBtn.addEventListener('click', openSettings);
elements.capabilitiesBtn.addEventListener('click', openCapabilities);
elements.capabilityCardBtn.addEventListener('click', openCapabilities);
elements.shareBtn.addEventListener('click', shareConversation);
elements.conversationMenuBtn.addEventListener('click', () => openConversationActions());

elements.modalCloseBtn.addEventListener('click', closeModal);
elements.modalBackdrop.addEventListener('click', (event) => { if (event.target === elements.modalBackdrop) closeModal(); });

bindDropzone(elements.reportDropzone, elements.reportFileInput, addReportFiles);
elements.createReportBtn.addEventListener('click', createReport);
elements.refreshReportsBtn.addEventListener('click', () => Promise.all([loadFileCapabilities(), refreshReportHistory()]));

bindDropzone(elements.knowledgeDropzone, elements.knowledgeFileInput, (files) => {
  state.knowledgeFile = files?.[0] || null;
  elements.knowledgeFileLabel.textContent = state.knowledgeFile ? `${state.knowledgeFile.name} · ${prettyBytes(state.knowledgeFile.size)}` : 'Chọn một tài liệu chính thức';
});
elements.uploadKnowledgeBtn.addEventListener('click', uploadKnowledge);
elements.refreshKnowledgeBtn.addEventListener('click', refreshKnowledge);
elements.knowledgeSearch.addEventListener('input', () => { clearTimeout(knowledgeSearchTimer); knowledgeSearchTimer = setTimeout(loadKnowledgeDocuments, 350); });

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeModal();
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); resetChat(); }
});

(async function init() {
  updateProfile(); autoResize();
  const ok = await checkApi();
  if (ok) {
    await refreshHistory();
    const match = location.hash.match(/^#chat=(.+)$/);
    if (match) await loadConversation(decodeURIComponent(match[1]));
  }
})();
