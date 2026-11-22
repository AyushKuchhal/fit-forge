import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Sparkles, Trash2, Bot, User, Maximize2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

const QUICK_CHIPS = [
  'How much protein do I need?',
  'Knee-friendly squat alternative?',
  'How to do progressive overload?',
  'Does creatine cause hair loss?',
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('fitforge_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        id: '1',
        role: 'assistant',
        content: "Hey there! 💪 I'm your **FitForge AI Coach**. Ask me anything about form cues, workout splits, evidence-based nutrition, or exercise swaps. What are you training today?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  useEffect(() => {
    localStorage.setItem('fitforge_chat_history', JSON.stringify(messages));
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Retrieve saved user context from localStorage
    let userContext = {};
    try {
      const stats = localStorage.getItem('fitforge_user_stats');
      const plan = localStorage.getItem('fitforge_saved_plan');
      if (stats) userContext = { ...userContext, ...JSON.parse(stats) };
      if (plan) {
        const p = JSON.parse(plan);
        userContext = {
          ...userContext,
          dailyCalories: p.dailyCalories,
          split: p.recommendedSplit,
        };
      }
    } catch (e) {
      // ignore
    }

    try {
      const res = await fetch('http://localhost:4000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          userContext,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error('Failed to start stream');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantMsgId = (Date.now() + 1).toString();
      let assistantContent = '';

      // Add placeholder assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: '',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          const trimmed = part.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const payload = trimmed.substring(6).trim();
          if (payload === '[DONE]') continue;

          try {
            const parsed = JSON.parse(payload);
            if (parsed.text) {
              assistantContent += parsed.text;
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantMsgId ? { ...m, content: assistantContent } : m))
              );
            }
          } catch (e) {
            // ignore
          }
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: 'I had trouble connecting to the coach service. Please ensure the backend is running.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    localStorage.removeItem('fitforge_chat_history');
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: "Chat cleared! 💪 What's on your mind today? Ask me about form, nutrition, or routines.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 glass-button-accent text-white w-14 h-14 rounded-full shadow-2xl shadow-accent/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="Open AI Gym Coach"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Floating Chat Modal */}
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 h-[32rem] max-h-[80vh] glass-panel rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-white/10">
          {/* Header */}
          <div className="bg-gradient-to-r from-accent/90 via-orange-600/90 to-accent/80 backdrop-blur-md px-5 py-3.5 flex items-center justify-between text-white shrink-0 border-b border-white/10 shadow-md">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <div>
                <h4 className="font-extrabold text-sm leading-tight">FitForge AI Coach</h4>
                <span className="text-[10px] text-white/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                  Active & Evidence-Based
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/chat"
                onClick={() => setOpen(false)}
                className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors"
                title="Expand to Full Page"
              >
                <Maximize2 className="w-4 h-4" />
              </Link>
              <button
                onClick={handleClearHistory}
                className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Clear Chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/30 text-accent flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-3 leading-relaxed backdrop-blur-md shadow-md ${
                    m.role === 'user'
                      ? 'glass-button-accent text-white rounded-tr-sm'
                      : 'glass-card border border-white/10 text-gray-200 rounded-tl-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      m.role === 'user' ? 'text-white/80' : 'text-gray-400'
                    }`}
                  >
                    {m.time}
                  </span>
                </div>

                {m.role === 'user' && (
                  <div className="w-6 h-6 rounded-full glass-card text-gray-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-center text-xs text-gray-400 pl-8">
                <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                <span>Coach is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick chips */}
          <div className="px-3 py-2 bg-white/[0.02] backdrop-blur-md border-t border-white/10 flex gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip}
                disabled={loading}
                onClick={() => handleSend(chip)}
                className="text-[10px] whitespace-nowrap glass-card hover:border-accent/40 text-gray-300 hover:text-white px-2.5 py-1 rounded-full transition-all shrink-0 cursor-pointer disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white/[0.02] backdrop-blur-md border-t border-white/10 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="Ask about workouts, form, or food..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 glass-input rounded-xl px-3 py-2 text-xs placeholder-gray-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="glass-button-accent text-white p-2.5 rounded-xl transition-all disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <span className="text-[9px] text-gray-400 block text-center mt-1.5">
              Not medical advice. For severe pain, see a doctor.
            </span>
          </div>
        </div>
      )}
    </>
  );
}
