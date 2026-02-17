-- Migration to support multiple images, GIFs, and 3D models for products

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS additional_images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS gif_url TEXT,
ADD COLUMN IF NOT EXISTS model_3d_url TEXT;

-- Update RLS policies if necessary (already handled by 'Allow admin all')
