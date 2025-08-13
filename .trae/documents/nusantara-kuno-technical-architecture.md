# Technical Architecture Document - Nusantara Kuno

## 1. Architecture Design

```mermaid
graph TD
    A[User Browser] --> B[React Frontend Application]
    B --> C[Supabase SDK]
    C --> D[Supabase Service]
    B --> E[Video Streaming CDN]
    B --> F[Payment Gateway]
    B --> G[Live Streaming Service]
    
    subgraph "Frontend Layer"
        B
    end
    
    subgraph "Backend Services"
        D[Supabase Database & Auth]
        E[Video CDN - Cloudflare/AWS]
        F[Payment - Midtrans/Xendit]
        G[Live Stream - Agora/Zoom SDK]
    end
    
    subgraph "Content Management"
        H[Admin Dashboard]
        I[Content Moderation]
        J[Recipe Verification]
    end
    
    D --> H
    D --> I
    D --> J
```

## 2. Technology Description

* **Frontend**: React\@18 + TypeScript + Tailwind CSS + Vite

* **Backend**: Supabase (Database, Authentication, Storage)

* **Video Streaming**: Cloudflare Stream atau AWS CloudFront

* **Payment**: Midtrans (Indonesia-focused payment gateway)

* **Live Streaming**: Agora.io SDK untuk kelas virtual

* **Maps**: Leaflet.js dengan custom Indonesia map tiles

* **State Management**: Zustand untuk state management ringan

* **UI Components**: Headless UI + Custom components

## 3. Route Definitions

| Route                | Purpose                                                |
| -------------------- | ------------------------------------------------------ |
| /                    | Beranda dengan hero section dan peta kuliner Indonesia |
| /resep               | Katalog resep dengan filter wilayah dan kategori       |
| /resep/:id           | Detail resep dengan video dokumenter dan cerita budaya |
| /glosarium           | Direktori bumbu dan teknik memasak tradisional         |
| /glosarium/:type/:id | Detail bumbu atau teknik spesifik                      |
| /juru-masak          | Daftar profil maestro kuliner dan sejarawan            |
| /juru-masak/:id      | Profil detail juru masak dan koleksi resepnya          |
| /kelas-virtual       | Jadwal dan daftar kelas memasak virtual                |
| /kelas-virtual/:id   | Room kelas virtual dengan live streaming               |
| /marketplace         | E-commerce bumbu dan bahan otentik                     |
| /marketplace/cart    | Keranjang belanja dan checkout                         |
| /profil              | Dashboard pengguna dengan progress dan achievement     |
| /langganan           | Halaman upgrade ke premium "Pusaka Rasa"               |
| /auth/login          | Halaman login dan registrasi                           |
| /admin               | Dashboard admin untuk content management               |

## 4. API Definitions

### 4.1 Core API

**Authentication (Supabase Auth)**

```
POST /auth/v1/signup
POST /auth/v1/token
POST /auth/v1/logout
```

**Recipe Management**

```
GET /rest/v1/recipes
```

Request Parameters:

| Param Name  | Param Type | isRequired | Description                                                 |
| ----------- | ---------- | ---------- | ----------------------------------------------------------- |
| region      | string     | false      | Filter berdasarkan wilayah (jawa, sumatra, kalimantan, etc) |
| category    | string     | false      | Kategori masakan (lauk, sayur, kue, minuman)                |
| difficulty  | string     | false      | Tingkat kesulitan (mudah, sedang, sulit)                    |
| is\_premium | boolean    | false      | Filter resep premium                                        |
| limit       | number     | false      | Jumlah resep per halaman (default: 20)                      |
| offset      | number     | false      | Offset untuk pagination                                     |

Response:

| Param Name | Param Type | Description                         |
| ---------- | ---------- | ----------------------------------- |
| data       | array      | Array resep dengan metadata lengkap |
| count      | number     | Total jumlah resep                  |
| has\_more  | boolean    | Indikator ada data selanjutnya      |

**Recipe Detail**

```
GET /rest/v1/recipes/:id
```

Response includes: ingredients, steps, cultural\_story, video\_url, chef\_profile, difficulty\_level, cooking\_time

**Glossary API**

```
GET /rest/v1/glossary
```

Request Parameters:

| Param Name | Param Type | isRequired | Description                         |
| ---------- | ---------- | ---------- | ----------------------------------- |
| type       | string     | false      | Type: 'ingredient' atau 'technique' |
| search     | string     | false      | Search term untuk nama bumbu/teknik |

**User Progress Tracking**

```
POST /rest/v1/user_progress
```

Request:

