import { GoogleGenAI, Type } from "@google/genai";

const apiKey = typeof process !== 'undefined' && process.env?.GEMINI_API_KEY 
  ? process.env.GEMINI_API_KEY 
  : (import.meta as any).env?.VITE_GEMINI_API_KEY || "";

const ai = new GoogleGenAI({ apiKey });

export const generateCurriculum = async (onboardingData: any) => {
  const model = "gemini-2.5-flash";
  const prompt = `Generate a 30-day personalized learning curriculum for a user with the following profile:
    Role: ${onboardingData.role}
    Skills: ${onboardingData.skills.join(", ")}
    Experience: ${onboardingData.experience}
    Industry: ${onboardingData.industry}
    Goals: ${onboardingData.goals}

    Return a JSON array of 30 days. Each day should have:
    - day (number)
    - topic (string)
    - tasks (array of strings)
    - resources (array of objects with 'name' and 'url')
    - assignment (string: a practical task or project to complete)
    - difficulty (string: Beginner, Intermediate, Advanced)`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.INTEGER },
            topic: { type: Type.STRING },
            tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
            resources: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  url: { type: Type.STRING }
                },
                required: ["name", "url"]
              } 
            },
            assignment: { type: Type.STRING },
            difficulty: { type: Type.STRING }
          },
          required: ["day", "topic", "tasks", "resources", "assignment", "difficulty"]
        }
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateExtraCourse = async (topic: string, profile: any) => {
  const model = "gemini-2.5-flash";
  const prompt = `Generate a 7-day intensive learning curriculum for the topic: "${topic}".
    The user's current profile is:
    Role: ${profile.role}
    Experience: ${profile.experience}
    
    Tailor the content to their experience level but focus specifically on ${topic}.
    
    Return a JSON array of 7 days. Each day should have:
    - day (number)
    - topic (string)
    - tasks (array of strings)
    - resources (array of objects with 'name' and 'url')
    - assignment (string)
    - difficulty (string)`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.INTEGER },
            topic: { type: Type.STRING },
            tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
            resources: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  url: { type: Type.STRING }
                },
                required: ["name", "url"]
              } 
            },
            assignment: { type: Type.STRING },
            difficulty: { type: Type.STRING }
          },
          required: ["day", "topic", "tasks", "resources", "assignment", "difficulty"]
        }
      }
    }
  });

  return JSON.parse(response.text);
};

export const chatWithMentorStream = async (message: string, history: any[]) => {
  const formattedHistory = history.map(msg => ({
    role: msg.role === 'bot' ? 'model' : 'user',
    parts: [{ text: msg.text }]
  }));

  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    history: formattedHistory,
    config: {
      systemInstruction: "You are SkillPilot AI Mentor. Provide simple, direct, and easy-to-understand answers. Avoid overly technical jargon unless necessary. Be concise but helpful.",
    }
  });

  return await chat.sendMessageStream({ message });
};

export const generateSuggestions = async (topic: string, day: number) => {
  const model = "gemini-2.5-flash";
  const prompt = `Based on the topic "${topic}" for Day ${day} of a learning curriculum, suggest 3 interesting and helpful questions a student might ask their AI mentor to deepen their understanding.
    
    Return a JSON array of 3 strings.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  return JSON.parse(response.text);
};

export const evaluateQuiz = async (question: string, userAnswer: string) => {
  const model = "gemini-2.5-flash";
  const prompt = `Evaluate the following short answer quiz response:
    Question: ${question}
    User Answer: ${userAnswer}

    Return a JSON object with:
    - score (number 0-100)
    - feedback (string)
    - explanation (string)`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ["score", "feedback", "explanation"]
      }
    }
  });

  if (!response.text) {
    throw new Error("AI failed to provide an evaluation response.");
  }

  return JSON.parse(response.text);
};

export const generateQuiz = async (topic: string, difficulty: string, isFinal: boolean = false) => {
  const model = "gemini-2.5-flash";
  const prompt = isFinal
    ? `Generate a comprehensive final exam for the course: "${topic}" at a ${difficulty} difficulty level.
    The exam MUST consist of exactly 10 Multiple Choice Questions (MCQ) covering various aspects of the topic.
    
    Return a JSON object with:
    - questions: array of exactly 10 objects
      - id: number
      - type: "mcq"
      - question: string
      - options: array of 4 strings
      - correctAnswer: string (the exact string from options)`
    : `Generate a daily quiz for the topic: "${topic}" at a ${difficulty} difficulty level.
    The quiz should consist of:
    - 2 Multiple Choice Questions (MCQ)
    - 1 Short Answer Question
    
    Return a JSON object with:
    - questions: array of objects
      - id: number
      - type: "mcq" or "short"
      - question: string
      - options: array of strings (only for mcq)
      - correctAnswer: string (for mcq, the exact string from options; for short, a model answer)`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                type: { type: Type.STRING },
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING }
              },
              required: ["id", "type", "question", "correctAnswer"]
            }
          }
        },
        required: ["questions"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateFlashcards = async (topic: string) => {
  const model = "gemini-2.5-flash";
  const prompt = `Generate a set of 5 key flashcards for the topic: "${topic}".
    Return a JSON object with:
    - flashcards: array of objects
      - front: string (the question or term)
      - back: string (the answer or definition)`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          flashcards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                front: { type: Type.STRING },
                back: { type: Type.STRING }
              },
              required: ["front", "back"]
            }
          }
        },
        required: ["flashcards"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateCapstone = async (courseTitle: string) => {
  const model = "gemini-2.5-flash";
  const prompt = `Generate a comprehensive final Capstone Project specification for a student who just completed a course on "${courseTitle}".
    The project should be a practical, real-world application of the skills learned.
    
    Return a JSON object with:
    - title: string
    - description: string
    - requirements: array of strings
    - bonusChallenges: array of strings`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
          bonusChallenges: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["title", "description", "requirements", "bonusChallenges"]
      }
    }
  });

  return JSON.parse(response.text);
};

