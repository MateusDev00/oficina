// lib/llm.ts
import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

// Modelo rápido (Groq) – para respostas simples, consultas de OS, agendamentos
export const groqLLM = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.5,
  apiKey: process.env.GROQ_API_KEY,
});

// Modelo de qualidade (Gemini) – para diagnóstico complexo, RAG, conversas mais elaboradas
export const geminiLLM = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0.7,
  apiKey: process.env.GOOGLE_API_KEY,
});

// Embeddings (Gemini) – usado para RAG
export const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004",
  apiKey: process.env.GOOGLE_API_KEY,
});