| Param Name | Param Type | isRequired | Description                                    |
| ---------- | ---------- | ---------- | ---------------------------------------------- |
| recipe\_id | uuid       | true       | ID resep yang dicoba                           |
| status     | string     | true       | Status: 'bookmarked', 'attempted', 'completed' |
| rating     | number     | false      | Rating 1-5 untuk resep                         |

**Virtual Class API**

```
GET /rest/v1/virtual_classes
POST /rest/v1/virtual_classes/:id/join
```

**Marketplace API**

```
GET /rest/v1/products
POST /rest/v1/orders
GET /rest/v1/orders/:id/status
```

## 5. Server Architecture Diagram

```mermaid
graph TD
    A[Client Request] --> B[React Router]
    B --> C[Component Layer]
    C --> D[Custom Hooks]
    D --> E[Supabase Client]
    E --> F[Database Operations]
    
    G[Admin Panel] --> H[Content Management]
    H --> I[Recipe Verification]
    I --> F
    
    J[Payment Flow] --> K[Midtrans Integration]
    K --> L[Order Processing]
    L --> F
    
    M[Live Streaming] --> N[Agora SDK]
    N --> O[Real-time Communication]
    
    subgraph "Frontend Architecture"
        B
        C
        D
    end
    
    subgraph "Data Layer"
        E
        F
    end
    
    subgraph "External Services"
        K
        N
    end
```

## 6. Data Model

### 6.1 Data Model Definition

```mermaid
erDiagram
    USERS ||--o{ USER_PROGRESS : tracks
    USERS ||--o{ ORDERS : places
    USERS ||--o{ VIRTUAL_CLASS_ENROLLMENTS : enrolls
    
    RECIPES ||--o{ USER_PROGRESS : has
    RECIPES }|--|| CHEFS : created_by
    RECIPES }|--|| REGIONS : belongs_to
    RECIPES ||--o{ RECIPE_INGREDIENTS : contains
    
    CHEFS ||--o{ VIRTUAL_CLASSES : teaches
    CHEFS ||--o{ RECIPES : creates
    
    GLOSSARY_ITEMS ||--o{ RECIPE_INGREDIENTS : used_in
    
    PRODUCTS ||--o{ ORDER_ITEMS : included_in
    ORDERS ||--o{ ORDER_ITEMS : contains
    
    VIRTUAL_CLASSES ||--o{ VIRTUAL_CLASS_ENROLLMENTS : has
    
    USERS {
        uuid id PK
        string email
        string full_name
        string subscription_type
        timestamp created_at
        timestamp updated_at
        jsonb preferences
    }
    
    RECIPES {
        uuid id PK
        string title
        text description
        string region
        string category
        string difficulty_level
        integer cooking_time_minutes
        boolean is_premium
        text cultural_story
        string video_url
        uuid chef_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    CHEFS {
        uuid id PK
        string name
        text biography
        string specialization
        string region
        string profile_image_url
        timestamp created_at
    }
    
    REGIONS {
        uuid id PK
        string name
        string code
        text description
        jsonb coordinates
    }
    
    GLOSSARY_ITEMS {
        uuid id PK
        string name
        string type
        text description
        string image_url
        jsonb regional_names
        timestamp created_at
    }
    
    USER_PROGRESS {
        uuid id PK
        uuid user_id FK
        uuid recipe_id FK
        string status
        integer rating
        timestamp created_at
    }
    
    VIRTUAL_CLASSES {
        uuid id PK
        string title
        text description
        uuid chef_id FK
        timestamp scheduled_at
        integer max_participants
        decimal price
        string meeting_url
        timestamp created_at
    }
    
    PRODUCTS {
        uuid id PK
        string name
        text description
        decimal price
        string category
        string origin_region
        string image_url
        integer stock_quantity
        timestamp created_at
    }
    
    ORDERS {
        uuid id PK
        uuid user_id FK
        decimal total_amount
        string status
        string payment_method
        timestamp created_at
        timestamp updated_at
    }
```

### 6.2 Data Definition Language

**Users Table**

```sql
-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    subscription_type VARCHAR(20) DEFAULT 'free' CHECK (subscription_type IN ('free', 'premium')),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Grant permissions
GRANT SELECT ON public.users TO anon;
GRANT ALL PRIVILEGES ON public.users TO authenticated;
```

**Regions Table**

```sql
CREATE TABLE public.regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT,
    coordinates JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial data
INSERT INTO public.regions (name, code, description) VALUES
('Jawa', 'JW', 'Pulau Jawa dengan kekayaan kuliner seperti Gudeg, Rawon, dan Gado-gado'),
('Sumatra', 'SM', 'Sumatra dengan masakan pedas khas seperti Rendang dan Gulai'),
('Kalimantan', 'KL', 'Kalimantan dengan kuliner unik seperti Soto Banjar dan Amplang'),
('Sulawesi', 'SL', 'Sulawesi dengan cita rasa khas seperti Coto Makassar dan Tinutuan'),
('Papua', 'PP', 'Papua dengan kuliner tradisional seperti Papeda dan Ikan Bakar'),
('Nusa Tenggara', 'NT', 'Nusa Tenggara dengan masakan khas seperti Ayam Taliwang dan Se''i');

GRANT SELECT ON public.regions TO anon;
GRANT ALL PRIVILEGES ON public.regions TO authenticated;
```

