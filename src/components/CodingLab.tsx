import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { 
  Play, 
  Bug, 
  Terminal, 
  Code2, 
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

export const CodingLab: React.FC = () => {
  const [code, setCode] = useState('// Start coding here...\nconsole.log("Hello SkillPilot!");');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [activeProblem, setActiveProblem] = useState(0);

  const problems = [
    {
      title: "Two Sum",
      difficulty: "Easy",
      desc: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      starter: "function twoSum(nums, target) {\n  // Your code here\n}"
    },
    {
      title: "Reverse String",
      difficulty: "Easy",
      desc: "Write a function that reverses a string. The input string is given as an array of characters s.",
      starter: "function reverseString(s) {\n  // Your code here\n}"
    },
    {
      title: "Valid Parentheses",
      difficulty: "Medium",
      desc: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
      starter: "function isValid(s) {\n  // Your code here\n}"
    }
  ];

  const handleRun = async () => {
    setRunning(true);
    setOutput('');
    
    // Create a safe environment to capture console.log
    const logs: string[] = [];
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (...args) => {
      logs.push(args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
    };
    
    console.error = (...args) => {
      logs.push('ERROR: ' + args.map(arg => String(arg)).join(' '));
    };

    try {
      if (language === 'javascript') {
        // Use a Function constructor for slightly better isolation than eval
        const runner = new Function(code);
        runner();
        setOutput(logs.join('\n') || 'Code executed successfully (no output).');
      } else {
        // Mock for other languages
        setTimeout(() => {
          setOutput(`Execution of ${language} is currently simulated.\nOutput: Hello from ${language} environment!`);
          setRunning(false);
        }, 1000);
        return;
      }
    } catch (error: any) {
      setOutput(`RUNTIME ERROR: ${error.message}`);
    } finally {
      console.log = originalLog;
      console.error = originalError;
      setRunning(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-160px)]">
      {/* Problems Sidebar */}
      <div className="lg:col-span-3 glass rounded-3xl overflow-hidden flex flex-col border border-white/10">
        <div className="p-6 border-b border-white/10 bg-white/5">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Code2 size={24} className="text-brand-purple" /> Coding Lab
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {problems.map((p, i) => (
            <button
              key={i}
              onClick={() => { setActiveProblem(i); setCode(p.starter); }}
              className={`w-full p-5 rounded-2xl text-left transition-all border ${activeProblem === i ? 'bg-brand-purple/10 border-brand-purple/30' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-sm">{p.title}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${p.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
                  {p.difficulty}
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">{p.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Editor Main */}
      <div className="lg:col-span-9 flex flex-col gap-6">
        <div className="flex-1 glass rounded-3xl overflow-hidden flex flex-col border border-white/10">
          <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none font-bold"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
              <span className="text-sm font-bold text-slate-300">{problems[activeProblem].title}</span>
            </div>
            <div className="flex gap-2">
              <button className="p-2.5 glass rounded-xl text-slate-400 hover:text-white transition-all">
                <Bug size={20} />
              </button>
              <button 
                onClick={handleRun}
                disabled={running}
                className="px-6 py-2.5 bg-brand-purple rounded-xl text-sm font-bold flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50 neon-glow"
              >
                {running ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />} Run Code
              </button>
            </div>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 15,
                padding: { top: 20 },
                fontFamily: 'JetBrains Mono',
                lineNumbers: 'on'
              }}
            />
          </div>
        </div>

        {/* Console */}
        <div className="h-48 glass rounded-3xl overflow-hidden flex flex-col border border-white/10">
          <div className="px-6 py-3 border-b border-white/10 bg-white/5 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Terminal size={14} /> Console Output
          </div>
          <div className="flex-1 p-6 font-mono text-sm text-slate-300 overflow-y-auto whitespace-pre-wrap bg-black/40">
            {output || 'Run your code to see the output...'}
          </div>
        </div>
      </div>
    </div>
  );
};
