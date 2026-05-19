# ContextGuard

<p align="center">
    <img src="public/screenshots/hackathon_winner.jpeg" alt="Hackathon Winner" width="60%" />
  </a>
  <br/>
  <em>🏆 <a href="https://hackomania.geekshacking.com/" target="_blank">HackOMania Winner</a> ahrefs— ContextGuard</em>
</p>


### AI-Powered Rumour Pre-Mortem Engine for Singapore

> **HackOMania Problem Statement:** How might we design AI-powered solutions that help local and multilingual communities in Singapore assess information credibility, understand context, and make informed decisions — especially during times of uncertainty?

<p align="center">
  <img src="public/screenshots/01-landing.png" alt="ContextGuard Landing Page" width="100%" />
</p>

---

## The Problem

Every existing solution — POFMA, CNA fact-checks, chatbots — is **reactive**. They correct misinformation *after* it has already spread.

> In February 2020, a rumour spread across WhatsApp that Sheng Siong had run out of rice. Within 6 hours, queues wrapped around every supermarket in Singapore. MOH issued a correction at 11pm — **8 hours too late**. 300,000 people had already panic-bought.

This pattern repeats every crisis: announcement → information vacuum → misinformation rushes in (in Mandarin, Malay, Tamil, via voice notes and dialects) → correction arrives too late → damage is done.

## Our Solution

ContextGuard is **proactive**. It predicts what misinformation will emerge *before* it spreads, and arms trusted community leaders with pre-written counter-narratives in all 4 official languages.

```mermaid
flowchart TD
    A["🖊️ Comms officer pastes announcement"] --> B["🔍 AI extracts topics, communities, triggers"]
    B --> C{"Predicted False Narratives"}
    C --> D["🔴 CRITICAL — Sheng Siong out of rice\n📱 Mandarin WhatsApp"]
    C --> E["🟠 HIGH — Government hiding case counts\n📱 English Twitter/Reddit"]
    C --> F["🟡 MEDIUM — Traditional remedies cure COVID\n📱 Mandarin Facebook"]
    D & E & F --> G["✅ One-click deploy to 800+ community leaders"]

    style D fill:#7f1d1d,stroke:#dc2626,color:#fca5a5
    style E fill:#7c2d12,stroke:#ea580c,color:#fed7aa
    style F fill:#713f12,stroke:#ca8a04,color:#fef08a
    style G fill:#14532d,stroke:#22c55e,color:#bbf7d0
```

<p align="center">
  <img src="public/screenshots/02-dashboard-input.png" alt="Dashboard Input" width="100%" />
</p>

---

## Why Singapore Misinformation Is Predictable

Singapore's misinformation follows patterns:
- The same **emotional triggers** (financial anxiety, racial tension, health fear)
- The same **language communities** targeted
- The same **gap** between official communication and public fear

We have a decade of POFMA notices, MOH corrections, and CNA fact-checks that prove this. The patterns are there — nobody has turned them into predictions. Until now.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16 (App Router) + React 19 | SSR, routing, API routes |
| **Styling** | Tailwind CSS 4 | Responsive dark-themed UI |
| **Language** | TypeScript 5 | End-to-end type safety |
| **LLM** | Google Gemini 2.5 Flash | Topic extraction, rumour prediction, counter-narrative generation |
| **Embeddings** | Gemini `embedding-001` | 768-dimensional text vectors for RAG |
| **Vector DB / RAG** | ClickHouse (MergeTree) | Hybrid topic + vector search over historical articles |
| **Web Scraping** | Firecrawl | Live source retrieval from POFMA, CNA, MOH |
| **Messaging** | Telegram Bot API | One-click counter-narrative deployment to community leaders |
| **PDF Support** | pdfjs-dist + react-pdf | Upload and parse PDF announcements |
| **Package Manager** | Bun | Fast dependency management |
| **Hosting** | Vercel | Serverless deployment |

