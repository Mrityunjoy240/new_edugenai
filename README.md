# 🎓 EduGen AI - Personalized Learning ecosystem

EduGen AI is a cutting-edge educational platform that leverages Artificial Intelligence to provide personalized learning experiences, career roadmaps, and community support.

---

## 🚀 Key Features

### 🏢 AI Community Q&A (Teacher Support)
- **Collaborative Doubts**: Students can post doubts, upvote questions, and engage in academic discussions.
- **Teacher Verification**: Official responses from teachers/admins are highlighted for reliability.
- **Real-time Interaction**: Track "Open" vs. "Answered" questions with live upvote counters.

### 🛣️ Personalized Career Roadmap
- **Readiness Scoring**: A dynamic score based on your profile completion, course progress, skills, and consistency.
- **Milestone Tracking**: Visual roadmap with clear steps (e.g., Programming, DSA, System Design) for various career paths.
- **Skill-Gap Analysis**: AI identifies what you need to learn next to reach your target role.

### 📝 Intelligent Notebooks
- **AI Workspace**: Generate notes, flashcards, and quizzes from your study materials.
- **CRUD Operations**: Seamlessly create, organize, and delete private notebooks with an interactive modal-based UI.
- **Resource Integration**: Direct links between lessons and your personalized study tools.

### 🧠 Advanced RAG Chat & AI Tools
- **PDF-to-Knowledge**: Upload PDFs to create instant knowledge bases.
- **AI Flashcards & Quizzes**: Automatically generated learning aids based on your notes.
- **OpenRouter Engine**: Powered by state-of-the-art models via OpenRouter (Gemini, Llama 3, etc.).

---

## 🛠️ Prerequisites

1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **Supabase Account** - [Sign up free](https://supabase.com)
3. **OpenRouter API Key** - [Get key here](https://openrouter.ai/)

---

## ⚙️ Step 1: Supabase Setup

### 1.1 Create project
Go to [supabase.com](https://supabase.com) and create a new project named `edugen-ai`.

### 1.2 Enable pgvector
In **SQL Editor**, run:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 1.3 Run Migrations
Run these scripts in order from the `supabase/migrations/` folder:
1. `001_initial_schema.sql`
2. `002_complete_schema.sql` (if present)
3. `[TIMESTAMP]_add_community_qa_tables.sql` (for Q&A & progress)

### 1.4 Seed Data
Populate your database with career paths and initial content:
- `supabase/seed/002_careers.sql`
- `supabase/seed/003_ncert_physics.sql` (Optional)

---

## 📁 Step 2: Project Setup

### 2.1 Install Dependencies
```bash
npm install
```

### 2.2 Configure Environment
Create a `.env.local` file in the root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Providers
OPENROUTER_API_KEY=your-openrouter-key
GEMINI_API_KEY=your-gemini-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🧪 Step 3: Test the Application

### 🏗️ Run Development Server
```bash
npm run dev
```

### 👤 Test Accounts
| Email | Password | Role |
|-------|----------|------|
| student@test.com | 123 | Student |
| teacher@test.com | 123 | Teacher (requires manual role change in DB) |

### 🔍 Recommended Test Flow
1. **Dashboard**: Check the "Recommended for You" section.
2. **Notebooks**: Create a new notebook using the "+" button.
3. **Teacher Support**: Post a doubt in the "Community Q&A" tab.
4. **Career**: View your "Readiness Score" and milestones.

---

## 🏗️ Project Structure

```
edugen-ai/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Auth flows (Login/Register)
│   │   ├── (dashboard)/     # Dashboard, Teacher Support, Career, Notebooks
│   │   └── api/             # AI, Posts, Notebooks, Progress API routes
│   ├── components/          # Shared components (UI, Teacher, Career)
│   └── lib/                 # Supabase client, utils
├── supabase/
│   ├── migrations/          # SQL table schemas
│   └── seed/                # Initial content
└── README.md
```

---

## 💻 Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend  | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| UI        | Shadcn UI, Lucide Icons |
| Database  | Supabase (PostgreSQL + pgvector) |
| AI        | OpenRouter (Gemini, Llama 3) |
| Auth      | Supabase Auth |

---

## 📜 License
MIT - Developed for the EduGen AI Hackathon.
