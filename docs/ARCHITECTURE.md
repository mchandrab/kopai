+-----------------------------------------------------------------+
|                        Client (React + Vite)                    |
|                Hosted & Secured via Tencent EdgeOne             |
+--------------------------------+--------------------------------+
                                 |
           +---------------------+---------------------+
           | (HTTPS / REST API)                        | (AI Prompts / RAG)
           v                                           v
+-----------------------+                   +---------------------+
|   Supabase Backend    |                   | Google Gemini API   |
|  - PostgreSQL DB      |                   |  (Free Tier LLM)    |
|  - Supabase Auth      |                   +---------------------+
+-----------------------+