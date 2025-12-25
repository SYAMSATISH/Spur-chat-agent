<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { sendMessage, getHistory } from '../lib/api';
  import type { Message } from '../lib/types';

  let messages: Message[] = [];
  let input = '';
  let isLoading = false;
  let sessionId: string | undefined;
  let chatContainer: HTMLElement;

  onMount(async () => {
    const storedSession = localStorage.getItem('spur_chat_session_id');
    if (storedSession) {
      sessionId = storedSession;
      try {
        const history = await getHistory(sessionId);
        messages = history.messages;
        await scrollToBottom();
      } catch (err) {
        console.error('Failed to load history', err);
        // If history fails, maybe session invalid? 
        localStorage.removeItem('spur_chat_session_id');
        sessionId = undefined;
      }
    }
  });

  async function scrollToBottom() {
    await tick();
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  async function handleSend() {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    input = '';
    
    // Optimistic update
    messages = [...messages, { role: 'user', content: userMsg }];
    await scrollToBottom();
    isLoading = true;

    try {
      const response = await sendMessage(userMsg, sessionId);
      
      if (!sessionId && response.sessionId) {
        sessionId = response.sessionId;
        localStorage.setItem('spur_chat_session_id', sessionId);
      }

      messages = [...messages, { role: 'assistant', content: response.reply }];
      await scrollToBottom();
    } catch (error: any) {
      messages = [...messages, { role: 'assistant', content: `Error: ${error.message}` }];
    } finally {
      isLoading = false;
      await scrollToBottom();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }
</script>

<div class="chat-widget">
  <header>
    <h1>Spur Support Agent</h1>
    <div class="status-dot"></div>
  </header>
  
  <div class="messages" bind:this={chatContainer}>
    {#if messages.length === 0}
      <div class="empty-state">
        <p>👋 Hi! asking me anything about tracking, returns, or shipping.</p>
      </div>
    {/if}
    
    {#each messages as msg}
      <div class="message {msg.role}">
        <div class="bubble">
          {msg.content}
        </div>
      </div>
    {/each}
    
    {#if isLoading}
      <div class="message assistant">
        <div class="bubble typing">
          <span>.</span><span>.</span><span>.</span>
        </div>
      </div>
    {/if}
  </div>

  <div class="input-area">
    <textarea 
      bind:value={input} 
      on:keydown={handleKeydown}
      placeholder="Type a message..."
      disabled={isLoading}
    ></textarea>
    <button on:click={handleSend} disabled={isLoading || !input.trim()}>
      Send
    </button>
  </div>
</div>

<style>
  .chat-widget {
    width: 100%;
    max-width: 400px;
    height: 600px;
    background: var(--secondary-bg);
    border-radius: 16px;
    border: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  }

  header {
    background: rgba(30, 41, 59, 0.95);
    padding: 16px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  h1 {
    font-size: 1rem;
    margin: 0;
    font-weight: 600;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    background: #22c55e;
    border-radius: 50%;
    box-shadow: 0 0 5px #22c55e;
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .empty-state {
    text-align: center;
    color: #94a3b8;
    margin-top: auto;
    margin-bottom: auto;
  }

  .message {
    display: flex;
    flex-direction: column;
  }

  .message.user {
    align-items: flex-end;
  }

  .message.assistant {
    align-items: flex-start;
  }

  .bubble {
    padding: 10px 14px;
    border-radius: 12px;
    max-width: 80%;
    line-height: 1.5;
    font-size: 0.95rem;
    white-space: pre-wrap;
  }

  .user .bubble {
    background: var(--user-msg-bg);
    color: white;
    border-bottom-right-radius: 4px;
  }

  .assistant .bubble {
    background: var(--ai-msg-bg);
    color: var(--text-color);
    border-bottom-left-radius: 4px;
  }

  .typing span {
    animation: bounce 1.4s infinite ease-in-out both;
    margin: 0 2px;
    display: inline-block;
  }

  .typing span:nth-child(1) { animation-delay: -0.32s; }
  .typing span:nth-child(2) { animation-delay: -0.16s; }

  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }

  .input-area {
    padding: 16px;
    border-top: 1px solid var(--border-color);
    display: flex;
    gap: 10px;
    background: var(--secondary-bg);
  }

  textarea {
    flex: 1;
    background: var(--input-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 10px;
    color: white;
    font-family: inherit;
    resize: none;
    height: 44px;
    outline: none;
    transition: border-color 0.2s;
  }

  textarea:focus {
    border-color: var(--accent-color);
  }

  button {
    background: var(--user-msg-bg);
    color: white;
    border: none;
    padding: 0 20px;
    border-radius: 8px;
    font-weight: 600;
    transition: opacity 0.2s;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
