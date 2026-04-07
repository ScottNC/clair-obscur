# Clair Obscur: Expedition 33 - AI Chatbot

An AI assistant for the 2025 game Clair Obscur: Expediton 33, powered by RAG. Ask questions about characters, help with boss battles, pictos and setups.

## Features
- **Intelligent Chat Interface** - Ask questions have a conversation with the chatbot about the game with conversation memory.
- **RAG Architecture** Uses RAG (Retreival Augmented Generation) to obtain relevant game information from vector databases.
- **Web Scraping** Automatically scrapes online game guides to populate databases.
- **Text Chunking** Splits long documents for optimal retrieval.
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
(The free versions will suffice)

## Setup Guide

### Step 1: Clone Repository

```
git clone https://github.com/ScottNC/clair-obscur.git
```

### Step 2: Install dependencies

This will install everything for the backend and the frontend

```
npm run install:all
```

Run `npm i`, `npm run install:frontend` and `npm run install:backend` to install the dependencies separately.

### Step 3: Set backend environment variables

Create a `.env` file in the backend directory

```
# From you Chroma account
CHROMA_TENNANT=chroma-tennant
CHROMA_API_KEY=chroma-api-key
CHROMA_DATABASE=chroma-database-name

# From your Groq account
GROQ_API_KEY=groq-key
```

### Step 4: Populate the Chroma database

From either the root directory or the backend directory run the following

```
npm run populate
```

This will produce and store the Chroma database

## Running the App

Now that you have everything setup run the following in the root directory to start the AI assistant.

```
npm run dev
```

This will run the frontend and backend concurrently. If you want to run them separately you can use two terminals and run the same command in the frontend and backend directories.

## Testing

Unit tests are available on the backend

```
cd backend
npm run test
```

## Future Work

- Include more online game guides to provide better support for game strategy.
- Deploy to production using Vercel and Render.
- Experiment with LangChain to improve RAG model.
- Add user feedback to improve AI assistant's answers.
- Implement streaming response from Groq to improve user experience.

## Acknowledgments

- Maxroll.gg and IGN for comprehensive game guides
- Groq for an LLM server
- Chroma for vector database
- assistant-ui for chat UI components
