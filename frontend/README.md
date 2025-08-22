# KrishiGPT Frontend

 AI Assistant for Farmers - Beautiful Next.js Interface

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The frontend will start at `http://localhost:3000`

##  Features

- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **Real-time Chat**: Interactive Q&A interface for farming questions
- **Gemini AI Integration**: Powered by Google's Gemini Pro model
- **Chat History**: Maintains conversation history during session
- **Loading States**: Smooth user experience with loading indicators
- **Error Handling**: Graceful error handling and user feedback
- **Mobile Responsive**: Works perfectly on all device sizes

## UI Components

- **Header**: Clean title and subtitle with farming theme
- **Input Section**: Large textarea with submit button
- **Chat Interface**: Question-answer pairs with visual distinction
- **Loading States**: Spinner and "Thinking..." text during API calls
- **Error Messages**: User-friendly error handling
- **Empty State**: Welcoming message when no questions asked

## Backend Integration

The frontend communicates with the FastAPI backend at `http://localhost:8000`:

- **POST /ask**: Sends farming questions and receives AI responses
- **Real-time Updates**: Immediate display of questions and answers
- **Source Attribution**: Shows whether response is from Gemini AI or mock data

## User Experience

1. **Ask Questions**: Type farming-related questions in the textarea
2. **Get Answers**: Receive AI-powered responses from KrishiGPT
3. **Chat History**: View all previous questions and answers
4. **Responsive Design**: Works seamlessly on desktop and mobile

##  Tech Stack

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **React Hooks**: State management with useState
- **Fetch API**: HTTP requests to backend

##  Development

```bash
npm install

npm run dev

npm run build

npm start

npm run lint
```

## Farming Questions Examples

- "How to improve wheat yield?"
- "What are the best practices for organic farming?"
- "How to manage soil erosion?"
- "What crops grow best in clay soil?"
- "How to control pests without chemicals?"
- "When is the best time to plant tomatoes?"

##  Backend Requirements

Make sure the FastAPI backend is running on `http://localhost:8000` before using the frontend.
