# AI Assistant Frontend

## Project Description

This is the frontend application for an AI Assistant that provides real-time conversational capabilities, weather updates, web search, and task management. It is built using **React (Vite)** with **Framer Motion** for animations and **Tailwind CSS** for styling. The app interacts with an Express.js backend that integrates with **OpenAI's Realtime API**, **OpenWeather API**, and **Tavily API**.

## Setup and Installation

### Prerequisites

Ensure you have the following installed:

- **Node.js** (>= 16.x)
- **npm** or **yarn**

### Installation Steps

1. Clone the repository:

   ```sh
   git clone https://github.com/your-repo/ai-assistant-frontend.git
   cd ai-assistant-frontend
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Set up the `.env` file:

   ```sh
   cp .env.example .env
   ```

   Edit the `.env` file and set your API base URL:

   ```env
   VITE_API_URL=http://localhost:3000
   ```

4. Start the frontend:

   ```sh
   npm run dev
   ```

   The app should now be running at `http://localhost:5173`.

## Features and How to Use

### 1️⃣ **Voice Interaction** 🎙️

- Click the **Start Call** button to initiate a real-time conversation.
- The AI assistant listens to your voice and responds in real time.
- Click **End Call** to stop the conversation.

### 2️⃣ **Weather Updates** ☀️

- Ask the assistant about the weather in any location, e.g., *"What's the weather in New York?"*
- The assistant fetches real-time weather data and displays it in a modal.

### 3️⃣ **Web Search** 🔍

- Ask the assistant to search the web, e.g., *"Find the latest tech news"*.
- The assistant fetches results using the Tavily API and displays them in a modal.

### 4️⃣ **Task Management** ✅

- Ask the assistant to **add a to-do**, e.g., *"Add a task to buy groceries"*.
- Ask the assistant to **list your to-dos**, e.g., *"Show my tasks"*.
- Click on a task to **mark it as completed**.
- Ask the assistant to **delete a task**, e.g., *"Remove task #3"*.
- Ask the assistant to **edit a task**, e.g., *"Change task #2 to 'Call John'"*.
- The to-do list updates automatically in real-time.

## API Integration

This frontend communicates with the backend using the following API endpoints:

### **1. AI Session Management**

- `POST /session` - Creates a new OpenAI Realtime session.

### **2. WebRTC Connection**

- `POST /webrtc-offer` - Handles WebRTC SDP offers for real-time conversation.

### **3. Weather API**

- `GET /weather?location={city}` - Fetches current weather information.

### **4. Web Search API**

- `POST /search` - Searches the web via Tavily API.

### **5. Task Management API**

- `POST /api/todos` - Create a new task.
- `GET /api/todos` - Retrieve all tasks.
- `PUT /api/todos/:id` - Update a task.
- `DELETE /api/todos/:id` - Delete a task.

## Notes

- Ensure the **backend is running** before using the frontend (`http://localhost:3000`).
- The app **requires microphone access** for voice interactions.
- The to-do list **auto-updates** when tasks are added, edited, or deleted.

## License

This project is licensed under the **MIT License**.

