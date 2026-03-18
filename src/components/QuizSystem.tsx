import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Loader2, 
  Sparkles,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { generateQuiz, evaluateQuiz } from '../lib/gemini';
import { doc, increment, setDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

interface QuizQuestion {
  id: number;
  type: 'mcq' | 'short';
  question: string;
  options?: string[];
  correctAnswer: string;
}

interface QuizSystemProps {
  topic: string;
  difficulty: string;
  onComplete: (score: number) => void;
  onClose: () => void;
  isFinal?: boolean;
}

import confetti from 'canvas-confetti';

export const QuizSystem: React.FC<QuizSystemProps> = ({ topic, difficulty, onComplete, onClose, isFinal }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadQuiz = async () => {
    setLoading(true);
    setResults(null);
    setError(null);
    setCurrentStep(0);
    setAnswers({});
    try {
      const data = await generateQuiz(topic, difficulty, isFinal);
      if (!data || !data.questions) throw new Error("Failed to generate quiz questions");
      setQuestions(data.questions);
    } catch (error) {
      console.error("Quiz generation error:", error);
      setError("Failed to load quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuiz();
  }, [topic, difficulty, retryCount]);

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [questions[currentStep].id]: answer });
  };

  const nextStep = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    setEvaluating(true);
    setError(null);
    try {
      let totalScore = 0;
      const evaluationResults = [];

      // Evaluate all questions
      for (const q of questions) {
        const userAnswer = answers[q.id] || "";
        if (q.type === 'mcq') {
          const isCorrect = userAnswer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
          const score = isCorrect ? 100 : 0;
          totalScore += score;
          evaluationResults.push({
            id: q.id,
            question: q.question,
            userAnswer,
            correctAnswer: q.correctAnswer,
            score,
            feedback: isCorrect ? "Perfect!" : "Not quite right.",
            explanation: `The correct answer is: ${q.correctAnswer}`
          });
        } else {
          try {
            const evalData = await evaluateQuiz(q.question, userAnswer);
            totalScore += evalData.score;
            evaluationResults.push({
              id: q.id,
              question: q.question,
              userAnswer,
              correctAnswer: q.correctAnswer,
              ...evalData
            });
          } catch (err) {
            console.error("Error evaluating short answer:", err);
            // Fallback for failed evaluation
            evaluationResults.push({
              id: q.id,
              question: q.question,
              userAnswer,
              correctAnswer: q.correctAnswer,
              score: 0,
              feedback: "Evaluation failed. Please try again.",
              explanation: "We couldn't evaluate this answer at the moment."
            });
          }
        }
      }

      const finalScore = Math.round(totalScore / questions.length);
      const correctAnswers = Math.round(totalScore / 100);
      
      if (finalScore >= 50 && auth.currentUser) {
        // Award XP based on score
        const xpAwarded = finalScore;
        try {
          await setDoc(doc(db, 'progress', auth.currentUser.uid), {
            xp: increment(xpAwarded)
          }, { merge: true });
        } catch (err) {
          console.error("Error awarding XP:", err);
          // Don't block the results if XP award fails, but log it
        }

        if (finalScore >= 80) {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#8b5cf6', '#3b82f6', '#10b981']
          });
        }
      }

      setResults({ score: finalScore, correctAnswers, totalQuestions: questions.length, details: evaluationResults });
    } catch (error) {
      console.error("Quiz evaluation error:", error);
      setError("Something went wrong while evaluating your quiz. Please try again.");
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-12 h-12 text-brand-purple animate-spin" />
        <p className="text-slate-400 animate-pulse">AI is crafting a fresh quiz for you...</p>
      </div>
    );
  }

  if (results) {
    const isPassed = results.score >= 50;

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-8"
      >
        <div className="text-center space-y-4">
          <div className={`w-32 h-32 rounded-full mx-auto flex flex-col items-center justify-center text-4xl font-black ${isPassed ? 'bg-emerald-500/20 text-emerald-500 neon-glow' : 'bg-red-500/20 text-red-500'}`}>
            {isFinal ? (
              <>
                <span className="text-3xl">{results.correctAnswers}</span>
                <span className="text-sm text-slate-400 font-medium border-t border-current pt-1 mt-1">/ {results.totalQuestions}</span>
              </>
            ) : (
              <span>{results.score}%</span>
            )}
          </div>
          <div>
            <h2 className="text-3xl font-bold">{isPassed ? "Congratulations!" : "Not quite there yet"}</h2>
            <p className="text-slate-400">
              {isPassed 
                ? (isFinal ? `You've mastered the final exam with a score of ${results.correctAnswers} out of ${results.totalQuestions} marks!` : "You've mastered today's topic with flying colors!") 
                : (isFinal ? `You need at least ${Math.ceil(results.totalQuestions / 2)} marks to pass the final exam. Let's try again.` : "You need at least 50% to move to the next day. Let's try a different set of questions.")}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {results.details.map((res: any, i: number) => (
            <div key={i} className={`glass p-6 rounded-2xl border-l-4 ${res.score >= 50 ? 'border-l-emerald-500' : 'border-l-red-500'}`}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <h4 className="font-bold text-slate-200">{res.question}</h4>
                {res.score >= 70 ? <CheckCircle2 className="text-emerald-500 shrink-0" /> : <XCircle className="text-red-500 shrink-0" />}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Your Answer</p>
                  <p className={res.score >= 70 ? 'text-emerald-400' : 'text-red-400'}>{res.userAnswer || "(No answer)"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Feedback</p>
                  <p className="text-slate-300">{res.feedback}</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-500 italic">{res.explanation}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          {!isPassed ? (
            <button 
              onClick={() => setRetryCount(prev => prev + 1)}
              className="flex-1 py-4 bg-brand-purple rounded-2xl font-bold neon-glow flex items-center justify-center gap-2"
            >
              Try New Quiz <RefreshCw className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={() => onComplete(results.score)}
              className="flex-1 py-4 bg-emerald-500 rounded-2xl font-bold neon-glow flex items-center justify-center gap-2"
            >
              {isFinal ? 'Finish Course' : 'Unlock Next Day'} <ArrowRight size={20} />
            </button>
          )}
          <button 
            onClick={onClose}
            className="px-8 py-4 glass rounded-2xl font-bold hover:bg-white/10 transition-all"
          >
            Close
          </button>
        </div>
      </motion.div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex flex-col items-center justify-center text-red-500">
          <XCircle size={40} />
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-2">Quiz Generation Failed</h3>
          <p className="text-slate-400">{error || "We couldn't generate questions for this topic."}</p>
        </div>
        <div className="flex gap-4 md:w-1/2 w-full">
          <button 
            onClick={() => setRetryCount(prev => prev + 1)}
            className="flex-1 py-4 glass rounded-2xl font-bold border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={20} /> Retry
          </button>
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-white/5 rounded-2xl font-bold hover:bg-white/10 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentStep];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-purple/20 flex items-center justify-center text-brand-purple">
            <Brain size={20} />
          </div>
          <div>
            <h3 className="font-bold">Daily Quiz</h3>
            <p className="text-xs text-slate-500">Question {currentStep + 1} of {questions.length}</p>
          </div>
        </div>
        <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-brand-purple"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-3"
          >
            <XCircle size={18} />
            {error}
          </motion.div>
        )}

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold leading-tight">{currentQ.question}</h2>

          {currentQ.type === 'mcq' ? (
            <div className="grid grid-cols-1 gap-3">
              {currentQ.options?.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  className={`p-5 rounded-2xl text-left transition-all border-2 ${answers[currentQ.id] === opt ? 'bg-brand-purple/20 border-brand-purple' : 'glass border-transparent hover:border-white/20'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${answers[currentQ.id] === opt ? 'border-brand-purple bg-brand-purple text-white' : 'border-slate-600'}`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className="font-medium">{opt}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <textarea
                value={answers[currentQ.id] || ""}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full h-40 p-6 rounded-3xl glass border-white/10 focus:border-brand-purple outline-none resize-none transition-all"
              />
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <Sparkles size={14} className="text-brand-purple" /> AI will evaluate your answer based on accuracy and depth.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between items-center pt-8 border-t border-white/5">
        <button 
          onClick={onClose}
          className="text-slate-500 hover:text-white transition-colors text-sm font-bold"
        >
          Cancel Quiz
        </button>
        <button 
          onClick={nextStep}
          disabled={!answers[currentQ.id] || evaluating}
          className="px-8 py-4 bg-brand-purple rounded-2xl font-bold neon-glow flex items-center gap-2 disabled:opacity-50"
        >
          {evaluating ? (
            <>Evaluating... <Loader2 size={20} className="animate-spin" /></>
          ) : (
            <>{currentStep === questions.length - 1 ? 'Finish Quiz' : 'Next Question'} <ArrowRight size={20} /></>
          )}
        </button>
      </div>
    </div>
  );
};
