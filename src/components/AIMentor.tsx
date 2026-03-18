import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, Bot, Loader2, MessageSquare, Lightbulb } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { chatWithMentorStream, generateSuggestions } from '../lib/gemini';
import { useAuth } from '../lib/useAuth';
import { collection, query, where, getDocs, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const AIMentor: React.FC = () => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<any[]>([
    { role: 'bot', text: `Hello ${profile?.displayName?.split(' ')[0]}! I'm your SkillPilot AI Mentor. How can I help you on your learning journey today?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [activeCurriculum, setActiveCurriculum] = useState<any>(null);
  const [activeProgress, setActiveProgress] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    let unsubscribe: (() => void) | null = null;

    const fetchContext = async () => {
      const q = query(collection(db, 'curriculums'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
        // Default to main path or first available
        const main = docs.find(d => !d.isExtra) || docs[0];
        setActiveCurriculum(main);

        unsubscribe = onSnapshot(doc(db, 'curriculumProgress', main.id), (progSnap) => {
          if (progSnap.exists()) {
            setActiveProgress(progSnap.data());
          }
        });
      }
    };

    fetchContext();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const currentDayData = activeCurriculum?.days?.find((d: any) => d.day === (activeProgress?.currentDay || 1));

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (currentDayData && suggestions.length === 0) {
        setLoadingSuggestions(true);
        try {
          const sugs = await generateSuggestions(currentDayData.topic, activeProgress?.currentDay || 1);
          setSuggestions(sugs);
        } catch (error) {
          console.error("Error fetching suggestions:", error);
        } finally {
          setLoadingSuggestions(false);
        }
      }
    };
    fetchSuggestions();
  }, [currentDayData, activeProgress?.currentDay]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || loading) return;

    const userMsg = { role: 'user', text: messageText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const stream = await chatWithMentorStream(messageText, messages);
      
      // Add an initial empty bot message
      setMessages(prev => [...prev, { role: 'bot', text: '' }]);
      
      let fullText = '';
      for await (const chunk of stream) {
        fullText += chunk.text || '';
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg && lastMsg.role === 'bot') {
            lastMsg.text = fullText;
          }
          return newMessages;
        });
      }

      // Add follow-up message after stream finishes
      setMessages(prev => [
        ...prev,
        { role: 'bot', text: "Do you have any other questions or is there anything else you'd like to discuss?", isFollowUp: true }
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'bot', text: "I'm sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col gap-6">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col glass rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-purple to-violet-600 flex items-center justify-center text-white shadow-lg shadow-brand-purple/20">
              <Bot size={28} />
            </div>
            <div>
              <h2 className="font-bold text-lg tracking-tight">AI Mentor</h2>
              <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" /> 
                System Online
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => handleSend("Can you give me a training on how to use this platform effectively?")}
              className="px-4 py-2 glass rounded-xl text-brand-purple hover:bg-brand-purple/10 transition-all flex items-center gap-2 text-sm font-bold"
            >
              <Sparkles size={18} /> Training Mode
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-brand-blue to-blue-600' 
                      : 'bg-gradient-to-br from-brand-purple to-violet-600'
                  }`}>
                    {msg.role === 'user' ? <User size={20} className="text-white" /> : <Bot size={20} className="text-white" />}
                  </div>
                  <div className={`p-5 rounded-2xl shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-brand-blue/10 border border-brand-blue/20 text-blue-50' 
                      : msg.isFollowUp 
                        ? 'bg-brand-purple/5 border border-brand-purple/10 italic text-slate-400'
                        : 'glass border border-white/5'
                  }`}>
                    <div className="prose prose-invert prose-sm max-w-none leading-relaxed">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-purple flex items-center justify-center shadow-lg">
                    <Bot size={20} className="text-white" />
                  </div>
                  <div className="glass p-5 rounded-2xl flex items-center gap-3 border border-white/5">
                    <Loader2 size={18} className="animate-spin text-brand-purple" />
                    <span className="text-sm font-medium text-slate-400 tracking-wide">Mentor is thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input */}
        <div className="p-6 border-t border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask your mentor anything about your learning journey..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-7 pr-20 outline-none focus:border-brand-purple/50 focus:bg-white/10 transition-all shadow-inner"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="absolute right-2.5 top-2.5 bottom-2.5 px-5 bg-brand-purple rounded-xl text-white font-semibold hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-brand-purple/20 flex items-center gap-2"
            >
              <span className="hidden sm:inline">Send</span>
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
