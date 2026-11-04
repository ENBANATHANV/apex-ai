import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Dumbbell,
  Utensils,
  Bot,
  User,
  AlertTriangle,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  actionCard?: any;
  createdAt?: string;
}

interface AiCoachPageProps {
  onNavigate: (page: string) => void;
}

export const AiCoachPage: React.FC<AiCoachPageProps> = ({ onNavigate }) => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'How should I structure my 4-day workout split for hypertrophy?',
    'What are the best high-protein post-workout meals?',
    'How do I overcome a plateau on my bench press?',
    'What should I do on rest days to speed up recovery?',
  ];

  const fetchHistory = async () => {
    try {
      const res = await api.getChatHistory();
      if (res.success && res.data.length > 0) {
        setMessages(res.data);
      } else {
        // Starter Welcome Message
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: `Hello **${profile?.fullName || 'Athlete'}**! 👋 I am your dedicated **FitTrack AI Coach**.

I am calibrated with your profile:
- **Goal**: ${profile?.primaryGoal || 'Muscle Gain'}
- **Level**: ${profile?.fitnessLevel || 'Intermediate'}
- **Training Frequency**: ${profile?.workoutDaysPerWeek || 4} Days / Week

Ask me to design workout routines, troubleshoot exercise mechanics, review your nutrition targets, or recommend muscle recovery protocols!`,
          },
        ]);
      }
    } catch (err: any) {
      console.error('Failed to fetch chat history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isSending) return;

    const tempUserMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setInputValue('');
    setIsSending(true);

    try {
      const res = await api.sendChatMessage(text);
      if (res.success && res.data) {
        setMessages((prev) => [
          ...prev,
          {
            id: res.data.id,
            role: 'assistant',
            content: res.data.content,
            actionCard: res.data.actionCard,
            createdAt: res.data.createdAt,
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an issue processing your request. Please try again.',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col pb-4">
      {/* Disclaimer Banner */}
      <MedicalDisclaimer compact />

      {/* Main Chat Stream Container */}
      <div className="flex-1 bg-[#11161D] border border-zinc-800 rounded-3xl p-4 sm:p-6 overflow-y-auto flex flex-col justify-between shadow-2xl">
        {isLoadingHistory ? (
          <LoadingSpinner text="Retrieving coach memory..." size="md" />
        ) : (
          <div className="space-y-4 pr-1">
            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    isAssistant ? 'justify-start' : 'justify-end'
                  }`}
                >
                  {isAssistant && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-black font-bold shrink-0 shadow-neon">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      isAssistant
                        ? 'bg-[#0B0F14] border border-zinc-800 text-zinc-200'
                        : 'bg-emerald-500 text-black font-medium shadow-neon'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.content}</div>

                    {/* Action Cards (e.g. prompt to open workouts) */}
                    {msg.actionCard && (
                      <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-400">
                          {msg.actionCard.title}
                        </span>
                        <button
                          onClick={() => {
                            if (msg.actionCard.action === 'generate_plan') {
                              onNavigate('workouts');
                            } else if (msg.actionCard.action === 'open_nutrition') {
                              onNavigate('nutrition');
                            }
                          }}
                          className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500 hover:text-black transition"
                        >
                          Explore →
                        </button>
                      </div>
                    )}
                  </div>

                  {!isAssistant && (
                    <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-bold shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isSending && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 rounded-2xl bg-[#0B0F14] border border-zinc-800 flex items-center gap-2 text-xs text-zinc-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>FitTrack AI Coach is formulating recommendations...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Quick Suggestion Pills */}
        <div className="mt-4 pt-4 border-t border-zinc-800/80">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isSending}
                className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 text-zinc-300 hover:text-emerald-400 text-xs shrink-0 transition"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about workout splits, macros, recovery, or exercise form cues..."
              disabled={isSending}
              className="flex-1 px-4 py-3 rounded-2xl bg-[#0B0F14] border border-zinc-700/80 text-white placeholder-zinc-500 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSending || !inputValue.trim()}
              className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-neon transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask Coach</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
