import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  User,
  Send,
  Sparkles,
  Trash2,
  ShieldAlert,
  Dumbbell,
  Target,
  Flame,
  Award,
  HelpCircle,
  ChevronRight,
  Info,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

const TOPICS = [
  { label: 'Knee-friendly squat swap', query: 'What are good knee-friendly alternatives to barbell squats?' },
  { label: 'Shoulder-friendly bench swap', query: 'My shoulder hurts during flat bench press. What can I swap it with?' },
  { label: 'How much protein daily?', query: 'How much protein should I eat per day for optimal hypertrophy?' },
  { label: 'Creatine facts & safety', query: 'Does creatine cause hair loss or dehydration? How should I take it?' },
  { label: 'Six-pack abs truth', query: 'Can I burn belly fat by doing 100 crunches every day?' },
  { label: 'Steroids & SARMs dangers', query: 'Are SARMs safer than steroids for building muscle?' },
];

export default function ChatPage() {
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
        content: "Welcome to your personal coaching room! 🏋️ I'm your **FitForge AI Coach**. I have full context of your fitness goals, workouts, and target calories.\n\nAsk me about exercise form cues, swapping an exercise, recovery tips, or macro targets!",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [userProfile, setUserProfile] = useState<{
    goal?: string;
    weightKg?: number;
    heightCm?: number;
    dailyCalories?: number;
    split?: string;
  }>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load user stats & plan from localStorage
    try {
      const stats = localStorage.getItem('fitforge_user_stats');
      const plan = localStorage.getItem('fitforge_saved_plan');
      let combined: any = {};
      if (stats) combined = { ...combined, ...JSON.parse(stats) };
      if (plan) {
        const p = JSON.parse(plan);
        combined.dailyCalories = p.dailyCalories;
        combined.split = p.recommendedSplit;
      }
      setUserProfile(combined);
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

    try {
      const res = await fetch('http://localhost:4000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          userContext: userProfile,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error('Failed to start stream');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantMsgId = (Date.now() + 1).toString();
      let assistantContent = '';

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
          content: 'Unable to connect to the FitForge coach server. Please check your backend connection.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    localStorage.removeItem('fitforge_chat_history');
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: "Chat cleared! 🧹 What would you like guidance on today?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-12rem)] min-h-[600px]">
        {/* Left Sidebar: User Context & Suggested Chips */}
        <div className="hidden lg:flex lg:col-span-4 flex-col justify-between glass-panel rounded-3xl p-6 overflow-y-auto space-y-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-2xl bg-accent/20 text-accent border border-accent/30 flex items-center justify-center shadow-lg shadow-accent/10">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white">AI Coach Hub</h2>
                <span className="text-xs text-gray-400">Context-Aware Guidance</span>
              </div>
            </div>

            {/* User Profile Context Card */}
            <div className="glass-card rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-accent font-bold uppercase tracking-wider">
                <span>Active Profile Context</span>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-sm shadow-green-400/50" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/[0.03] border border-white/5 p-2.5 rounded-xl">
                  <span className="text-gray-400 block text-[10px]">Current Goal</span>
                  <span className="text-white font-bold capitalize">{userProfile.goal || 'General Fitness'}</span>
                </div>
                <div className="bg-white/[0.03] border border-white/5 p-2.5 rounded-xl">
                  <span className="text-gray-400 block text-[10px]">Target Calories</span>
                  <span className="text-accent font-bold">{userProfile.dailyCalories ? `${userProfile.dailyCalories} kcal` : 'Not set'}</span>
                </div>
                <div className="bg-white/[0.03] border border-white/5 p-2.5 rounded-xl">
                  <span className="text-gray-400 block text-[10px]">Weight / Height</span>
                  <span className="text-white font-bold">
                    {userProfile.weightKg ? `${userProfile.weightKg}kg` : '—'} / {userProfile.heightCm ? `${userProfile.heightCm}cm` : '—'}
                  </span>
                </div>
                <div className="bg-white/[0.03] border border-white/5 p-2.5 rounded-xl">
                  <span className="text-gray-400 block text-[10px]">Current Split</span>
                  <span className="text-white font-bold truncate block">{userProfile.split || 'Full Body'}</span>
                </div>
              </div>
            </div>

            {/* Quick Topics */}
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">
                Suggested Topics
              </span>
              <div className="space-y-2">
                {TOPICS.map((t) => (
                  <button
                    key={t.label}
                    onClick={() => handleSend(t.query)}
                    disabled={loading}
                    className="w-full text-left glass-card hover:border-accent/40 text-gray-300 hover:text-white p-3 rounded-xl text-xs transition-all flex items-center justify-between group"
                  >
                    <span>{t.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Safety Disclaimer */}
          <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 text-[11px] text-gray-400 flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Safety Note:</strong> AI advice is for educational and training purposes. For medical symptoms, joint injuries, or sharp pain, always consult a licensed medical provider.
            </p>
          </div>
        </div>

        {/* Right Main Chat Column */}
        <div className="lg:col-span-8 flex flex-col glass-panel rounded-3xl overflow-hidden shadow-2xl">
          {/* Chat Header */}
          <div className="bg-white/[0.02] backdrop-blur-md px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse shadow-sm shadow-green-400/50" />
              <div>
                <h3 className="font-extrabold text-white text-base">FitForge Coaching Room</h3>
                <span className="text-xs text-gray-400">Streaming Science-Backed Guidance</span>
              </div>
            </div>

            <button
              onClick={handleClear}
              className="text-xs text-gray-400 hover:text-red-400 flex items-center gap-1.5 transition-colors p-2 rounded-xl hover:bg-white/5"
              title="Clear Chat History"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear History</span>
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5 text-sm">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-2xl bg-accent/20 border border-accent/30 text-accent flex items-center justify-center shrink-0 mt-1 shadow-md shadow-accent/10">
                    <Bot className="w-5 h-5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-3xl p-5 leading-relaxed backdrop-blur-md shadow-xl ${
                    m.role === 'user'
                      ? 'glass-button-accent text-white rounded-tr-sm'
                      : 'glass-card border border-white/10 text-gray-100 rounded-tl-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>
                  <span
                    className={`block text-[10px] mt-2 text-right ${
                      m.role === 'user' ? 'text-white/80' : 'text-gray-400'
                    }`}
                  >
                    {m.time}
                  </span>
                </div>

                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-2xl glass-card text-gray-300 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-center text-xs text-gray-400 pl-11">
                <span className="w-2.5 h-2.5 rounded-full bg-accent animate-ping" />
                <span>Coach is analyzing biomechanics and composing answer...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-4 sm:p-5 bg-white/[0.02] backdrop-blur-md border-t border-white/10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-3"
            >
              <input
                type="text"
                placeholder="Ask your coach anything (e.g., knee-friendly squat swaps, daily protein, form tips)..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 glass-input rounded-2xl px-5 py-3.5 text-sm placeholder-gray-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="glass-button-accent text-white font-bold px-6 py-3.5 rounded-2xl transition-all disabled:opacity-40 flex items-center gap-2 shrink-0 cursor-pointer disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
