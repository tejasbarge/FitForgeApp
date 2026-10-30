import React, { useEffect, useRef, useState } from 'react';
import { chatAPI } from '../api';
import toast from 'react-hot-toast';
import { Send, Trash2, Bot, User, Loader } from 'lucide-react';

function MarkdownText({ text }) {
  // Simple markdown: bold **text**, newlines
  const parts = text.split('\n').map((line, i) => {
    const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return <p key={i} dangerouslySetInnerHTML={{ __html: bold }} style={{ marginBottom: 4 }} />;
  });
  return <div>{parts}</div>;
}

const SUGGESTIONS = [
  "What should I eat before a workout? 🏃",
  "How many calories do I need to lose weight?",
  "Give me a 10-minute home workout",
  "Why is sleep important for muscle recovery?",
  "What foods are high in protein?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    chatAPI.getHistory()
      .then(res => setMessages(res.data))
      .catch(() => {})
      .finally(() => setInitialLoad(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    const userMsg = { id: Date.now(), role: 'user', message: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const res = await chatAPI.sendMessage(msg);
      setMessages(prev => [...prev, res.data]);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'FitAI is unavailable. Check the backend and Gemini configuration.';
      toast.error(errorMessage);
      setMessages(prev => [
        ...prev,
        { id: `error-${userMsg.id}`, role: 'assistant', message: errorMessage },
      ]);
    } finally { setLoading(false); }
  };

  const clearHistory = async () => {
    if (!confirm('Clear all chat history?')) return;
    try {
      await chatAPI.clearHistory();
      setMessages([]);
      toast.success('Chat cleared');
    } catch { toast.error('Failed to clear'); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="animate-fade" style={{ height: 'calc(100vh - 96px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="page-header flex items-center justify-between" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="page-title">🤖 <span>FitAI Chat</span></h1>
          <p className="page-subtitle">Your personal AI fitness coach, powered by Gemini</p>
        </div>
        {messages.length > 0 && (
          <button className="btn btn-danger btn-sm" onClick={clearHistory}>
            <Trash2 size={14} /> Clear
          </button>
        )}
      </div>

      {/* Chat Area */}
      <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        {/* Messages */}
        <div className="chat-messages" style={{ flex: 1 }}>
          {initialLoad ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading history…</div>
          ) : messages.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 24, padding: 40 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 64, marginBottom: 12, animation: 'float 3s ease-in-out infinite' }}>🤖</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Hi! I'm FitAI</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 360 }}>
                  Your personal fitness & nutrition coach. Ask me anything about diet, workouts, sleep, or health!
                </p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    className="btn btn-secondary btn-sm"
                    onClick={() => sendMessage(s)}
                    style={{ fontSize: 12 }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={msg.id || i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                  background: msg.role === 'user' ? 'var(--gradient-brand)' : 'var(--gradient-blue)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
                }}>
                  {msg.role === 'user' ? <User size={16} /> : '🤖'}
                </div>
                <div className={`chat-bubble ${msg.role}`} style={{ maxWidth: '70%' }}>
                  <MarkdownText text={msg.message} />
                </div>
              </div>
            ))
          )}
          {loading && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--gradient-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
              <div className="chat-bubble assistant">
                <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '4px 0' }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-blue)', animation: `bounce 0.8s ${i*0.15}s ease-in-out infinite` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="chat-input-area">
          <textarea
            id="chat-input"
            className="chat-input"
            rows={1}
            placeholder="Ask FitAI anything… (Enter to send, Shift+Enter for new line)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ resize: 'none', minHeight: 44, maxHeight: 120 }}
          />
          <button
            id="chat-send-btn"
            className="btn btn-primary btn-icon"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }}
          >
            {loading ? <Loader size={18} className="spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      `}</style>
    </div>
  );
}
