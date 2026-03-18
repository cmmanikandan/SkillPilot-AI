import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, 
  Timer, 
  Zap, 
  Trophy, 
  RotateCcw, 
  Play,
  Keyboard,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

const CODE_SNIPPETS = [
  "const [state, setState] = useState(null);",
  "useEffect(() => { return () => {} }, []);",
  "const response = await fetch('/api/data');",
  "export default function App() { return <div />; }",
  "array.map(item => <li key={item.id}>{item.name}</li>)",
  "const { data, loading, error } = useQuery(GET_DATA);",
  "git commit -m 'feat: add new feature'",
  "npm install framer-motion lucide-react",
  "docker-compose up --build -d",
  "const memoizedValue = useMemo(() => compute(a, b), [a, b]);"
];

const BUG_SNIPPETS = [
  { code: "const x = [1, 2, 3];\nconsole.log(x[3])", bug: "Index out of bounds", options: ["Index out of bounds", "Syntax error", "Reference error", "No bug"] },
  { code: "function add(a, b) {\n  return a + b\n}\nadd(5)", bug: "Missing argument", options: ["Missing argument", "Syntax error", "Type error", "No bug"] },
  { code: "if (x = 5) {\n  console.log('Five')\n}", bug: "Assignment in condition", options: ["Assignment in condition", "Syntax error", "Reference error", "No bug"] },
  { code: "const obj = { name: 'SkillPilot' };\nobj.name = 'AI';", bug: "No bug", options: ["No bug", "Assignment to constant", "Syntax error", "Type error"] },
  { code: "for (let i = 0; i < 10; i--) {\n  console.log(i)\n}", bug: "Infinite loop", options: ["Infinite loop", "Syntax error", "Reference error", "No bug"] },
  { code: "const data = await fetch('/api');", bug: "Missing async", options: ["Missing async", "Syntax error", "Reference error", "No bug"] },
];

