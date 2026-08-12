# 🏄 HH Goa 2026 — Frame / ID Card Generator
## System Design & Architecture Prompt Document
> **Version:** 1.0 | **Stack:** React + Vite · Clerk · FastAPI · NeonDB · Docker

---

## 🎯 PROJECT OVERVIEW

Build a **zero-friction, mobile-first web tool** where a user uploads a photo and instantly receives a branded **HH Goa 2026** graphic — either a PFP frame overlay (Format A) or a Builder ID Card (Format B) — ready to download and share on X (Twitter) with pre-filled caption + `#FrameInGoa`.

**Core UX principle:** No login wall. No signup. One pass, start to finish. Upload → Generate → Download → Share.

---

## 🗂️ TABLE OF CONTENTS

1. [Tech Stack](#tech-stack)
2. [System Architecture Overview](#system-architecture-overview)
3. [Data Flow Diagram](#data-flow-diagram)
4. [Frontend Architecture](#frontend-architecture)
5. [Backend Architecture](#backend-architecture)
6. [Database Schema](#database-schema)
7. [Authentication & Admin Access](#authentication--admin-access)
8. [Image Processing Pipeline](#image-processing-pipeline)
9. [Sharing & OG Image Flow](#sharing--og-image-flow)
10. [Admin Dashboard](#admin-dashboard)
11. [Animation & UI Design System](#animation--ui-design-system)
12. [Docker & Deployment](#docker--deployment)
13. [Page-by-Page Breakdown](#page-by-page-breakdown)
14. [User Onboarding Flow](#user-onboarding-flow)
15. [API Contracts](#api-contracts)
16. [Error Handling Strategy](#error-handling-strategy)
17. [Performance Targets](#performance-targets)

---

## 🛠️ TECH STACK

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + Vite 5 | Fast SPA, HMR dev experience |
| **Styling** | Tailwind CSS v3 + shadcn/ui | Utility-first, accessible components |
| **Animation** | Framer Motion | Page transitions, micro-interactions |
| **Canvas / Image** | Konva.js + react-konva | Client-side image compositing |
| **File Handling** | react-dropzone + browser-image-compression | Upload UX + HEIC support |
| **HEIC Conversion** | heic2any (client-side) | iPhone photo support |
| **Auth** | Clerk | Admin-only auth, webhooks |
| **Backend** | FastAPI (Python 3.12) | REST API, image gen endpoint |
| **Image Processing** | Pillow + io (Python) | Server-side compositing fallback |
| **Database** | NeonDB (PostgreSQL) | Serverless Postgres, analytics |
| **ORM** | SQLAlchemy + asyncpg | Async DB access |
| **OG Images** | Vercel OG / FastAPI endpoint | Dynamic share previews |
| **File Storage** | Cloudflare R2 (or Vercel Blob) | Generated image hosting for share links |
| **Containerization** | Docker + Docker Compose | Local dev + production deploy |
| **Hosting** | Vercel (frontend) + Railway/Render (backend) | Free-tier friendly for hackathon |
| **Charts (Admin)** | Recharts | Analytics dashboard |

---

## 🏗️ SYSTEM ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                         │
│                                                             │
│  ┌──────────┐   ┌──────────────┐   ┌───────────────────┐  │
│  │ Landing  │──▶│ Upload/Edit  │──▶│ Result + Download  │  │
│  │   Page   │   │    Page      │   │    + Share CTA     │  │
│  └──────────┘   └──────┬───────┘   └───────────────────┘  │
│                         │                                   │
└─────────────────────────┼───────────────────────────────────┘
                          │ HTTP POST (multipart/form-data)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    FASTAPI BACKEND                          │
│                                                             │
│  ┌────────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │  /api/generate │  │  /api/share  │  │  /api/admin/*  │ │
│  │  (image gen)   │  │  (OG image)  │  │  (analytics)   │ │
│  └───────┬────────┘  └──────┬───────┘  └───────┬────────┘ │
│          │                  │                   │          │
│  ┌───────▼──────────────────▼───────────────────▼────────┐ │
│  │              Image Processing (Pillow)                 │ │
│  └───────────────────────────┬────────────────────────────┘ │
└──────────────────────────────┼──────────────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
   ┌─────────────┐    ┌──────────────┐    ┌──────────────┐
   │   NeonDB    │    │  Cloudflare  │    │    Clerk     │
   │ (Postgres)  │    │   R2 / Blob  │    │    Auth      │
   │  Analytics  │    │  (Images)    │    │  (Admin UI)  │
   └─────────────┘    └──────────────┘    └──────────────┘
```

---

## 🔄 DATA FLOW DIAGRAM

### Public User Flow (No Auth Required)

```
[User] 
  │
  ├─▶ Visits / (Landing Page)
  │      │ Clicks "Create My Card"
  │      ▼
  ├─▶ /create (Upload Page)
  │      │ Selects Format A or B
  │      │ Uploads photo (JPG/PNG/HEIC)
  │      │   └─▶ Client: HEIC → JPG conversion (heic2any)
  │      │   └─▶ Client: Compress if > 5MB (browser-image-compression)
  │      │ [Format B only] Fills: Name, Stack/Role
  │      │ Clicks "Generate"
  │      │
  │      ├─▶ POST /api/generate
  │      │      Body: { image: File, format: "A"|"B", name?, role? }
  │      │      │
  │      │      ├─▶ Backend: Resize + smart-crop photo
  │      │      ├─▶ Backend: Composite with HH Goa frame/card template
  │      │      ├─▶ Backend: Upload result to R2 → get public URL
  │      │      ├─▶ Backend: INSERT generation record → NeonDB
  │      │      └─▶ Response: { image_url, share_id, download_url }
  │      │
  │      ▼
  ├─▶ /result?id={share_id} (Result Page)
  │      │ Shows preview of generated graphic
  │      │ Download button → triggers file download
  │      └─▶ Share to X button
  │               └─▶ Opens twitter.com/intent/tweet
  │                      text: "I'm going to HH Goa 2026! 🏄 #FrameInGoa"
  │                      url: https://hhgoa.app/share/{share_id}
  │                      (OG image at that URL = the generated graphic)
  ▼
[Done — graphic shared on X]
```

### Share Link OG Image Flow

```
[Twitter/X crawler visits] https://hhgoa.app/share/{share_id}
  │
  ├─▶ FastAPI: GET /share/{share_id}
  │      └─▶ Reads record from NeonDB (image_url)
  │      └─▶ Returns HTML page with OG meta tags:
  │             <meta property="og:image" content="{image_url}" />
  │             <meta property="og:title" content="I'm going to HH Goa 2026!" />
  │
  └─▶ Twitter renders the actual generated graphic as link preview ✅
```

---

## 🖥️ FRONTEND ARCHITECTURE

### Folder Structure

```
src/
├── main.jsx                  # Vite entry, ClerkProvider wrapper
├── App.jsx                   # Router (React Router v6)
├── routes/
│   ├── Landing.jsx           # / — Hero + CTA
│   ├── Create.jsx            # /create — Upload + form
│   ├── Result.jsx            # /result?id= — Preview + actions
│   ├── SharePage.jsx         # /share/:id — OG-optimized page
│   └── admin/
│       ├── AdminLayout.jsx   # Clerk-protected wrapper
│       ├── Dashboard.jsx     # /admin — Overview stats
│       └── Generations.jsx   # /admin/generations — Table view
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── UploadZone.jsx        # react-dropzone wrapper
│   ├── FormatSelector.jsx    # Format A / B toggle
│   ├── CardForm.jsx          # Name + role fields (Format B)
│   ├── CanvasPreview.jsx     # Live Konva.js preview
│   ├── ResultCard.jsx        # Final image + download + share
│   ├── ShareButton.jsx       # Twitter share intent builder
│   └── AdminChart.jsx        # Recharts wrappers
├── hooks/
│   ├── useGenerate.js        # API call + state machine
│   ├── useImageCompress.js   # Client-side compress + HEIC
│   └── useAdmin.js           # Admin data fetching
├── lib/
│   ├── api.js                # Axios instance + interceptors
│   ├── heicConverter.js      # heic2any wrapper
│   └── shareUtils.js         # Twitter intent URL builder
├── assets/
│   ├── frame-a.png           # HH Goa PFP frame overlay
│   ├── card-template.png     # Builder ID card template
│   └── fonts/                # Event branding fonts
└── styles/
    └── globals.css           # Tailwind base + custom CSS vars
```

### Routing

```jsx
// App.jsx
<Routes>
  <Route path="/"          element={<Landing />} />
  <Route path="/create"    element={<Create />} />
  <Route path="/result"    element={<Result />} />
  <Route path="/share/:id" element={<SharePage />} />
  <Route path="/admin"     element={
    <SignedIn><AdminLayout /></SignedIn>
  }>
    <Route index           element={<Dashboard />} />
    <Route path="generations" element={<Generations />} />
  </Route>
  <Route path="/admin/login" element={<SignIn />} />
</Routes>
```

### Client-Side Image Processing (Konva.js)

Used for **live preview** before sending to backend:

```
User uploads photo
  └─▶ heic2any (if HEIC) → raw blob
  └─▶ browser-image-compression → compressed blob
  └─▶ Load into Konva.js Stage
        ├─▶ KonvaImage (user photo, smart-fit/crop to card area)
        └─▶ KonvaImage (frame/card template overlay, always on top)
        └─▶ [Format B] KonvaText (name, role, generated title)
        └─▶ Canvas renders live preview instantly
  └─▶ On "Generate": export canvas → POST to backend
  └─▶ Backend returns high-res version (1080px) → shown in Result
```

---

## ⚙️ BACKEND ARCHITECTURE

### Folder Structure

```
backend/
├── main.py                   # FastAPI app, CORS, router mount
├── routers/
│   ├── generate.py           # POST /api/generate
│   ├── share.py              # GET /share/{share_id}
│   └── admin.py              # GET /api/admin/* (Clerk JWT protected)
├── services/
│   ├── image_processor.py    # Pillow compositing logic
│   ├── storage.py            # R2 / Blob upload
│   └── analytics.py          # DB write helpers
├── models/
│   └── generation.py         # SQLAlchemy model
├── schemas/
│   └── generation.py         # Pydantic schemas
├── db/
│   ├── database.py           # NeonDB async engine
│   └── migrations/           # Alembic migrations
├── templates/
│   └── share.html            # OG meta tag HTML template
├── assets/
│   ├── frame-a.png
│   ├── card-template.png
│   └── fonts/
├── .env
├── requirements.txt
└── Dockerfile
```

### Core Endpoint: POST /api/generate

```python
# routers/generate.py

@router.post("/generate")
async def generate_graphic(
    image: UploadFile = File(...),
    format: str = Form(...),        # "A" or "B"
    name: str = Form(None),
    role: str = Form(None),
    db: AsyncSession = Depends(get_db)
):
    # 1. Validate file type (jpg, png, heic)
    # 2. Read image bytes → Pillow Image
    # 3. Smart crop/resize to target dimensions
    # 4. Composite with template (frame or card)
    # 5. [Format B] Draw name, role, generated builder title
    # 6. Export as PNG bytes
    # 7. Upload to R2 → get public URL
    # 8. Generate share_id (nanoid)
    # 9. INSERT into generations table
    # 10. Return { image_url, share_id, download_url }
```

### Image Processing Logic (Pillow)

```python
# services/image_processor.py

def smart_crop_to_square(img: Image) -> Image:
    """Face-centered crop using aspect ratio heuristics"""
    w, h = img.size
    size = min(w, h)
    left = (w - size) // 2
    top = max(0, (h - size) // 3)  # bias toward top (faces)
    return img.crop((left, top, left + size, top + size))

def composite_frame_a(user_photo: Image) -> Image:
    """PFP overlay: user photo beneath, frame on top"""
    canvas = Image.new("RGBA", (1080, 1080))
    photo = smart_crop_to_square(user_photo).resize((1080, 1080))
    canvas.paste(photo, (0, 0))
    frame = Image.open("assets/frame-a.png").convert("RGBA")
    canvas.alpha_composite(frame)
    return canvas

def composite_card_b(user_photo: Image, name: str, role: str) -> Image:
    """Builder ID card with photo + text fields"""
    card = Image.open("assets/card-template.png").convert("RGBA")
    # Paste user photo into designated photo zone (defined by template)
    photo_zone = (60, 120, 420, 520)  # (x1, y1, x2, y2)
    photo = smart_crop_to_square(user_photo).resize(
        (photo_zone[2]-photo_zone[0], photo_zone[3]-photo_zone[1])
    )
    card.paste(photo, (photo_zone[0], photo_zone[1]))
    # Draw text
    draw = ImageDraw.Draw(card)
    draw.text((460, 180), name, font=name_font, fill="#FFFFFF")
    draw.text((460, 260), role, font=role_font, fill="#A3E635")
    builder_title = generate_builder_title(role)  # fun GPT-free logic
    draw.text((460, 330), builder_title, font=title_font, fill="#FCD34D")
    return card
```

---

## 🗄️ DATABASE SCHEMA

### NeonDB (PostgreSQL via SQLAlchemy)

```sql
-- generations table
CREATE TABLE generations (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_id      VARCHAR(12) UNIQUE NOT NULL,   -- nanoid for share URLs
    format        VARCHAR(1) NOT NULL,            -- 'A' or 'B'
    image_url     TEXT NOT NULL,                  -- R2 public URL
    download_url  TEXT NOT NULL,
    name          VARCHAR(100),                   -- Format B only
    role          VARCHAR(100),                   -- Format B only
    user_agent    TEXT,                           -- for device analytics
    ip_hash       VARCHAR(64),                    -- hashed, not raw IP
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    downloaded_at TIMESTAMPTZ,                    -- updated on download
    shared_at     TIMESTAMPTZ                     -- updated on X share click
);

-- indexes
CREATE INDEX idx_generations_created_at ON generations(created_at DESC);
CREATE INDEX idx_generations_format ON generations(format);
CREATE INDEX idx_generations_share_id ON generations(share_id);

-- admin_users table (Clerk user IDs allowed admin access)
CREATE TABLE admin_users (
    clerk_user_id VARCHAR(100) PRIMARY KEY,
    email         VARCHAR(255),
    added_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔐 AUTHENTICATION & ADMIN ACCESS

### Public Routes (No Auth)
- `/` — Landing page
- `/create` — Upload + generate
- `/result` — View + download + share
- `/share/:id` — OG image page for Twitter preview

### Admin Routes (Clerk Protected)
- `/admin` — Dashboard with analytics
- `/admin/generations` — Full table of all generations

### Clerk Setup

```jsx
// main.jsx
import { ClerkProvider } from '@clerk/clerk-react'

<ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
  <App />
</ClerkProvider>
```

```jsx
// routes/admin/AdminLayout.jsx
import { SignedIn, RedirectToSignIn, useAuth } from '@clerk/clerk-react'

export default function AdminLayout() {
  const { isSignedIn } = useAuth()
  if (!isSignedIn) return <RedirectToSignIn />
  return (
    <div className="admin-shell">
      <AdminSidebar />
      <Outlet />
    </div>
  )
}
```

### Backend: Clerk JWT Verification

```python
# routers/admin.py
from clerk_backend_api import Clerk

clerk = Clerk(bearer_auth=os.getenv("CLERK_SECRET_KEY"))

async def verify_admin(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    try:
        claims = clerk.verify_token(token)
        # Check if user is in admin_users table
        admin = await db.get(AdminUser, claims["sub"])
        if not admin:
            raise HTTPException(status_code=403, detail="Not an admin")
        return claims
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.get("/admin/stats")
async def get_stats(admin=Depends(verify_admin), db=Depends(get_db)):
    ...
```

---

## 🖼️ IMAGE PROCESSING PIPELINE

```
Input: multipart/form-data (image file, format, optional fields)
         │
         ▼
[Validation Layer]
  • Allowed types: image/jpeg, image/png, image/heic, image/webp
  • Max size: 20MB (HEIC from iPhone can be large)
  • Reject non-image MIME types
         │
         ▼
[Pre-processing]
  • Pillow: open → convert to RGBA
  • Auto-rotate based on EXIF orientation
  • Smart crop (top-biased for faces)
         │
         ├─── Format A ──▶ composite_frame_a() → 1080×1080 PNG
         │
         └─── Format B ──▶ composite_card_b() → 1080×1350 PNG
                                │
                                ▼
                    [Text Rendering]
                    • name (bold, white)
                    • role/stack (medium, lime green)
                    • builder_title (italic, amber)
                      generated by: role → fun lookup table
                      e.g. "Full Stack" → "Fullstack Sorcerer 🧙"
                           "AI/ML" → "Gradient Descender 📉"
         │
         ▼
[Upload to R2]
  • boto3 / cloudflare SDK → upload PNG bytes
  • Key: generations/{share_id}.png
  • Public CDN URL returned
         │
         ▼
[NeonDB Insert]
  • share_id, image_url, format, name, role, user_agent, ip_hash
         │
         ▼
Response: { share_id, image_url, download_url }
Total time target: < 3 seconds
```

---

## 🔗 SHARING & OG IMAGE FLOW

### Twitter Share Intent

```javascript
// lib/shareUtils.js
export function buildTwitterShareUrl(shareId) {
  const sharePageUrl = `https://hhgoa.app/share/${shareId}`
  const caption = encodeURIComponent(
    "Just got my HH Goa 2026 builder card! 🏄‍♂️ See you in Goa! #FrameInGoa #HackerHouse"
  )
  return `https://twitter.com/intent/tweet?text=${caption}&url=${encodeURIComponent(sharePageUrl)}`
}
```

### OG Meta Tags (FastAPI Template)

```html
<!-- templates/share.html -->
<!DOCTYPE html>
<html>
<head>
  <meta property="og:title" content="I'm going to HH Goa 2026! 🏄" />
  <meta property="og:description" content="Join the builders. #FrameInGoa" />
  <meta property="og:image" content="{{ image_url }}" />
  <meta property="og:image:width" content="1080" />
  <meta property="og:image:height" content="1080" />
  <meta property="og:url" content="https://hhgoa.app/share/{{ share_id }}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="{{ image_url }}" />
  <!-- Redirect humans to result page after 0s -->
  <meta http-equiv="refresh" content="0;url=/result?id={{ share_id }}" />
</head>
<body>Loading...</body>
</html>
```

```python
# routers/share.py
@router.get("/share/{share_id}", response_class=HTMLResponse)
async def share_page(share_id: str, db=Depends(get_db)):
    gen = await db.get(Generation, share_id)
    if not gen:
        raise HTTPException(404)
    return templates.TemplateResponse("share.html", {
        "request": request,
        "image_url": gen.image_url,
        "share_id": share_id
    })
```

---

## 📊 ADMIN DASHBOARD

### Route: /admin (Dashboard)

**Stats Cards (top row):**
- Total Generations (all time)
- Today's Generations
- Format A vs Format B split (%)
- Downloads / Shares conversion rate

**Charts (Recharts):**
- Line chart: Generations over time (last 7 days, hourly)
- Pie chart: Format A vs B split
- Bar chart: Downloads vs Shares per day
- Device breakdown: Mobile vs Desktop (from user_agent)

### Route: /admin/generations (Table)

Columns: `#` | `Format` | `Name` | `Role` | `Preview` | `Created At` | `Downloaded` | `Shared`

Features:
- Pagination (50/page)
- Filter by format A/B
- Sort by created_at
- Click preview thumbnail → opens full image
- CSV export button

### Admin API Endpoints

```
GET /api/admin/stats          → aggregate counts
GET /api/admin/generations    → paginated list
GET /api/admin/timeseries     → hourly counts for charts
GET /api/admin/export/csv     → CSV download
```

---

## 🎨 ANIMATION & UI DESIGN SYSTEM

### Color Palette (HH Goa Branding)

```css
:root {
  --hh-ocean:   #0EA5E9;   /* Primary blue */
  --hh-sand:    #FCD34D;   /* Warm yellow */
  --hh-palm:    #22C55E;   /* Green accent */
  --hh-coral:   #F97316;   /* CTA orange */
  --hh-dark:    #0F172A;   /* Background */
  --hh-surface: #1E293B;   /* Cards */
  --hh-text:    #F1F5F9;   /* Primary text */
}
```

### Typography

```css
/* Headings */
font-family: 'Space Grotesk', sans-serif;
/* Body */
font-family: 'Inter', sans-serif;
/* Code / Monospace labels */
font-family: 'JetBrains Mono', monospace;
```

### Framer Motion Animations

| Trigger | Animation | Duration |
|---|---|---|
| Page load | Fade + slide up (Y: 20px → 0) | 400ms ease-out |
| Format selector toggle | Spring scale (0.95 → 1.0) | 200ms |
| Upload zone hover | Border pulse + icon bounce | 300ms |
| File accepted | Green flash + checkmark pop | 250ms |
| "Generate" click | Button scale down → loading spinner | 150ms |
| Result reveal | Card slides up + image fade-in | 500ms |
| Download button | Tap: scale 0.95, release: 1.0 | 100ms |
| Share button | Confetti burst (canvas-confetti) | 600ms |

```jsx
// components/ResultCard.jsx
const cardVariants = {
  hidden:  { opacity: 0, y: 40, scale: 0.96 },
  visible: { opacity: 1, y: 0,  scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
}

<motion.div variants={cardVariants} initial="hidden" animate="visible">
  <ResultCard />
</motion.div>
```

### Mobile-First Breakpoints

```
Base (mobile):   max-width 100%, single column
sm (640px):      two-column format selector
lg (1024px):     side-by-side preview + form (Format B)
```

### Upload Zone UX States

```
idle      → dashed border, upload icon, "Drop your photo here"
dragover  → solid border (--hh-ocean), blue background tint, scale 1.02
processing → spinner, "Converting..." (HEIC) or "Compressing..."
ready     → green border, thumbnail preview, filename shown
error     → red border, error message, retry button
```

---

## 🐳 DOCKER & DEPLOYMENT

### docker-compose.yml (Local Dev)

```yaml
version: '3.9'
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports: ["5173:5173"]
    volumes: ["./frontend:/app"]
    environment:
      - VITE_API_URL=http://localhost:8000
      - VITE_CLERK_PUBLISHABLE_KEY=${CLERK_PUBLISHABLE_KEY}

  backend:
    build:
      context: ./backend
    ports: ["8000:8000"]
    volumes: ["./backend:/app"]
    environment:
      - DATABASE_URL=${NEON_DATABASE_URL}
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
      - R2_BUCKET=${R2_BUCKET}
      - R2_ACCESS_KEY=${R2_ACCESS_KEY}
      - R2_SECRET_KEY=${R2_SECRET_KEY}
      - R2_PUBLIC_URL=${R2_PUBLIC_URL}
    depends_on: []   # NeonDB is external (cloud)
```

### Backend Dockerfile

```dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install fonts for Pillow text rendering
RUN apt-get update && apt-get install -y fonts-liberation && rm -rf /var/lib/apt/lists/*

COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### requirements.txt

```
fastapi==0.111.0
uvicorn[standard]==0.29.0
python-multipart==0.0.9
Pillow==10.3.0
sqlalchemy[asyncio]==2.0.30
asyncpg==0.29.0
alembic==1.13.1
boto3==1.34.0          # Cloudflare R2 via S3-compat API
python-dotenv==1.0.0
nanoid==2.0.0
clerk-backend-api==1.2.0
jinja2==3.1.3
```

### Production Deployment

| Service | Host | Notes |
|---|---|---|
| Frontend | Vercel | Auto-deploys from GitHub main |
| Backend | Railway or Render | Docker container, free tier |
| Database | NeonDB | Serverless Postgres, free tier |
| Images | Cloudflare R2 | 10GB free, fast CDN |
| Auth | Clerk | Free for < 10k MAU |

---

## 📄 PAGE-BY-PAGE BREAKDOWN

### 1. Landing Page `/`

**Goal:** Convert visitor → click "Create My Card"

**Sections:**
- Hero: Event name, tagline, animated wave graphic (Framer)
- CTA button: "Create My HH Goa Card →" (coral, full-width on mobile)
- Format preview: Split showing Format A (PFP) and Format B (ID card) side by side
- Social proof: "X people have already generated their cards" (live counter from /api/stats)
- Footer: #FrameInGoa hashtag, minimal links

**Animation:**
- Staggered fade-in of hero elements (title → subtitle → CTA → previews)
- Floating wave animation in background (pure CSS keyframes)
- Live counter: number ticks up with requestAnimationFrame

### 2. Create Page `/create`

**Goal:** Collect photo + optional fields → trigger generation

**Layout (mobile-first, single column):**
1. Format selector: two cards, tap to select (A = PFP Frame, B = Builder Card)
2. Upload zone: dropzone + file picker, shows live Konva preview
3. [Format B only] Name field + Role/Stack field (appear with slide-down animation)
4. "Generate My Card" button (disabled until photo uploaded)
5. Live preview canvas updates as user uploads or types

**Validation:**
- Photo: required, max 20MB, types: jpg/png/heic/webp
- Name: required for Format B, max 40 chars
- Role: required for Format B, max 50 chars (placeholder: "Full Stack · React · Python")

**State machine:**
```
idle → uploading → processing (HEIC/compress) → ready → generating → done
```

### 3. Result Page `/result?id={share_id}`

**Goal:** Show the beautiful result, drive download + share

**Layout:**
- Full result image (centered, max 540px wide on desktop)
- "Download PNG" button → triggers file download
- "Share to X" button → opens Twitter intent (new tab)
- Confetti animation on share button click
- "Make another" link → back to /create

**Download implementation:**
```javascript
const handleDownload = async () => {
  const blob = await fetch(imageUrl).then(r => r.blob())
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `hh-goa-2026-${format === 'A' ? 'pfp' : 'card'}.png`
  a.click()
  // Update downloaded_at in DB
  await api.post(`/api/track/${shareId}/download`)
}
```

### 4. Share Page `/share/:id`

**Goal:** Twitter/X OG preview page — bots see this, humans get redirected

- Served by FastAPI as HTML
- Contains all OG + Twitter card meta tags
- Instant meta-refresh redirect to /result?id={share_id} for humans
- No visible content needed

### 5. Admin Dashboard `/admin`

**Goal:** Organizers see real-time engagement stats

- Clerk sign-in gate
- Stats cards row (total, today, format split, conversion)
- Charts: time series + format pie + device breakdown
- Recent generations table (last 10, with thumbnail)
- Link to /admin/generations for full table

---

## 👤 USER ONBOARDING FLOW

```
1. User hears about tool via X/social → clicks shared card link
        ↓
2. OG preview shows actual generated graphic → curiosity piqued
        ↓
3. "Make yours" CTA on /share/:id page → lands on /
        ↓
4. Landing page: immediately clear what the tool does
        ↓
5. Clicks "Create My Card" → /create
        ↓
6. Sees format options → selects one (default: Format B for more sharing value)
        ↓
7. Uploads photo: HEIC auto-converted client-side, compression if needed
        ↓
8. [Format B] Types name + stack in 2 fields
        ↓
9. Clicks "Generate" → spinner → result appears in ~2s
        ↓
10. Downloads PNG (saves to camera roll on mobile)
        ↓
11. Clicks "Share to X" → pre-filled tweet opens
        ↓
12. Tweets with image + #FrameInGoa → done
```

**Key UX principles:**
- Zero friction: No auth wall, no email required
- Mobile-first: Every tap target ≥ 44px, no hover-only interactions
- Speed: Upload → result < 3 seconds
- Delight: Confetti on share, smooth animations throughout

---

## 📡 API CONTRACTS

### POST /api/generate

```
Request:
  Content-Type: multipart/form-data
  Body:
    image   File     required  JPEG/PNG/HEIC/WEBP, max 20MB
    format  string   required  "A" | "B"
    name    string   optional  Required if format="B"
    role    string   optional  Required if format="B"

Response 200:
{
  "share_id":    "abc123xyz",
  "image_url":   "https://cdn.hhgoa.app/generations/abc123xyz.png",
  "download_url": "https://cdn.hhgoa.app/generations/abc123xyz.png"
}

Response 422: Validation error
Response 500: Processing error
```

### GET /api/stats (public)

```
Response 200:
{
  "total_generations": 1247,
  "today":             89,
  "format_a_pct":      32,
  "format_b_pct":      68
}
```

### POST /api/track/:share_id/download (public)

```
Response 200: { "ok": true }
```

### POST /api/track/:share_id/share (public)

```
Response 200: { "ok": true }
```

### GET /api/admin/stats (admin)

```
Headers: Authorization: Bearer <clerk_jwt>

Response 200:
{
  "total":         1247,
  "today":         89,
  "downloads":     634,
  "shares":        312,
  "format_a":      402,
  "format_b":      845,
  "mobile_pct":    78
}
```

### GET /api/admin/timeseries (admin)

```
Query: ?days=7&granularity=hour

Response 200:
{
  "data": [
    { "ts": "2026-06-01T10:00:00Z", "count": 12 },
    ...
  ]
}
```

---

## ⚠️ ERROR HANDLING STRATEGY

| Error | Frontend | Backend |
|---|---|---|
| File too large (>20MB) | Client-side check before upload, show size error | 413 response |
| Unsupported file type | Client-side MIME check, show type error | 422 response |
| HEIC conversion fail | Show "try saving as JPG" message | N/A (client-side) |
| Generation timeout | Show "try again" toast after 10s | 504 with retry hint |
| R2 upload fail | Show generic error, retry button | 500, log to stderr |
| Share ID not found | "Card not found" page with link to /create | 404 |
| Admin auth fail | Redirect to /admin/login | 401 |

---

## ⚡ PERFORMANCE TARGETS

| Metric | Target | How |
|---|---|---|
| Upload → result | < 3s | Client compress + fast Pillow pipeline |
| Lighthouse mobile | ≥ 90 | Vite code-split, lazy routes, image opt |
| Time to interactive | < 2s | SSR or pre-rendered landing page |
| Image output size | 1080px PNG, < 800KB | Pillow optimize=True, max quality 85 |
| R2 CDN latency | < 200ms global | Cloudflare edge cache |
| NeonDB query time | < 50ms | Indexed share_id lookup |

---

## 🚀 LAUNCH CHECKLIST

- [ ] Frame/card template assets finalized (1080px, branded)
- [ ] HEIC → JPG client-side conversion tested on iPhone
- [ ] OG tags validated with Twitter Card Validator
- [ ] Share URL OG image renders correctly (not blank)
- [ ] Download works on iOS Safari (blob URL method)
- [ ] Admin Clerk sign-in working with org email
- [ ] NeonDB connection pooling configured (max_connections)
- [ ] R2 bucket CORS policy allows frontend origin
- [ ] docker-compose up works locally, end-to-end
- [ ] Rate limiting on /api/generate (10 req/min per IP)
- [ ] Error boundaries on all React routes

---

## 🏁 BUILDER TITLE GENERATOR

Fun role → title mapping (no AI needed, deterministic):

```python
TITLE_MAP = {
    "frontend":      "Pixel Whisperer 🎨",
    "backend":       "Backend Barbarian ⚔️",
    "full stack":    "Fullstack Sorcerer 🧙",
    "ai":            "Gradient Descender 📉",
    "ml":            "Gradient Descender 📉",
    "devops":        "Cloud Shepherd ☁️",
    "ios":           "Swift Samurai 🗡️",
    "android":       "Kotlin Conjurer 🔮",
    "design":        "UX Visionary ✨",
    "product":       "Roadmap Oracle 🗺️",
    "data":          "Data Druid 🌲",
    "security":      "Bug Slayer 🐛",
    "blockchain":    "Chain Maximalist ⛓️",
    "founder":       "Ship or Die Captain 🚢",
}

def generate_builder_title(role: str) -> str:
    role_lower = role.lower()
    for key, title in TITLE_MAP.items():
        if key in role_lower:
            return title
    return "Builder Extraordinaire 🚀"
```

---

*Built for HH Goa 2026 — Go ship it. 🏄*