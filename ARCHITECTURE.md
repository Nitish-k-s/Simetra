# SIMETRA AI Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Landing    │  │  Procedures  │  │ Instructions │         │
│  │     Page     │  │   Selection  │  │    Guide     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │     CPR      │  │   Cardiac    │  │  Evaluation  │         │
│  │  Simulation  │  │  Simulation  │  │    Results   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────┐       │
│  │          Chat Widget (All Pages)                    │       │
│  │  ┌────────────────────────────────────────────┐     │       │
│  │  │  💬 AI Training Assistant                  │     │       │
│  │  │  • Real-time help                          │     │       │
│  │  │  • Context-aware responses                 │     │       │
│  │  │  • Quick suggestions                       │     │       │
│  │  └────────────────────────────────────────────┘     │       │
│  └─────────────────────────────────────────────────────┘       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP Requests
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VERCEL SERVERLESS FUNCTIONS                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────┐  ┌──────────────────────────┐   │
│  │   /api/evaluate          │  │   /api/chat              │   │
│  │                          │  │                          │   │
│  │  • Receives metrics      │  │  • Receives message      │   │
│  │  • Builds prompt         │  │  • Builds prompt         │   │
│  │  • Calls Gemini API      │  │  • Calls Gemini API      │   │
│  │  • Parses response       │  │  • Returns reply         │   │
│  │  • Returns JSON          │  │                          │   │
│  └──────────────────────────┘  └──────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS + API Key
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      GOOGLE GEMINI API                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Gemini 1.5 Flash Model                                  │  │
│  │                                                          │  │
│  │  • Analyzes performance metrics                         │  │
│  │  • Generates structured feedback                        │  │
│  │  • Answers training questions                           │  │
│  │  • Provides improvement suggestions                     │  │
│  │                                                          │  │
│  │  Response Time: < 3 seconds                             │  │
│  │  Token Limit: 800 (eval) / 300 (chat)                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Simulation → Evaluation Flow

```
User Completes Simulation
         │
         ▼
┌─────────────────────┐
│  Simulation Engine  │
│  (sim-core.js or    │
│   cpr-core.js)      │
└─────────────────────┘
         │
         │ Collects Metrics:
         │ • Accuracy
         │ • BPM / Reaction Time
         │ • Consistency
         │ • Completion Time
         ▼
┌─────────────────────┐
│  sessionStorage     │
│  {                  │
│    procedure: "CPR" │
│    metrics: {...}   │
│  }                  │
└─────────────────────┘
         │
         │ Redirect
         ▼
┌─────────────────────┐
│  evaluation.html    │
│                     │
│  • Reads session    │
│  • Displays local   │
│  • Calls AI API     │
└─────────────────────┘
         │
         │ POST /api/evaluate
         ▼
┌─────────────────────┐
│  Gemini API         │
│  Analyzes & Returns │
└─────────────────────┘
         │
         │ JSON Response
         ▼
┌─────────────────────┐
│  Display Results    │
│  • Score            │
│  • Skill Level      │
│  • Strengths        │
│  • Improvements     │
│  • Summary          │
└─────────────────────┘
```

### 2. Chat Interaction Flow

```
User Opens Chat Widget
         │
         ▼
┌─────────────────────┐
│  chat-widget.js     │
│  • Detects page     │
│  • Sets context     │
└─────────────────────┘
         │
         │ User Types Message
         ▼
┌─────────────────────┐
│  Add to UI          │
│  Show typing...     │
└─────────────────────┘
         │
         │ POST /api/chat
         │ {
         │   message: "...",
         │   context: "CPR"
         │ }
         ▼
┌─────────────────────┐
│  api/chat.js        │
│  • Validates input  │
│  • Builds prompt    │
│  • Calls Gemini     │
└─────────────────────┘
         │
         │ Gemini API Call
         ▼
┌─────────────────────┐
│  Gemini Response    │
│  "Focus on..."      │
└─────────────────────┘
         │
         │ JSON { reply: "..." }
         ▼
┌─────────────────────┐
│  Display in Chat    │
│  • Remove typing    │
│  • Show AI message  │
│  • Scroll to bottom │
└─────────────────────┘
```

## Component Architecture

### Frontend Components

```
simetra/
│
├── Core Pages
│   ├── index.html           → Landing page
│   ├── procedures.html      → Procedure selection
│   ├── instructions.html    → Pre-op guide
│   ├── simulation.html      → Cardiac simulation
│   ├── cpr.html             → CPR simulation
│   └── evaluation.html      → Results + AI feedback
│
├── Simulation Engines
│   ├── sim-core.js          → Cardiac simulation logic
│   │   ├── Three.js rendering
│   │   ├── State machine
│   │   ├── Metrics tracking
│   │   └── Performance data
│   │
│   └── cpr-core.js          → CPR simulation logic
│       ├── Three.js rendering
│       ├── BPM tracking
│       ├── Rhythm analysis
│       └── Performance data
│
└── AI Components
    └── chat-widget.js       → Chat widget
        ├── UI rendering
        ├── Message handling
        ├── API communication
        └── Context detection
```

### Backend API Routes

```
api/
│
├── evaluate.js
│   ├── Request validation
│   ├── Prompt construction
│   │   ├── System instruction
│   │   ├── Metrics formatting
│   │   └── Response schema
│   ├── Gemini API call
│   ├── Response parsing
│   │   ├── JSON extraction
│   │   ├── Validation
│   │   └── Fallback handling
│   └── CORS headers
│
└── chat.js
    ├── Request validation
    ├── Context building
    │   ├── Base instruction
    │   └── Procedure context
    ├── Gemini API call
    ├── Response extraction
    └── CORS headers
```