export const TechGames: React.FC = () => {
  const [activeGame, setActiveGame] = useState<'typing' | 'debug' | 'color'>('typing');
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('skillpilot_high_score');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong', option: string } | null>(null);
  
  // Typing Game State
  const [currentSnippet, setCurrentSnippet] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [wpm, setWpm] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Debug Game State
  const [currentBug, setCurrentBug] = useState<typeof BUG_SNIPPETS[0] | null>(null);
  
  // Color Game State
  const [colorTarget, setColorTarget] = useState('');
  const [colorOptions, setColorOptions] = useState<string[]>([]);

  useEffect(() => {
    let timer: any;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('finished');
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('skillpilot_high_score', score.toString());
      }
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const startGame = (game: 'typing' | 'debug' | 'color') => {
    setActiveGame(game);
    setGameState('playing');
    setTimeLeft(30);
    setScore(0);
    
    if (game === 'typing') {
      setTimeLeft(60);
      setUserInput('');
      setCurrentSnippet(CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)]);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else if (game === 'debug') {
      generateBugProblem();
    } else if (game === 'color') {
      generateColorProblem();
    }
  };

  const generateBugProblem = () => {
    const bug = BUG_SNIPPETS[Math.floor(Math.random() * BUG_SNIPPETS.length)];
    setCurrentBug(bug);
  };

  const generateColorProblem = () => {
    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
    const target = colors[Math.floor(Math.random() * colors.length)];
    const options = [...colors].sort(() => Math.random() - 0.5);
    setColorTarget(target);
    setColorOptions(options);
  };

  const handleTypingInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserInput(val);
    
    if (val === currentSnippet) {
      setScore(prev => prev + 10);
      setTotalChars(prev => prev + currentSnippet.length);
      setUserInput('');
      setCurrentSnippet(CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)]);
      
      const timeElapsed = (60 - timeLeft) / 60;
      const words = (totalChars + currentSnippet.length) / 5;
      setWpm(Math.round(words / (timeElapsed || 1)));
    }
  };

  const handleBugAnswer = (answer: string) => {
    if (answer === currentBug?.bug) {
      setScore(prev => prev + 15);
      setFeedback({ type: 'correct', option: answer });
      confetti({ particleCount: 20, spread: 30, origin: { y: 0.8 } });
    } else {
      setFeedback({ type: 'wrong', option: answer });
    }
    
    setTimeout(() => {
      setFeedback(null);
      generateBugProblem();
    }, 1000);
  };

  const handleColorAnswer = (color: string) => {
    if (color === colorTarget) {
      setScore(prev => prev + 10);
      confetti({ particleCount: 20, spread: 30, origin: { y: 0.8 } });
    }
    generateColorProblem();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Skill Games</h1>
          <p className="text-slate-400">Sharpen your reflexes and logic between study sessions.</p>
        </div>
        <div className="glass px-4 py-2 rounded-xl flex items-center gap-2 text-brand-purple font-bold">
          <Trophy size={18} /> High Score: {highScore}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Game Selection Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <button 
            onClick={() => startGame('typing')}
            className={`w-full p-6 rounded-3xl text-left transition-all border-2 ${activeGame === 'typing' && gameState === 'playing' ? 'bg-brand-purple/20 border-brand-purple' : 'glass border-transparent hover:border-white/10'}`}
          >
            <Keyboard className="mb-3 text-brand-purple" size={24} />
            <h3 className="font-bold">Syntax Sprint</h3>
            <p className="text-xs text-slate-500">Typing speed & accuracy</p>
          </button>
          <button 
            onClick={() => startGame('debug')}
            className={`w-full p-6 rounded-3xl text-left transition-all border-2 ${activeGame === 'debug' && gameState === 'playing' ? 'bg-brand-blue/20 border-brand-blue' : 'glass border-transparent hover:border-white/10'}`}
          >
            <Zap className="mb-3 text-brand-blue" size={24} />
            <h3 className="font-bold">Bug Hunter</h3>
            <p className="text-xs text-slate-500">Identify the code issue</p>
          </button>
          <button 
            onClick={() => startGame('color')}
            className={`w-full p-6 rounded-3xl text-left transition-all border-2 ${activeGame === 'color' && gameState === 'playing' ? 'bg-emerald-500/20 border-emerald-500' : 'glass border-transparent hover:border-white/10'}`}
          >
            <Gamepad2 className="mb-3 text-emerald-500" size={24} />
            <h3 className="font-bold">Hex Match</h3>
            <p className="text-xs text-slate-500">Color vision & speed</p>
          </button>

          {/* Live Leaderboard */}
          <div className="glass p-6 rounded-3xl mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Trophy size={16} className="text-amber-400" /> Live Leaderboard
              </h3>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="space-y-3">
              {[
                { name: 'Alex K.', score: 1450, active: true },
                { name: 'Sarah M.', score: 1320, active: false },
                { name: 'David W.', score: 1280, active: true },
                { name: 'Elena R.', score: 1150, active: false },
              ].map((user, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-bold w-3">{i + 1}</span>
                    <span className={user.active ? 'text-white font-bold' : 'text-slate-400'}>{user.name}</span>
                  </div>
                  <span className="font-mono text-brand-purple">{user.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="lg:col-span-3 glass rounded-[3rem] p-10 relative overflow-hidden min-h-[500px] flex flex-col">
          <AnimatePresence mode="wait">
            {gameState === 'idle' && (
              <motion.div 
                key="idle"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
              >
                <div className="w-24 h-24 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple neon-glow">
                  <Gamepad2 size={48} />
                </div>
                <div>
                  <h2 className="text-4xl font-black mb-4">Ready to Play?</h2>
                  <p className="text-slate-400 max-w-md mx-auto">Select a game from the sidebar to start training your developer skills.</p>
                </div>
                <button 
                  onClick={() => startGame('typing')}
                  className="px-10 py-5 bg-brand-purple rounded-2xl font-bold neon-glow hover:scale-105 transition-all text-lg"
                >
                  Quick Start
                </button>
              </motion.div>
            )}

            {gameState === 'playing' && (
              <motion.div 
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col"
              >
                <div className="flex justify-between items-center mb-12">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-brand-blue text-xl font-black">
                      <Timer size={24} /> {timeLeft}s
                    </div>
                    <div className="flex items-center gap-2 text-brand-purple text-xl font-black">
                      <Zap size={24} /> {score}
                    </div>
                  </div>
                  <div className="px-4 py-1 rounded-full bg-white/5 text-xs font-bold uppercase tracking-widest text-slate-500">
                    {activeGame} Mode
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  {activeGame === 'typing' && (
                    <div className="space-y-8">
                      <div className="text-3xl font-mono bg-black/40 p-10 rounded-[2rem] border border-white/10 relative leading-relaxed">
                        <span className="text-slate-400">{currentSnippet}</span>
                        <div className="absolute top-10 left-10 text-brand-purple">
                          {userInput.split('').map((char, i) => (
                            <span key={i} className={char === currentSnippet[i] ? 'text-emerald-400' : 'text-red-400'}>
                              {char}
                            </span>
                          ))}
                        </div>
                      </div>
                      <input
                        ref={inputRef}
                        type="text"
                        value={userInput}
                        onChange={handleTypingInput}
                        placeholder="Type exactly as shown..."
                        className="w-full bg-white/5 border-2 border-white/10 rounded-2xl py-6 px-8 outline-none focus:border-brand-purple transition-all font-mono text-xl"
                      />
                    </div>
                  )}

                  {activeGame === 'debug' && currentBug && (
                    <div className="text-center space-y-8">
                      <div className="bg-black/40 p-8 rounded-3xl border border-white/10 font-mono text-left overflow-x-auto">
                        <pre className="text-brand-blue text-lg">
                          {currentBug.code}
                        </pre>
                      </div>
                      <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                        {currentBug.options.map((option, i) => (
                          <button
                            key={i}
                            onClick={() => !feedback && handleBugAnswer(option)}
                            disabled={!!feedback}
                            className={`px-6 py-4 glass border rounded-2xl font-bold transition-all ${
                              feedback?.option === option 
                                ? feedback.type === 'correct' 
                                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                                  : 'bg-red-500/20 border-red-500 text-red-400'
                                : feedback && option === currentBug.bug
                                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                  : 'border-white/5 hover:bg-brand-blue/20 hover:border-brand-blue'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeGame === 'color' && (
                    <div className="text-center space-y-12">
                      <div className="flex flex-col items-center gap-4">
                        <div 
                          className="w-32 h-32 rounded-[2.5rem] shadow-2xl"
                          style={{ backgroundColor: colorTarget }}
                        />
                        <p className="font-mono text-xl font-bold text-slate-400">{colorTarget.toUpperCase()}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                        {colorOptions.map((color, i) => (
                          <button
                            key={i}
                            onClick={() => handleColorAnswer(color)}
                            className="aspect-square rounded-2xl border-4 border-transparent hover:border-white/50 transition-all shadow-lg"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {gameState === 'finished' && (
              <motion.div 
                key="finished"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
              >
                <div className="relative">
                  <div className="text-8xl font-black text-brand-purple mb-2">{score}</div>
                  <Trophy className="absolute -top-6 -right-6 text-amber-400 animate-bounce" size={48} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">Session Complete!</h2>
                  <p className="text-slate-400">Great job! You've earned some mental clarity (and some XP).</p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => startGame(activeGame)}
                    className="px-10 py-5 bg-brand-purple rounded-2xl font-bold neon-glow flex items-center gap-2 hover:scale-105 transition-all"
                  >
                    <RotateCcw size={20} /> Play Again
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
