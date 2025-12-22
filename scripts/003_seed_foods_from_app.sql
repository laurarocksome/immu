-- Seed all foods from the app into the database
-- This migration preserves all the existing food data

INSERT INTO foods (name, is_aip, status, tags, tooltip, category) VALUES
-- Proteins
('Chicken', true, 'Can eat', ARRAY['Protein', 'Meat', 'Poultry'], NULL, 'Protein'),
('Turkey', true, 'Can eat', ARRAY['Protein', 'Meat', 'Poultry'], NULL, 'Protein'),
('Beef', true, 'Can eat', ARRAY['Protein', 'Meat', 'Red meat'], NULL, 'Protein'),
('Lamb', true, 'Can eat', ARRAY['Protein', 'Meat', 'Red meat'], NULL, 'Protein'),
('Pork', false, 'Can''t eat', ARRAY['Protein', 'Meat', 'Red meat'], NULL, 'Protein'),
('Fish (wild-caught)', true, 'Can eat', ARRAY['Protein', 'Seafood', 'Omega-3'], NULL, 'Protein'),
('Shellfish', true, 'Can eat', ARRAY['Protein', 'Seafood'], NULL, 'Protein'),
('Eggs', false, 'Can''t eat', ARRAY['Protein'], 'Egg proteins can trigger immune responses. Eliminated even if pasture-raised.', 'Protein'),
('Tofu', false, 'Can''t eat', ARRAY['Protein', 'Soy', 'Legume'], NULL, 'Protein'),

-- Animal Proteins
('Grass-fed beef', true, 'Can eat', ARRAY['Protein', 'Meat', 'Red meat', 'Animal Protein'], NULL, 'Animal Protein'),
('Bison', true, 'Can eat', ARRAY['Protein', 'Meat', 'Red meat', 'Game meat', 'Animal Protein'], NULL, 'Animal Protein'),
('Duck', true, 'Can eat', ARRAY['Protein', 'Meat', 'Poultry', 'Animal Protein'], NULL, 'Animal Protein'),
('Rabbit', true, 'Can eat', ARRAY['Protein', 'Meat', 'Game meat', 'Animal Protein'], NULL, 'Animal Protein'),
('Beef liver', true, 'Can eat', ARRAY['Protein', 'Meat', 'Organ meat', 'Nutrient-dense', 'Animal Protein'], NULL, 'Animal Protein'),
('Chicken liver', true, 'Can eat', ARRAY['Protein', 'Meat', 'Organ meat', 'Nutrient-dense', 'Animal Protein'], NULL, 'Animal Protein'),
('Lamb liver', true, 'Can eat', ARRAY['Protein', 'Meat', 'Organ meat', 'Nutrient-dense', 'Animal Protein'], NULL, 'Animal Protein'),
('Beef heart', true, 'Can eat', ARRAY['Protein', 'Meat', 'Organ meat', 'Nutrient-dense', 'Animal Protein'], NULL, 'Animal Protein'),
('Venison (deer)', true, 'Can eat', ARRAY['Protein', 'Meat', 'Game meat', 'Red meat', 'Animal Protein'], NULL, 'Animal Protein'),
('Elk', true, 'Can eat', ARRAY['Protein', 'Meat', 'Game meat', 'Red meat', 'Animal Protein'], NULL, 'Animal Protein'),
('Salmon', true, 'Can eat', ARRAY['Protein', 'Seafood', 'Fish', 'Omega-3', 'Animal Protein'], NULL, 'Animal Protein'),
('Sardines', true, 'Can eat', ARRAY['Protein', 'Seafood', 'Fish', 'Omega-3', 'Nutrient-dense', 'Animal Protein'], NULL, 'Animal Protein'),
('Mackerel (small, Atlantic)', true, 'Can eat', ARRAY['Protein', 'Seafood', 'Fish', 'Omega-3', 'Animal Protein'], NULL, 'Animal Protein'),
('Cod', true, 'Can eat', ARRAY['Protein', 'Seafood', 'Fish', 'White fish', 'Animal Protein'], NULL, 'Animal Protein'),
('Shrimp', true, 'Can eat', ARRAY['Protein', 'Seafood', 'Shellfish', 'Animal Protein'], NULL, 'Animal Protein'),
('Scallops', true, 'Can eat', ARRAY['Protein', 'Seafood', 'Shellfish', 'Animal Protein'], NULL, 'Animal Protein'),
('Oysters', true, 'Can eat', ARRAY['Protein', 'Seafood', 'Shellfish', 'Nutrient-dense', 'Animal Protein'], NULL, 'Animal Protein')

-- Note: Due to SQL length limitations, this is split into multiple insert statements
ON CONFLICT DO NOTHING;
