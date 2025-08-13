-- Add missing columns to recipes and user_progress tables

-- Add description and servings columns to recipes table
ALTER TABLE recipes 
ADD COLUMN description TEXT,
ADD COLUMN servings INTEGER DEFAULT 4;

-- Add progress_percentage column to user_progress table
ALTER TABLE user_progress 
ADD COLUMN progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100);

-- Update existing recipes with sample descriptions and servings
UPDATE recipes SET 
  description = 'Gudeg adalah makanan tradisional Yogyakarta yang terbuat dari nangka muda yang dimasak dengan santan dan bumbu rempah. Rasanya manis dan gurih, mencerminkan cita rasa khas Jawa.',
  servings = 6
WHERE title = 'Gudeg Yogya';

UPDATE recipes SET 
  description = 'Rendang adalah masakan daging yang dimasak dalam waktu lama dengan santan dan rempah-rempah. Hidangan khas Minangkabau ini memiliki cita rasa yang kaya dan kompleks.',
  servings = 8
WHERE title = 'Rendang Daging';

UPDATE recipes SET 
  description = 'Soto Banjar adalah sup ayam khas Kalimantan Selatan dengan kuah bening yang segar. Disajikan dengan kentang, telur, dan taburan bawang goreng.',
  servings = 4
WHERE title = 'Soto Banjar';

UPDATE recipes SET 
  description = 'Pempek adalah makanan khas Palembang yang terbuat dari ikan dan tepung sagu. Disajikan dengan kuah cuko yang asam, manis, dan pedas.',
  servings = 4
WHERE title = 'Pempek Palembang';

UPDATE recipes SET 
  description = 'Coto Makassar adalah sup daging sapi khas Sulawesi Selatan dengan kuah yang kaya rempah. Biasanya disajikan dengan ketupat dan sambal.',
  servings = 6
WHERE title = 'Coto Makassar';

UPDATE recipes SET 
  description = 'Ayam Betutu adalah hidangan ayam panggang khas Bali yang dibumbui dengan base genep dan dibungkus daun pisang. Proses memasaknya membutuhkan waktu yang lama.',
  servings = 4
WHERE title = 'Ayam Betutu';

-- Make description column NOT NULL after updating existing data
ALTER TABLE recipes ALTER COLUMN description SET NOT NULL;