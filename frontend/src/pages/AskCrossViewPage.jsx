import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MessageSquare,
  Sparkles,
  Send,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Clock,
  Compass,
} from 'lucide-react';
import { apiService } from '../services/api';

export default function AskCrossViewPage() {
  const location = useLocation();
  const initialEventId = new URLSearchParams(location.search).get('eventId') || 'general';

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(initialEventId);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I am CrossView's Evidence-Grounded Conversational Assistant. You can ask me questions about developing events, multi-source discrepancies, and corroborated details. Every response is grounded directly in verified publisher dispatches.",
      citations: [],
      timestamp: new Date(),
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    apiService
      .getEvents({ limit: 10 })
      .then((res) => {
        if (res.success && res.events) {
          setEvents(res.events);
        }
      })
      .catch((err) => console.warn('Events fetch error:', err));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const presetQuestions = [
    'What happened?',
    'What do different newspapers disagree about?',
    'Which details are corroborated?',
    'What information is still missing?',
    'Which publishers reported this event?',
  ];

  const handleSend = async (questionText = null) => {
    const q = (questionText || inputQuestion).trim();
    if (!q || loading) return;

    const userMsg = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setLoading(true);

    try {
      const res = await apiService.askCrossView(selectedEventId, q);

      const aiMsg = {
        id: `msg_a_${Date.now()}`,
        sender: 'assistant',
        text: res.answer || 'No definitive response could be synthesized from available sources.',
        citations: res.citations || [],
        confidence: res.confidence_level || 'High',
        unanswered: res.unanswered_aspects,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        id: `msg_err_${Date.now()}`,
        sender: 'assistant',
        text: `Unable to answer at this time: ${err.message}. Please check your connection or choose another event.`,
        citations: [],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-border shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1 rounded bg-navy/10 text-navy">
              <Sparkles className="w-5 h-5 text-navy" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">
              Conversational Grounding Engine
            </span>
          </div>
          <h1 className="font-editorial text-3xl font-bold text-primary">
            Ask CrossView
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            Questions are answered strictly using retrieved dispatches, verified claims, and consolidated reports.
          </p>
        </div>

        {/* Scope Selector */}
        <div className="w-full sm:w-64">
          <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
            Grounding Context:
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full p-2 bg-[#F7F7F5] border border-border rounded text-xs font-medium text-primary focus:outline-none focus:border-navy"
          >
            <option value="general">Global Stream (All Recent Events)</option>
            {events.map((evt) => (
              <option key={evt._id} value={evt._id}>
                {evt.title.substring(0, 45)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preset Question Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-secondary flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" />
          Suggested:
        </span>
        {presetQuestions.map((pq, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(pq)}
            className="px-3 py-1 rounded-full text-xs font-medium bg-white border border-border hover:border-navy text-primary hover:text-navy transition-colors shadow-xs"
          >
            {pq}
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-lg border border-border shadow-card flex flex-col h-[520px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-lg p-4 text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-navy text-white font-medium rounded-br-xs'
                    : 'bg-[#F7F7F5] text-primary border border-border rounded-bl-xs'
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>

                {/* Assistant Citations */}
                {m.citations && m.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/80">
                    <span className="text-[11px] font-bold text-navy uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Grounded Source Citations:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {m.citations.map((c, cIdx) => (
                        <a
                          key={cIdx}
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-border text-[11px] text-navy hover:underline shadow-2xs"
                        >
                          <span className="font-semibold">{c.source_name}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-secondary" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing / Unanswered context flag */}
                {m.unanswered && (
                  <div className="mt-2 text-[11px] text-secondary flex items-start gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>{m.unanswered}</span>
                  </div>
                )}
              </div>

              <span className="text-[10px] text-secondary mt-1 px-1">
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 p-3 bg-[#F7F7F5] border border-border rounded-lg max-w-xs text-xs text-secondary animate-pulse">
              <Sparkles className="w-4 h-4 text-navy animate-spin" />
              <span>Synthesizing evidence across dispatches...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 border-t border-border flex items-center gap-2 bg-[#F7F7F5] rounded-b-lg">
          <input
            type="text"
            placeholder="Ask about corroborated facts, timeline progression, or disputed figures..."
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm bg-white border border-border rounded-md focus:outline-none focus:border-navy text-primary placeholder-secondary disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputQuestion.trim() || loading}
            className="px-4 py-2.5 bg-navy hover:bg-navy-dark text-white rounded-md text-sm font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

