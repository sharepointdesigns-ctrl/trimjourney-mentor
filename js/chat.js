/* ============================================================
   TRIMJOURNEY CHAT WIDGET
   Connects to Claude AI via /api/chat Azure Function
   ============================================================ */

(function () {
  'use strict';

  // ---- AGENT CONFIGURATION ----
  const AGENTS = {
    general:      { name: 'Trimjourney Advisor',          emoji: '🤖', label: 'General' },
    healthcare:   { name: 'Healthcare Advisor',           emoji: '🏥', label: 'Healthcare' },
    finance:      { name: 'Finance & Banking Advisor',    emoji: '🏦', label: 'Finance' },
    retail:       { name: 'Retail & E-Commerce Advisor',  emoji: '🛍️', label: 'Retail' },
    legal:        { name: 'Legal Services Advisor',       emoji: '⚖️', label: 'Legal' },
    technology:   { name: 'Technology & SaaS Advisor',   emoji: '💻', label: 'Tech & SaaS' },
    manufacturing:{ name: 'Manufacturing Advisor',        emoji: '🏭', label: 'Manufacturing' },
    'real-estate':{ name: 'Real Estate Advisor',          emoji: '🏗️', label: 'Real Estate' },
    education:    { name: 'Education Advisor',            emoji: '🎓', label: 'Education' },
    logistics:    { name: 'Logistics Advisor',            emoji: '🚚', label: 'Logistics' },
    restaurant:   { name: 'Restaurant & Food Advisor',   emoji: '🍽️', label: 'Restaurant' },
    hospitality:  { name: 'Hospitality Advisor',          emoji: '✈️', label: 'Hospitality' },
    energy:       { name: 'Energy & Sustainability Advisor', emoji: '🌱', label: 'Energy' }
  };

  const STARTER_QUESTIONS = {
    general:       ['How can I reduce my operating costs?', 'What AI tools would help my business?', 'How do I scale my operations efficiently?'],
    healthcare:    ['How can I reduce claim denials?', 'What\'s a good patient scheduling strategy?', 'How do I improve my revenue cycle?'],
    finance:       ['How can I improve client retention?', 'What compliance risks should I watch for?', 'How do I grow AUM efficiently?'],
    retail:        ['How do I reduce my inventory overstock?', 'What drives e-commerce conversion rates?', 'How should I approach supplier negotiation?'],
    legal:         ['Should I switch to a retainer model?', 'How do I reduce non-billable time?', 'What practice management software is best?'],
    technology:    ['How do I reduce SaaS churn?', 'When should I raise my prices?', 'What\'s a good go-to-market strategy for SMB?'],
    manufacturing: ['How do I identify waste in my production?', 'How can I improve my OEE?', 'What\'s a good supplier management approach?'],
    'real-estate': ['How do I evaluate a rental property?', 'How can I improve my NOI?', 'What\'s a good STR optimization strategy?'],
    education:     ['How do I improve enrollment conversion?', 'What LMS should I use?', 'How do I monetize my curriculum?'],
    logistics:     ['How can I reduce freight costs?', 'What WMS should I consider?', 'How do I optimize my routes?'],
    restaurant:    ['How do I control food cost?', 'How should I approach menu engineering?', 'What POS system is best for my restaurant?'],
    hospitality:   ['How do I increase direct bookings?', 'What\'s a good RevPAR optimization strategy?', 'How do I manage OTA commissions?'],
    energy:        ['How do I structure a solar project?', 'What incentives apply to my energy project?', 'How do I finance a clean energy business?']
  };

  // ---- STATE ----
  let isOpen = false;
  let selectedIndustry = 'general';
  let conversationHistory = [];
  let isLoading = false;

  // ---- DOM REFERENCES ----
  let toggleBtn, panel, messagesEl, inputEl, sendBtn, headerAvatar, headerName, welcomeEl;

  // ---- INIT ----
  function init() {
    injectWidget();
    bindEvents();
    bindExternalTriggers();
  }

  // ---- BUILD WIDGET DOM ----
  function injectWidget() {
    const wrapper = document.createElement('div');
    wrapper.id = 'tj-chat-widget';
    wrapper.innerHTML = buildHTML();
    document.body.appendChild(wrapper);

    // Cache references
    toggleBtn   = document.getElementById('tjChatToggle');
    panel       = document.getElementById('tjChatPanel');
    messagesEl  = document.getElementById('tjMessages');
    inputEl     = document.getElementById('tjInput');
    sendBtn     = document.getElementById('tjSend');
    headerAvatar = document.getElementById('tjHeaderAvatar');
    headerName   = document.getElementById('tjHeaderName');
    welcomeEl    = document.getElementById('tjWelcome');
  }

  function buildHTML() {
    const chips = Object.entries(AGENTS).map(([key, agent]) =>
      `<button class="chat-chip${key === 'general' ? ' is-active' : ''}" data-industry="${key}" title="${agent.name}">${agent.emoji} ${agent.label}</button>`
    ).join('');

    return `
      <!-- Floating toggle button -->
      <button class="chat-toggle" id="tjChatToggle" aria-label="Chat with a Trimjourney AI Advisor">
        <span class="chat-toggle-icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </span>
        <span class="chat-toggle-close">&times;</span>
        <span class="chat-toggle-dot"></span>
      </button>

      <!-- Chat panel -->
      <div class="chat-panel" id="tjChatPanel" role="dialog" aria-label="Trimjourney AI Advisor Chat">

        <!-- Header -->
        <div class="chat-header">
          <div class="chat-header-avatar" id="tjHeaderAvatar">🤖</div>
          <div class="chat-header-info">
            <span class="chat-header-name" id="tjHeaderName">Trimjourney Advisor</span>
            <span class="chat-header-status"><span class="chat-status-dot"></span>Online &bull; Powered by Claude AI</span>
          </div>
          <button class="chat-close-btn" id="tjClose" aria-label="Close chat">&times;</button>
        </div>

        <!-- Industry selector -->
        <div class="chat-industry-bar">
          <span class="chat-industry-label">Choose your advisor</span>
          <div class="chat-industry-chips" id="tjChips">
            ${chips}
          </div>
        </div>

        <!-- Messages -->
        <div class="chat-messages" id="tjMessages">
          <div class="chat-welcome" id="tjWelcome">
            <span class="chat-welcome-emoji" id="tjWelcomeEmoji">🤖</span>
            <h4 id="tjWelcomeTitle">Trimjourney Advisor</h4>
            <p id="tjWelcomeDesc">Ask me anything about your business — operations, growth, technology, or strategy. I'm here to help.</p>
            <div class="chat-starter-questions" id="tjStarters"></div>
          </div>
        </div>

        <!-- Input -->
        <div class="chat-input-area">
          <textarea
            class="chat-input"
            id="tjInput"
            placeholder="Ask your business question..."
            rows="1"
            aria-label="Message input"
          ></textarea>
          <button class="chat-send-btn" id="tjSend" aria-label="Send message" disabled>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>

        <!-- Footer -->
        <div class="chat-footer">Powered by <a href="https://trimjourney.com" target="_blank" rel="noopener">Trimjourney</a> &bull; Claude AI</div>
      </div>
    `;
  }

  // ---- BIND EVENTS ----
  function bindEvents() {
    // Toggle open/close
    toggleBtn.addEventListener('click', toggleChat);
    document.getElementById('tjClose').addEventListener('click', closeChat);

    // Industry chip selection
    document.getElementById('tjChips').addEventListener('click', function (e) {
      const chip = e.target.closest('.chat-chip');
      if (!chip) return;
      selectIndustry(chip.dataset.industry);
    });

    // Send on button click
    sendBtn.addEventListener('click', sendMessage);

    // Send on Enter (Shift+Enter for newline)
    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled) sendMessage();
      }
    });

    // Enable/disable send button based on input
    inputEl.addEventListener('input', function () {
      const hasText = this.value.trim().length > 0;
      sendBtn.disabled = !hasText || isLoading;
      // Auto-resize textarea
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });

    // Close on backdrop click (outside panel)
    document.addEventListener('click', function (e) {
      if (isOpen && !panel.contains(e.target) && !toggleBtn.contains(e.target)) {
        closeChat();
      }
    });

    // Render starters for default agent
    renderWelcome();
  }

  // ---- BIND EXTERNAL TRIGGERS ----
  // Any element with data-chat-open="industry" will open the chat
  function bindExternalTriggers() {
    document.addEventListener('click', function (e) {
      const trigger = e.target.closest('[data-chat-open]');
      if (!trigger) return;
      e.preventDefault();
      const industry = trigger.dataset.chatOpen || 'general';
      openChat(industry);
    });
  }

  // ---- OPEN / CLOSE ----
  function toggleChat() {
    isOpen ? closeChat() : openChat(selectedIndustry);
  }

  function openChat(industry) {
    if (industry && AGENTS[industry]) selectIndustry(industry, false);
    isOpen = true;
    toggleBtn.classList.add('is-open');
    panel.classList.add('is-open');
    inputEl.focus();
  }

  function closeChat() {
    isOpen = false;
    toggleBtn.classList.remove('is-open');
    panel.classList.remove('is-open');
  }

  // ---- SELECT INDUSTRY ----
  function selectIndustry(industry, clearHistory) {
    if (!AGENTS[industry]) return;
    if (clearHistory === undefined) clearHistory = true;

    selectedIndustry = industry;
    const agent = AGENTS[industry];

    // Update header
    headerAvatar.textContent = agent.emoji;
    headerName.textContent = agent.name;

    // Update chips
    document.querySelectorAll('.chat-chip').forEach(chip => {
      chip.classList.toggle('is-active', chip.dataset.industry === industry);
    });

    // Scroll selected chip into view
    const activeChip = document.querySelector(`.chat-chip[data-industry="${industry}"]`);
    if (activeChip) activeChip.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });

    // Reset conversation when switching agents
    if (clearHistory) {
      conversationHistory = [];
      messagesEl.innerHTML = '';
      const welcome = document.createElement('div');
      welcome.className = 'chat-welcome';
      welcome.id = 'tjWelcome';
      welcome.innerHTML = `
        <span class="chat-welcome-emoji">${agent.emoji}</span>
        <h4>${agent.name}</h4>
        <p id="tjWelcomeDesc">Select a question below or type your own to get started.</p>
        <div class="chat-starter-questions" id="tjStarters"></div>
      `;
      messagesEl.appendChild(welcome);
      renderStarters(industry);
    }
  }

  function renderWelcome() {
    renderStarters(selectedIndustry);
  }

  function renderStarters(industry) {
    const startersEl = document.getElementById('tjStarters');
    if (!startersEl) return;
    const questions = STARTER_QUESTIONS[industry] || STARTER_QUESTIONS.general;
    startersEl.innerHTML = questions.map(q =>
      `<button class="chat-starter-btn" data-question="${encodeURIComponent(q)}">${q}</button>`
    ).join('');

    startersEl.querySelectorAll('.chat-starter-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const question = decodeURIComponent(this.dataset.question);
        inputEl.value = question;
        inputEl.dispatchEvent(new Event('input'));
        sendMessage();
      });
    });
  }

  // ---- SEND MESSAGE ----
  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || isLoading) return;

    // Hide welcome
    const welcome = document.getElementById('tjWelcome');
    if (welcome) welcome.remove();

    // Add user message to UI and history
    appendMessage('user', text);
    conversationHistory.push({ role: 'user', content: text });

    // Clear and disable input
    inputEl.value = '';
    inputEl.style.height = 'auto';
    sendBtn.disabled = true;
    isLoading = true;

    // Show typing indicator
    const typingEl = appendTyping();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
          industry: selectedIndustry
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${response.status}`);
      }

      const data = await response.json();
      const reply = data.content;

      // Remove typing, show reply
      typingEl.remove();
      appendMessage('assistant', reply);
      conversationHistory.push({ role: 'assistant', content: reply });

    } catch (err) {
      typingEl.remove();
      appendError(err.message || 'Something went wrong. Please try again.');
    } finally {
      isLoading = false;
      sendBtn.disabled = inputEl.value.trim().length === 0;
    }
  }

  // ---- DOM HELPERS ----
  function appendMessage(role, text) {
    const agent = AGENTS[selectedIndustry];
    const isUser = role === 'user';

    const msgEl = document.createElement('div');
    msgEl.className = `chat-msg${isUser ? ' is-user' : ''}`;

    const avatarText = isUser ? 'You' : agent.emoji;
    const formattedText = formatText(text);

    msgEl.innerHTML = `
      <div class="chat-msg-avatar">${avatarText}</div>
      <div class="chat-msg-bubble">${formattedText}</div>
    `;

    messagesEl.appendChild(msgEl);
    scrollToBottom();
    return msgEl;
  }

  function appendTyping() {
    const agent = AGENTS[selectedIndustry];
    const el = document.createElement('div');
    el.className = 'chat-typing';
    el.innerHTML = `
      <div class="chat-msg-avatar">${agent.emoji}</div>
      <div class="chat-typing-dots">
        <span class="chat-typing-dot"></span>
        <span class="chat-typing-dot"></span>
        <span class="chat-typing-dot"></span>
      </div>
    `;
    messagesEl.appendChild(el);
    scrollToBottom();
    return el;
  }

  function appendError(message) {
    const el = document.createElement('div');
    el.className = 'chat-error';
    el.textContent = message;
    messagesEl.appendChild(el);
    scrollToBottom();
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // Basic markdown-like formatting: **bold**, bullet lists, line breaks
  function formatText(text) {
    let html = text
      // Escape HTML
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // **bold**
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    // Wrap in paragraph
    html = `<p>${html}</p>`;

    // Simple bullet list detection (lines starting with - or •)
    html = html.replace(/<br>[-•]\s+/g, '</p><ul><li>').replace(/<\/li><\/ul><p>/g, '</li></ul><p>');

    return html;
  }

  // ---- PUBLIC API ----
  window.TrimjourneyChat = {
    open: openChat,
    close: closeChat,
    selectIndustry: selectIndustry
  };

  // ---- BOOT ----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
