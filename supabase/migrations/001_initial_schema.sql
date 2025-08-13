-- Nusantara Kuno Database Schema
-- Initial migration for MVP

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Recipes table
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  region VARCHAR(50) NOT NULL CHECK (region IN ('jawa', 'sumatra', 'sulawesi', 'kalimantan', 'other')),
  difficulty VARCHAR(20) DEFAULT 'sedang' CHECK (difficulty IN ('mudah', 'sedang', 'sulit')),
  cooking_time INTEGER, -- minutes
  image_url TEXT,
  ingredients JSONB DEFAULT '[]'::jsonb,
  steps JSONB DEFAULT '[]'::jsonb,
  cultural_story TEXT,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles (extends auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(100),
  subscription_type VARCHAR(20) DEFAULT 'free' CHECK (subscription_type IN ('free', 'premium')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User bookmarks
CREATE TABLE user_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- User progress
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'attempted' CHECK (status IN ('bookmarked', 'attempted', 'completed')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- Enable Row Level Security
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can manage their own bookmarks
CREATE POLICY "Users can manage own bookmarks" ON user_bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- Users can manage their own progress
CREATE POLICY "Users can manage own progress" ON user_progress
  FOR ALL USING (auth.uid() = user_id);

-- Users can manage their own profile
CREATE POLICY "Users can manage own profile" ON user_profiles
  FOR ALL USING (auth.uid() = id);

-- Public read access for recipes
CREATE POLICY "Anyone can read recipes" ON recipes
  FOR SELECT USING (true);

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON recipes TO anon;
GRANT ALL PRIVILEGES ON user_bookmarks TO authenticated;
GRANT ALL PRIVILEGES ON user_progress TO authenticated;
GRANT ALL PRIVILEGES ON user_profiles TO authenticated;

-- Insert sample Indonesian recipes
INSERT INTO recipes (title, region, difficulty, cooking_time, cultural_story, ingredients, steps, image_url, is_premium) VALUES
('Gudeg Yogya', 'jawa', 'sulit', 180, 'Gudeg adalah makanan khas Yogyakarta yang memiliki cita rasa manis dan gurih. Makanan ini terbuat dari nangka muda yang dimasak dengan santan dan gula merah. Gudeg telah menjadi ikon kuliner Yogyakarta selama berabad-abad dan mencerminkan filosofi hidup masyarakat Jawa yang sabar dan tekun.', 
 '["Nangka muda 1 kg", "Santan kental 500ml", "Gula merah 200g", "Daun salam 5 lembar", "Lengkuas 2 ruas", "Bawang putih 6 siung", "Bawang merah 8 butir", "Kemiri 4 butir", "Ketumbar 1 sdt", "Garam secukupnya"]',
 '["Potong nangka muda menjadi bagian kecil, cuci bersih", "Haluskan bumbu: bawang putih, bawang merah, kemiri, ketumbar", "Tumis bumbu halus hingga harum", "Masukkan nangka muda, aduk rata", "Tambahkan santan, daun salam, lengkuas", "Masak dengan api kecil selama 2-3 jam", "Tambahkan gula merah, masak hingga kuah mengental", "Koreksi rasa dengan garam", "Sajikan dengan nasi hangat"]',
 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20indonesian%20gudeg%20yogya%20jackfruit%20curry%20in%20clay%20pot%20with%20coconut%20milk%20brown%20color%20authentic%20javanese%20cuisine&image_size=landscape_4_3',
 false),

('Rendang Daging', 'sumatra', 'sulit', 240, 'Rendang adalah masakan tradisional Minangkabau yang telah diakui UNESCO sebagai warisan budaya dunia. Proses memasak rendang membutuhkan kesabaran dan ketelitian tinggi. Rendang melambangkan filosofi hidup orang Minang: sabar, ulet, dan tidak mudah menyerah.', 
 '["Daging sapi 1 kg", "Santan 1 liter", "Cabai merah 20 buah", "Cabai keriting 10 buah", "Bawang merah 15 butir", "Bawang putih 8 siung", "Jahe 3 ruas", "Lengkuas 4 ruas", "Kunyit 2 ruas", "Serai 3 batang", "Daun jeruk 10 lembar", "Asam kandis 3 keping", "Garam secukupnya"]',
 '["Potong daging sapi menjadi kotak-kotak sedang", "Haluskan semua bumbu kecuali serai dan daun jeruk", "Tumis bumbu halus hingga harum dan matang", "Masukkan daging, aduk hingga berubah warna", "Tuang santan, masak dengan api sedang", "Tambahkan serai, daun jeruk, dan asam kandis", "Masak sambil terus diaduk hingga santan menyusut", "Kecilkan api, masak hingga daging empuk dan bumbu meresap", "Lanjutkan memasak hingga kuah kering dan berwarna coklat tua", "Sajikan dengan nasi putih hangat"]',
 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20indonesian%20rendang%20beef%20curry%20dark%20brown%20color%20minangkabau%20cuisine%20coconut%20milk%20spicy%20authentic&image_size=landscape_4_3',
 false),

('Soto Banjar', 'kalimantan', 'sedang', 60, 'Soto Banjar adalah kuliner khas Kalimantan Selatan yang memadukan cita rasa Melayu dan Jawa. Soto ini mencerminkan keragaman budaya di Banjarmasin sebagai kota perdagangan yang ramai. Kuah bening dengan rempah yang khas menjadi daya tarik utama soto ini.', 
 '["Ayam 1 ekor", "Kentang 3 buah", "Telur 3 butir", "Bawang merah 6 butir", "Bawang putih 4 siung", "Jahe 2 ruas", "Kunyit 1 ruas", "Ketumbar 1 sdt", "Merica 1/2 sdt", "Garam secukupnya", "Daun bawang 2 batang", "Seledri 2 batang", "Bawang goreng secukupnya"]',
 '["Rebus ayam hingga empuk, angkat dan suwir-suwir", "Saring kaldu ayam, sisihkan", "Goreng kentang hingga matang, potong dadu", "Rebus telur, kupas dan belah dua", "Haluskan bumbu: bawang merah, bawang putih, jahe, kunyit, ketumbar, merica", "Tumis bumbu halus hingga harum", "Tuang kaldu ayam, didihkan", "Masukkan ayam suwir, kentang, dan telur", "Bumbui dengan garam, masak 10 menit", "Sajikan dengan taburan daun bawang, seledri, dan bawang goreng"]',
 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20indonesian%20soto%20banjar%20clear%20chicken%20soup%20kalimantan%20cuisine%20with%20potato%20egg%20authentic%20banjarmasin&image_size=landscape_4_3',
 false),

('Pempek Palembang', 'sumatra', 'sedang', 90, 'Pempek adalah makanan khas Palembang yang terbuat dari ikan dan sagu. Konon, pempek dibawa oleh pedagang Tionghoa ke Palembang pada abad ke-16. Makanan ini menjadi simbol perpaduan budaya Tionghoa dan Melayu di Sumatera Selatan.', 
 '["Ikan tenggiri 500g", "Tepung sagu 250g", "Air es 200ml", "Garam 1 sdt", "Penyedap rasa 1/2 sdt", "Cabai merah 10 buah", "Cabai rawit 5 buah", "Bawang putih 6 siung", "Gula merah 100g", "Asam jawa 2 sdm", "Garam secukupnya"]',
 '["Fillet ikan tenggiri, buang duri dan kulit", "Haluskan daging ikan dengan food processor", "Campurkan ikan halus dengan tepung sagu", "Tambahkan air es sedikit demi sedikit sambil diuleni", "Bumbui dengan garam dan penyedap rasa", "Bentuk adonan sesuai selera (lenjer, kapal selam, dll)", "Rebus pempek dalam air mendidih hingga mengapung", "Untuk kuah cuko: haluskan cabai, bawang putih", "Rebus bumbu halus dengan air, gula merah, asam jawa", "Goreng pempek sebentar sebelum disajikan dengan cuko"]',
 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20indonesian%20pempek%20palembang%20fish%20cake%20with%20dark%20sauce%20cuko%20sumatra%20cuisine%20authentic&image_size=landscape_4_3',
 false),

('Coto Makassar', 'sulawesi', 'sulit', 180, 'Coto Makassar adalah sup tradisional Bugis-Makassar yang kaya akan rempah. Hidangan ini mencerminkan kekayaan rempah-rempah Nusantara dan keahlian memasak masyarakat Sulawesi Selatan. Coto biasanya disajikan dalam acara-acara adat dan perayaan penting.', 
 '["Daging sapi 1 kg", "Jeroan sapi 500g", "Beras 100g", "Kemiri 8 butir", "Ketumbar 2 sdt", "Jinten 1 sdt", "Pala 1/4 butir", "Cengkeh 5 butir", "Kayu manis 2 ruas", "Bawang merah 10 butir", "Bawang putih 8 siung", "Jahe 3 ruas", "Lengkuas 2 ruas", "Serai 3 batang", "Daun jeruk 5 lembar", "Garam secukupnya"]',
 '["Rebus daging dan jeroan hingga empuk, potong kecil-kecil", "Sangrai beras hingga kecoklatan, haluskan", "Sangrai kemiri, ketumbar, jinten, pala, cengkeh, kayu manis", "Haluskan semua bumbu yang sudah disangrai", "Haluskan bawang merah, bawang putih, jahe, lengkuas", "Tumis bumbu halus hingga harum", "Tuang kaldu daging, didihkan", "Masukkan daging dan jeroan yang sudah dipotong", "Tambahkan beras halus untuk mengentalkan kuah", "Bumbui dengan garam, masak hingga bumbu meresap", "Sajikan dengan ketupat dan sambal"]',
 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20indonesian%20coto%20makassar%20beef%20soup%20sulawesi%20cuisine%20rich%20spices%20authentic%20bugis&image_size=landscape_4_3',
 true),

('Ayam Betutu', 'other', 'sulit', 300, 'Ayam Betutu adalah hidangan tradisional Bali yang dimasak dengan teknik pembungkusan dan pemanggangan. Hidangan ini sering disajikan dalam upacara keagamaan Hindu Bali dan mencerminkan filosofi Tri Hita Karana - keharmonisan dengan Tuhan, sesama, dan alam.', 
 '["Ayam kampung 1 ekor", "Base genep 200g", "Daun jeruk 10 lembar", "Serai 5 batang", "Daun salam 8 lembar", "Lengkuas 4 ruas", "Jahe 3 ruas", "Kunyit 3 ruas", "Kemiri 10 butir", "Cabai merah 15 buah", "Cabai rawit 10 buah", "Bawang merah 15 butir", "Bawang putih 10 siung", "Terasi 1 sdt", "Garam secukupnya", "Daun pisang untuk membungkus"]',
 '["Bersihkan ayam, lumuri dengan garam dan jeruk nipis", "Haluskan semua bumbu base genep", "Tumis bumbu halus hingga matang dan harum", "Isi rongga ayam dengan bumbu tumis", "Baluri seluruh ayam dengan sisa bumbu", "Masukkan daun jeruk, serai, dan daun salam ke dalam ayam", "Bungkus ayam rapat dengan daun pisang", "Panggang dalam oven atau dikubur dalam bara api", "Masak selama 4-5 jam dengan api kecil", "Buka pembungkus, sajikan dengan nasi dan sambal matah"]',
 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20balinese%20ayam%20betutu%20roasted%20chicken%20wrapped%20banana%20leaves%20authentic%20bali%20cuisine&image_size=landscape_4_3',
 true);

-- Create indexes for better performance
CREATE INDEX idx_recipes_region ON recipes(region);
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX idx_recipes_is_premium ON recipes(is_premium);
CREATE INDEX idx_user_bookmarks_user_id ON user_bookmarks(user_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();