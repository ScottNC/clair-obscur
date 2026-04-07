# Clair Obscur: Expedition 33 - AI Chatbot

An AI assistant for the 2025 game Clair Obscur: Expediton 33, powered by RAG. Ask questions about characters, help with boss battles, pictos and setups.

## Features
- **Intelligent Chat Interface** - Ask questions have a conversation with the chatbot about the game with conversation memory.
- **RAG Architecture** Uses RAG (Retreival Augmented Generation) to obtain relevant game information from vector databases.
- **Web Scraping** Automatically scrapes online game guides to populate databases.
- **Modern User Interface** Build using assistant-ui with Clair Obscur wallpaper.

## Tech Stack

### Backend
- **Node.js + Express** - API server
- **ChromaDB** - Vector database for document storage
- **Groq** - LLM provider (llama-3.3-70b-versatile)
- **Cheerio** - Web scraping
- **TypeScript** - Type safety

### Frontend
- **Next.js 16** - React framework
- **assistant-ui** - Chat UI components
- **shadcn/ui** - UI component library
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

## Prerequisites

- Node.js 24+
- ChromaDB account
- Groq account