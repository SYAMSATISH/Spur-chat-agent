# Spur Chat Agent

A full-stack AI support agent application built with Node.js, Express, Prisma, SQLite, and Svelte.

## Features

- **Live Chat Interface**: Real-time chat UI with optimistic updates and typing indicators.
- **AI Integration**: Powered by OpenAI gpt-3.5-turbo with system prompting for domain knowledge.
- **Session Management**: Conversations are persisted and capable of being restored across page reloads.
- **Robustness**: Handles API errors, network issues, and empty inputs gracefully.
- **Dark Mode**: Sleek, modern dark-themed UI.

## Technology Stack

- **Backend**: Node.js, Express, TypeScript, Zod
- **Database**: SQLite with Prisma ORM v5
- **Frontend**: Svelte, TypeScript, Vite
- **Styling**: Vanilla CSS (Variables & Flexbox)

## Prerequisites

- Node.js (v18+)
- npm

## Setup & Running

1.  **Clone the repository** (if you haven't already):
    ```bash
    git clone <repo-url>
    cd spur-chat-agent
    ```

2.  **Backend Setup**:
    ```bash
    cd server
    npm install
    
    # Create .env file
    echo 'DATABASE_URL="file:./dev.db"' > .env
    echo 'OPENAI_API_KEY="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"' >> .env
    echo 'PORT=3000' >> .env
    
    # Run Migrations
    npx prisma migrate dev --name init
    
    # Start Development Server
    npm run dev
    ```

3.  **Frontend Setup** (Open a new terminal):
    ```bash
    cd client
    npm install
    npm run dev
    ```

4.  **Access App**:
    Open `http://localhost:5173` (or the port shown in your terminal).

## Architecture Overview

### Backend (`server`)

- **Structure**: 
  - `controllers/`: Handles request logic.
  - `routes/`: Defines API endpoints.
  - `services/`: Encapsulates external API calls (OpenAI).
  - `utils/`: Shared utilities (Prisma client).
- **Database**: Uses SQLite for zero-config persistence. The schema includes `Conversation` (sessions) and `Message` (chat logs) models.
- **Validation**: `Zod` is used to validate incoming requests, ensuring robustness against bad input.
- **Error Handling**: Centralized error catching in controllers returns cleaner JSON errors to the client.

### Frontend (`client`)

- **Component-Based**: Built with Svelte for reactivity and minimal boilerplate.
- **State**: Manages chat history and session IDs locally. Session ID is stored in `localStorage` to persist context across reloads.
- **API Layer**: `api.ts` abstracts HTTP calls from the UI logic.
- **Styles**: `app.css` defines a global theme, keeping components clean.

## LLM Integration

- **Provider**: OpenAI (`gpt-3.5-turbo`).
- **Context Window**: Touches only the last 10 messages to balance context with token costs.
- **System Prompt**: Injected with specific domain knowledge (Shipping policies, Store hours) to simulate a real support agent.

## Future Improvements

- **WebSockets**: For real-time typing indicators from the agent.
- **Queueing**: To handle high concurrency better than simple awaits.
- **Vector DB**: For RAG (Retrieval-Augmented Generation) to search a larger knowledge base instead of hardcoded prompts.
# Spur-chat-agent