## Technology Stack

### Frontend
```
┌─────────────────────────────────────┐
│  HTML5 + CSS3 (Tailwind)            │
│  ├── Semantic markup                │
│  ├── Responsive design               │
│  └── Utility-first styling          │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Vanilla JavaScript (ES6+)          │
│  ├── Async/await                    │
│  ├── Fetch API                      │
│  ├── sessionStorage                 │
│  └── Event handling                 │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Three.js                            │
│  ├── 3D rendering                   │
│  ├── GLTF model loading             │
│  ├── Animations                     │
│  └── Camera controls                │
└─────────────────────────────────────┘
```

### Backend
```
┌─────────────────────────────────────┐
│  Vercel Serverless Functions        │
│  ├── Node.js 18.x                   │
│  ├── Auto-scaling                   │
│  ├── Edge network                   │
│  └── Environment variables          │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Gemini 1.5 Flash API               │
│  ├── REST API                       │
│  ├── JSON responses                 │
│  ├── Rate limiting                  │
│  └── Safety filters                 │
└─────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Security Layers                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Environment Variables                               │
│     ├── API key stored in .env                         │
│     ├── Never exposed to frontend                      │
│     └── Vercel environment config                      │
│                                                         │
│  2. CORS Configuration                                  │
│     ├── Access-Control-Allow-Origin: *                 │
│     ├── Access-Control-Allow-Methods: POST, OPTIONS    │
│     └── Access-Control-Allow-Headers: Content-Type     │
│                                                         │
│  3. Input Validation                                    │
│     ├── Required field checks                          │
│     ├── Type validation                                │
│     └── Sanitization                                   │
│                                                         │
│  4. Gemini Safety Filters                              │
│     ├── Built-in content filtering                     │
│     ├── Harmful content blocking                       │
│     └── PII protection                                 │
│                                                         │
│  5. Rate Limiting (Future)                             │
│     ├── Per-IP limits                                  │
│     ├── Per-user limits                                │
│     └── Quota management                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Performance Optimization

### Response Time Optimization
```
Target: < 3 seconds

┌─────────────────────────────────────┐
│  Optimization Strategies            │
├─────────────────────────────────────┤
│                                     │
│  1. Model Selection                 │
│     └── Gemini 1.5 Flash (fastest) │
│                                     │
│  2. Token Limits                    │
│     ├── Evaluation: 800 tokens     │
│     └── Chat: 300 tokens            │
│                                     │
│  3. Prompt Engineering              │
│     ├── Concise instructions        │
│     ├── Clear output format         │
│     └── Minimal examples            │
│                                     │
│  4. Caching (Future)                │
│     ├── Common responses            │
│     └── Procedure guides            │
│                                     │
└─────────────────────────────────────┘
```

### Frontend Performance
```
┌─────────────────────────────────────┐
│  Loading Optimization               │
├─────────────────────────────────────┤
│                                     │
│  1. Lazy Loading                    │
│     ├── Chat widget on demand       │
│     └── 3D models progressive       │
│                                     │
│  2. Code Splitting                  │
│     ├── Separate simulation cores   │
│     └── Modular components          │
│                                     │
│  3. Asset Optimization              │
│     ├── Compressed 3D models        │
│     ├── Optimized images            │
│     └── Minified scripts            │
│                                     │
│  4. Caching                         │
│     ├── Browser cache headers       │
│     ├── Service worker (future)    │
│     └── CDN for static assets       │
│                                     │
└─────────────────────────────────────┘
```

## Scalability

### Current Architecture (Stateless)
```
┌─────────────────────────────────────┐
│  Horizontal Scaling                 │
├─────────────────────────────────────┤
│                                     │
│  ✅ Serverless functions            │
│     └── Auto-scale with demand      │
│                                     │
│  ✅ No database                     │
│     └── No bottleneck               │
│                                     │
│  ✅ CDN distribution                │
│     └── Global edge network         │
│                                     │
│  ✅ Stateless design                │
│     └── No session management       │
│                                     │
└─────────────────────────────────────┘
```

### Future Enhancements
```
┌─────────────────────────────────────┐
│  Scalability Improvements           │
├─────────────────────────────────────┤
│                                     │
│  1. Database Layer                  │
│     ├── User accounts               │
│     ├── Progress tracking           │
│     └── Analytics                   │
│                                     │
│  2. Caching Layer                   │
│     ├── Redis for sessions          │
│     ├── Response caching            │
│     └── Rate limit tracking         │
│                                     │
│  3. Load Balancing                  │
│     ├── Multiple API keys           │
│     ├── Fallback models             │
│     └── Request queuing             │
│                                     │
└─────────────────────────────────────┘
```

## Monitoring & Observability

```
┌─────────────────────────────────────────────────────────┐
│                    Monitoring Stack                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Vercel Analytics                                       │
│  ├── Function execution times                          │
│  ├── Error rates                                       │
│  ├── Request volumes                                   │
│  └── Geographic distribution                           │
│                                                         │
│  Google Cloud Console                                   │
│  ├── Gemini API usage                                  │
│  ├── Quota monitoring                                  │
│  ├── Cost tracking                                     │
│  └── Rate limit status                                 │
│                                                         │
│  Browser DevTools                                       │
│  ├── Console errors                                    │
│  ├── Network requests                                  │
│  ├── Performance metrics                               │
│  └── Storage usage                                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

This architecture provides a solid foundation for the SIMETRA AI integration with room for future enhancements and scaling.
