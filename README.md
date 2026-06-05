# 🌌 NexAI — Advanced Multimodal SaaS Chatbot Clone

[![Next.js](https://img.shields.io/badge/Next.js-15.0%2B-black?style=for-the-badge&logo=next.dotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-lightgrey?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Clerk](https://img.shields.io/badge/Clerk_Auth-Security-6C47FF?style=for-the-badge&logo=clerk)](https://clerk.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-orange?style=for-the-badge&logo=google)](https://ai.google.dev/)

NexAI is an enterprise-grade, high-fidelity multimodal SaaS chatbot application replicating the premium layouts of Google Gemini Advanced. Engine-anchored on Next.js, Express, MongoDB, and Clerk Security, it supports dynamic thread memory isolation, multimodal Base64 image analysis, and real-time client-side buffered microphone recording.

---

## 📊 Core Features Matrix

| Feature | Technical Description | Integration Stack |
| :--- | :--- | :--- |
| **Secure User Management** | Secure JWT verification gates protecting backend routes, profile hooks, dynamic client-side routing, and lazy initialization of authenticated states. | `@clerk/nextjs` (Frontend Provider), `@clerk/clerk-sdk-node` (Verification Gate) |
| **Persistent Thread Isolation** | Auto-saving conversational sessions linked to Clerk UIDs. Dynamic database writes save both user media attachments and generated responses. | MongoDB Atlas, Mongoose ODM, Express.js API |
| **Multimodal Vision Integration** | Client-side drag-and-drop or picker image serialization. Reads files using `FileReader` into Base64 streams, dispatched inside Express JSON body payloads. | Gemini 2.5 Flash Vision API (`inlineData`), Base64 Serialization |
| **Real-time Audio Processing** | Client-side buffer streaming via standard browser MediaRecorder APIs. Encodes microphone data chunks into Base64 WebM buffers for speech analysis. | HTML5 MediaStream API, Web Audio API, Gemini Audio Processing |
| **High-Fidelity UI/UX** | Ambient radial gradient blur masks, sliding sidebar navigation drawers, shimmering skeletons for thinking state, and inline audio playback nodes. | React 19, Tailwind CSS, Lucide Icons |

---

## 🛠️ Tech Stack Breakdown

### Frontend Layer
* **Next.js 15+**: Render optimization utilizing Turbopack development engines.
* **React 19**: Component lifecycle Hooks (`useState`, `useEffect`, `useRef`) synchronized with Clerk Auth context managers.
* **Tailwind CSS 3.4**: Clean carbon styling, customized glassmorphic blur masks, and custom teal/blue gradients.
* **Lucide React**: Minimalist UI vector symbols.

### Backend Gateway Layer
* **Node.js & Express.js 4.x**: High-performance HTTP server gateway handling application endpoints.
* **Body Parser Middleware**: Configured to parse up to **50MB** JSON payloads to enable base64 media stream uploads.
* **Google Generative AI SDK**: Direct programmatic bindings to `gemini-2.5-flash` model.

### Storage & Cloud Assets
* **MongoDB Atlas**: Cloud-hosted distributed Document Datastore for chat logging.
* **Mongoose ORM**: Schema-enforced collection models (`ChatSession` and `Message` tables).
* **Clerk Auth Security**: Distributed OAuth 2.0 verification system managing user identities.

---

## 📐 System Architecture Data Flow

```mermaid
graph TD
    A[React Client UI Node] -->|1. Request Authentication Token| B[Clerk Auth Provider]
    B -->|2. Return JWT Bearer Token| A
    A -->|3. POST /api/chat {message, image, audio, sessionId}| C[Express API Router]
    C -->|4. Validate Bearer Token Headers| D[Clerk Auth Middleware Gate]
    D -->|5. Token Validated (Populates req.auth.userId)| E[Chat Controller Action]
    E -->|6. Persist Conversation Records| F[MongoDB / Mongoose Datastore]
    E -->|7. Submit Multimodal Streams (Content Parts)| G[Google Gemini 2.5 Flash Engine]
    G -->|8. Return Response Content Buffer| E
    E -->|9. Dispatch JSON Output {success: true, response, sessionId}| A
```

---

## 📅 10-Days Development History Log

```yaml
Day 1: Project Repository Init & Local Dev Environment Anchoring
  - Set up root Workspace directories, package dependencies, and environment templates.
  - Linked Tailwind and PostCSS configuration engines to the frontend ecosystem.
Day 2: Database Layer Modeling & MongoDB Connections
  - Set up MongoDB Atlas cluster and integrated Mongoose connections into backend.
  - Created Mongoose schemas for chat session tracking and individual message tables.
Day 3: Theme Reverse-Engineering & Carbon Layouts
  - Built the premium glassmorphic dark UI.
  - Reverse-engineered Google Gemini Advanced aesthetics including dark grey backgrounds, radial matrix gradients, and textareas.
Day 4: Google Gen AI Core SDK Integration
  - Integrated the `@google/generative-ai` SDK and created backend service wrappers.
  - Mounted the `/api/chat` POST route to trigger Gemini responses.
Day 5: Session List & Sidebar Navigation Sync
  - Added session creation endpoints and fetched past sessions to populate the sidebar.
  - Bound list clicks to load historical messages based on sessionId.
Day 6: Clerk Engine Integration & Security Bearer Token Gates
  - Wired Clerk providers on the frontend and set up custom Clerk authentication middleware on the backend.
  - Verified bearer tokens and validated requests to prevent unauthenticated database writes.
Day 7: SDK Deprecation Migrations & Safety Checks
  - Upgraded Clerk Node SDK initializers to use secretKey configurations.
  - Added request validation guards inside routes to return 401s instead of database validator crashes.
Day 8: Base64 Vision Serialization & Payload Upgrades
  - Configured FileReader to process image uploads into Base64 data strings.
  - Upgraded Express parser body limits to 50MB to support media uploads, and rendered uploaded screenshots in chat bubbles.
Day 9: MediaRecorder API Integration & Audio Processing
  - Integrated browser MediaRecorder API to record, buffer, and convert audio notes into Base64 WebM payloads.
  - Configured backend to compile audio buffers inside Gemini inlineData requests, and rendered audio players in chat history.
Day 10: Code Optimization, Purge & Ledger Verification
  - Purged duplicate comments, cleaned up redundant debugging logs, and validated that frontend Next.js builds compile successfully.
  - Created the root repository documentation README.md.
```

---

## 🔑 Blueprint Environment Keys & Setup Manual

### Frontend Configurations
Create a `frontend/.env.local` file:
```env
# Clerk Authentication Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_dXAtZ29hdC00OS5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_blL2mspRc8F0HuJ5YXFoWRJZkujhdOhVbNIGccrSv3

# Target Backend Server Route
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

### Backend Configurations
Create a `backend/.env` file:
```env
# Server Port Configuration
PORT=5000

# Database URI (MongoDB Atlas or Local instance)
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/nexai?retryWrites=true&w=majority

# Clerk Secret Key for SDK verification
CLERK_SECRET_KEY=sk_test_blL2mspRc8F0HuJ5YXFoWRJZkujhdOhVbNIGccrSv3

# Google Generative AI API Key
AI_API_KEY=AIzaSy...
```

---

### Step-by-Step Installation

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd chatbot-app
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Create a .env file matching the blueprint above, then start development server:
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   # Create a .env.local file matching the blueprint above, then start dev server:
   npm run dev
   ```

4. **Navigate to App**:
   - Open browser and navigate to: `http://localhost:3000`

---

## 📢 Production Notices

> [!WARNING]
> **Payload Limits**: The backend gateway body parser is configured to accept JSON payloads up to **50MB**. Uploading files larger than this threshold will trigger a `413 Payload Too Large` error, which is caught safely by the frontend to prevent page crashes.

> [!TIP]
> **Microphone Permissions**: The browser will request microphone hardware access on the first click of the mic button. Ensure permissions are allowed; otherwise, the client-side recorder will fail to grab streams and log stream capture errors.