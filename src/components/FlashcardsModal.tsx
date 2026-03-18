import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, RefreshCw, ChevronRight, ChevronLeft } from 'lucide-react';
import { generateFlashcards } from '../lib/gemini';

interface FlashcardsModalProps {
  topic: string;
  onClose: () => void;
}

export const FlashcardsModal: React.FC<FlashcardsModalProps> = ({ topic, onClose }) => {
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    loadFlashcards();
  }, [topic]);

  const loadFlashcards = async () => {
    setLoading(true);
    try {
      const data = await generateFlashcards(topic);
      if (data && data.flashcards) {
        setFlashcards(data.flashcards);
      }
    } catch (error) {
      console.error("Error generating flashcards:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 150);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-2xl w-full relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Smart Flashcards</h2>
          <p className="text-slate-400">Topic: {topic}</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-12 h-12 text-brand-purple animate-spin" />
            <p className="text-slate-400 animate-pulse">Generating flashcards...</p>
          </div>
        ) : flashcards.length > 0 ? (
          <div className="space-y-8">
            <div className="relative h-64 w-full perspective-1000">
              <motion.div
                className="w-full h-full relative preserve-3d cursor-pointer"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                {/* Front */}
                <div className="absolute inset-0 backface-hidden bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                  <span className="absolute top-4 left-4 text-xs font-bold text-brand-purple uppercase tracking-wider">Term</span>
                  <h3 className="text-2xl font-bold">{flashcards[currentIndex].front}</h3>
                  <p className="absolute bottom-4 text-xs text-slate-500">Click to flip</p>
                </div>

                {/* Back */}
                <div className="absolute inset-0 backface-hidden bg-brand-purple/20 border border-brand-purple/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center" style={{ transform: 'rotateY(180deg)' }}>
                  <span className="absolute top-4 left-4 text-xs font-bold text-brand-purple uppercase tracking-wider">Definition</span>
                  <p className="text-lg text-slate-200">{flashcards[currentIndex].back}</p>
                </div>
              </motion.div>
            </div>

            <div className="flex items-center justify-between">
              <button 
                onClick={prevCard}
                className="p-3 glass rounded-xl hover:bg-white/10 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <span className="text-slate-400 font-bold">
                {currentIndex + 1} / {flashcards.length}
              </span>
              <button 
                onClick={nextCard}
                className="p-3 glass rounded-xl hover:bg-white/10 transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-red-400 mb-4">Failed to load flashcards.</p>
            <button onClick={loadFlashcards} className="px-6 py-3 bg-white/10 rounded-xl flex items-center gap-2 mx-auto">
              <RefreshCw size={18} /> Try Again
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
