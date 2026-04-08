// SIMETRA AI Training Assistant Chat Widget
(function() {
  'use strict';

  // Chat state
  let isOpen = false;
  let messages = [];
  let currentProcedure = 'General';

  // Detect procedure from page
  function detectProcedure() {
    const path = window.location.pathname;
    if (path.includes('cpr')) return 'CPR';
    if (path.includes('simulation')) return 'Cardiac Electrical Stabilization';
    if (path.includes('evaluation')) return 'Performance Review';
    return 'General';
  }

  // Create chat widget HTML
  function createChatWidget() {
    const widget = document.createElement('div');
    widget.id = 'ai-chat-widget';
    widget.innerHTML = `
      <style>
        #ai-chat-widget { position: fixed; bottom: 24px; right: 24px; z-index: 10000; font-family: 'Inter', sans-serif; }
        #chat-toggle-btn { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); border: none; box-shadow: 0 4px 20px rgba(8,145,178,0.4); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
        #chat-toggle-btn:hover { transform: scale(1.1); box-shadow: 0 6px 30px rgba(8,145,178,0.6); }
        #chat-toggle-btn .icon { color: white; font-size: 28px; }
        #chat-panel { position: fixed; bottom: 100px; right: 24px; width: 380px; height: 550px; background: white; border-radius: 12px; box-shadow: 0 8px 40px rgba(0,0,0,0.15); display: none; flex-direction: column; overflow: hidden; border: 1px solid #e2e8f0; }
        #chat-panel.open { display: flex; animation: slideUp 0.3s ease-out; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        #chat-header { background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); color: white; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; }
        #chat-header-title { display: flex; align-items: center; gap: 10px; }
        #chat-header-title .icon { font-size: 24px; }
        #chat-header-title h3 { margin: 0; font-size: 16px; font-weight: 700; font-family: 'Space Grotesk', sans-serif; letter-spacing: 0.5px; }
        #chat-header-subtitle { font-size: 10px; opacity: 0.9; margin-top: 2px; letter-spacing: 1px; text-transform: uppercase; }
        #chat-close { background: none; border: none; color: white; cursor: pointer; font-size: 24px; padding: 0; opacity: 0.8; transition: opacity 0.2s; }
        #chat-close:hover { opacity: 1; }
        #chat-messages { flex: 1; overflow-y: auto; padding: 16px; background: #f8fafc; display: flex; flex-direction: column; gap: 12px; }
        #chat-messages::-webkit-scrollbar { width: 6px; }
        #chat-messages::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        .chat-message { display: flex; gap: 10px; animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .chat-message.user { flex-direction: row-reverse; }
        .chat-avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 16px; }
        .chat-avatar.ai { background: linear-gradient(135deg, #0891b2, #06b6d4); color: white; }
        .chat-avatar.user { background: #e2e8f0; color: #475569; }
        .chat-bubble { max-width: 75%; padding: 10px 14px; border-radius: 12px; font-size: 14px; line-height: 1.5; }
        .chat-bubble.ai { background: white; color: #1e293b; border: 1px solid #e2e8f0; }
        .chat-bubble.user { background: #0891b2; color: white; }
        .chat-typing { display: flex; gap: 4px; padding: 10px 14px; }
        .chat-typing span { width: 8px; height: 8px; border-radius: 50%; background: #94a3b8; animation: typing 1.4s infinite; }
        .chat-typing span:nth-child(2) { animation-delay: 0.2s; }
        .chat-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing { 0%, 60%, 100% { opacity: 0.3; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-8px); } }
        #chat-suggestions { padding: 12px 16px; background: white; border-top: 1px solid #e2e8f0; display: flex; gap: 8px; flex-wrap: wrap; }
        .chat-suggestion-btn { background: #f1f5f9; border: 1px solid #cbd5e1; color: #475569; padding: 6px 12px; border-radius: 16px; font-size: 12px; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .chat-suggestion-btn:hover { background: #e2e8f0; border-color: #0891b2; color: #0891b2; }
        #chat-input-area { padding: 16px; background: white; border-top: 1px solid #e2e8f0; display: flex; gap: 10px; }
        #chat-input { flex: 1; border: 1px solid #cbd5e1; border-radius: 20px; padding: 10px 16px; font-size: 14px; outline: none; transition: border-color 0.2s; font-family: 'Inter', sans-serif; }
        #chat-input:focus { border-color: #0891b2; }
        #chat-send-btn { background: #0891b2; border: none; color: white; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; }
        #chat-send-btn:hover { background: #06b6d4; transform: scale(1.05); }
        #chat-send-btn:disabled { background: #cbd5e1; cursor: not-allowed; transform: none; }
        #chat-send-btn .icon { font-size: 20px; }
        .chat-welcome { text-align: center; padding: 20px; color: #64748b; }
        .chat-welcome .icon { font-size: 48px; color: #0891b2; margin-bottom: 12px; }
        .chat-welcome h4 { margin: 0 0 8px 0; font-size: 16px; color: #1e293b; font-family: 'Space Grotesk', sans-serif; }
        .chat-welcome p { margin: 0; font-size: 13px; line-height: 1.6; }
      </style>

      <button id="chat-toggle-btn" aria-label="Open AI Assistant">
        <span class="material-symbols-outlined icon">psychology</span>
      </button>

      <div id="chat-panel">
        <div id="chat-header">
          <div>
            <div id="chat-header-title">
              <span class="material-symbols-outlined icon">psychology</span>
              <h3>AI ASSISTANT</h3>
            </div>
            <div id="chat-header-subtitle">SIMETRA TRAINING SUPPORT</div>
          </div>
          <button id="chat-close" aria-label="Close chat">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div id="chat-messages">
          <div class="chat-welcome">
            <span class="material-symbols-outlined icon">auto_awesome</span>
            <h4>Welcome to AI Training Assistant</h4>
            <p>Ask me anything about procedures, techniques, or how to improve your performance.</p>
          </div>
        </div>

        <div id="chat-suggestions">
          <button class="chat-suggestion-btn" data-msg="Explain this procedure">Explain this procedure</button>
          <button class="chat-suggestion-btn" data-msg="How can I improve?">How can I improve?</button>
          <button class="chat-suggestion-btn" data-msg="What did I do wrong?">What did I do wrong?</button>
        </div>

        <div id="chat-input-area">
          <input type="text" id="chat-input" placeholder="Ask a question..." />
          <button id="chat-send-btn" aria-label="Send message">
            <span class="material-symbols-outlined icon">send</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(widget);
    attachEventListeners();
  }

  // Attach event listeners
  function attachEventListeners() {
    const toggleBtn = document.getElementById('chat-toggle-btn');
    const closeBtn = document.getElementById('chat-close');
    const sendBtn = document.getElementById('chat-send-btn');
    const input = document.getElementById('chat-input');
    const panel = document.getElementById('chat-panel');

    toggleBtn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });

    // Suggestion buttons
    document.querySelectorAll('.chat-suggestion-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const msg = btn.getAttribute('data-msg');
        input.value = msg;
        sendMessage();
      });
    });
  }

  // Toggle chat panel
  function toggleChat() {
    isOpen = !isOpen;
    const panel = document.getElementById('chat-panel');
    const toggleBtn = document.getElementById('chat-toggle-btn');
    
    if (isOpen) {
      panel.classList.add('open');
      toggleBtn.querySelector('.icon').textContent = 'close';
      currentProcedure = detectProcedure();
    } else {
      panel.classList.remove('open');
      toggleBtn.querySelector('.icon').textContent = 'psychology';
    }
  }

  // Send message
  async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;

    // Add user message
    addMessage(message, 'user');
    input.value = '';

    // Show typing indicator
    const typingId = addTypingIndicator();

    // Call API
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          procedure_context: currentProcedure
        })
      });

      removeTypingIndicator(typingId);

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      addMessage(data.reply, 'ai');

    } catch (error) {
      console.error('Chat error:', error);
      removeTypingIndicator(typingId);
      addMessage('Sorry, I encountered an error. Please try again.', 'ai');
    }
  }

  // Add message to chat
  function addMessage(text, sender) {
    const messagesContainer = document.getElementById('chat-messages');
    
    // Remove welcome message if present
    const welcome = messagesContainer.querySelector('.chat-welcome');
    if (welcome) welcome.remove();

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    const avatar = document.createElement('div');
    avatar.className = `chat-avatar ${sender}`;
    avatar.innerHTML = `<span class="material-symbols-outlined">${sender === 'ai' ? 'psychology' : 'person'}</span>`;
    
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;
    bubble.textContent = text;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    messages.push({ text, sender, timestamp: Date.now() });
  }

  // Add typing indicator
  function addTypingIndicator() {
    const messagesContainer = document.getElementById('chat-messages');
    const typingDiv = document.createElement('div');
    const id = 'typing-' + Date.now();
    typingDiv.id = id;
    typingDiv.className = 'chat-message ai';
    typingDiv.innerHTML = `
      <div class="chat-avatar ai">
        <span class="material-symbols-outlined">psychology</span>
      </div>
      <div class="chat-bubble ai">
        <div class="chat-typing">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return id;
  }

  // Remove typing indicator
  function removeTypingIndicator(id) {
    const indicator = document.getElementById(id);
    if (indicator) indicator.remove();
  }

  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createChatWidget);
  } else {
    createChatWidget();
  }

})();