**Chefs Table**

```sql
CREATE TABLE public.chefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    biography TEXT,
    specialization VARCHAR(100),
    region VARCHAR(50),
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sample data
INSERT INTO public.chefs (name, biography, specialization, region) VALUES
('Mbah Lindu', 'Maestro kuliner Jawa dengan pengalaman 40 tahun dalam masakan tradisional', 'Masakan Jawa Tradisional', 'Yogyakarta'),
('Nek Rohaya', 'Ahli kuliner Sumatra yang melestarikan resep-resep kuno keluarga', 'Masakan Padang Otentik', 'Padang'),
('Pak Usman', 'Juru masak Banjar yang menguasai teknik memasak tradisional Kalimantan', 'Kuliner Banjar', 'Banjarmasin');

GRANT SELECT ON public.chefs TO anon;
GRANT ALL PRIVILEGES ON public.chefs TO authenticated;
```

**Recipes Table**

```sql
CREATE TABLE public.recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    region VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('lauk', 'sayur', 'kue', 'minuman', 'sambal')),
    difficulty_level VARCHAR(20) DEFAULT 'sedang' CHECK (difficulty_level IN ('mudah', 'sedang', 'sulit')),
    cooking_time_minutes INTEGER,
    is_premium BOOLEAN DEFAULT false,
    cultural_story TEXT,
    video_url TEXT,
    chef_id UUID REFERENCES public.chefs(id),
    ingredients JSONB DEFAULT '[]',
    cooking_steps JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_recipes_region ON public.recipes(region);
CREATE INDEX idx_recipes_category ON public.recipes(category);
CREATE INDEX idx_recipes_premium ON public.recipes(is_premium);
CREATE INDEX idx_recipes_chef ON public.recipes(chef_id);

-- Sample data
INSERT INTO public.recipes (title, description, region, category, difficulty_level, cooking_time_minutes, cultural_story, chef_id) VALUES
('Gudeg Yogya Asli', 'Gudeg tradisional Yogyakarta dengan cita rasa manis khas keraton', 'Yogyakarta', 'lauk', 'sulit', 180, 'Gudeg merupakan makanan khas Yogyakarta yang konon berasal dari zaman Kerajaan Mataram...', (SELECT id FROM public.chefs WHERE name = 'Mbah Lindu')),
('Rendang Daging Sapi', 'Rendang otentik Minangkabau dengan bumbu rempah lengkap', 'Sumatra Barat', 'lauk', 'sulit', 240, 'Rendang adalah masakan tradisional Minangkabau yang telah diakui UNESCO...', (SELECT id FROM public.chefs WHERE name = 'Nek Rohaya'));

GRANT SELECT ON public.recipes TO anon;
GRANT ALL PRIVILEGES ON public.recipes TO authenticated;
```

**Glossary Items Table**

```sql
CREATE TABLE public.glossary_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('ingredient', 'technique')),
    description TEXT,
    image_url TEXT,
    regional_names JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sample data
INSERT INTO public.glossary_items (name, type, description, regional_names) VALUES
('Kluwek', 'ingredient', 'Buah kluwek atau keluak adalah biji dari buah pohon kepayang yang digunakan sebagai bumbu masakan', '{"jawa": "kluwek", "betawi": "keluak"}'),
('Andaliman', 'ingredient', 'Rempah khas Batak yang memberikan sensasi kesemutan di lidah', '{"batak": "andaliman", "indonesia": "merica batak"}'),
('Tumis', 'technique', 'Teknik memasak dengan menggunakan sedikit minyak dan api besar', '{}');

GRANT SELECT ON public.glossary_items TO anon;
GRANT ALL PRIVILEGES ON public.glossary_items TO authenticated;
```

**User Progress Table**

```sql
CREATE TABLE public.user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('bookmarked', 'attempted', 'completed')),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, recipe_id)
);

-- Create indexes
CREATE INDEX idx_user_progress_user ON public.user_progress(user_id);
CREATE INDEX idx_user_progress_recipe ON public.user_progress(recipe_id);

-- Enable RLS
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own progress" ON public.user_progress
    FOR ALL USING (auth.uid() = user_id);

GRANT ALL PRIVILEGES ON public.user_progress TO authenticated;
```

