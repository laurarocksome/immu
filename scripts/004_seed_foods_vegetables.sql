-- Seed vegetables into the database

INSERT INTO foods (name, is_aip, status, tags, tooltip, category) VALUES
-- Vegetables
('Broccoli', true, 'Can eat', ARRAY['Vegetable', 'Cruciferous'], NULL, 'Vegetable'),
('Cauliflower', true, 'Can eat', ARRAY['Vegetable', 'Cruciferous'], NULL, 'Vegetable'),
('Cabbage', true, 'Can eat', ARRAY['Vegetable', 'Cruciferous'], NULL, 'Vegetable'),
('Brussels sprouts', true, 'Can eat', ARRAY['Vegetable', 'Cruciferous'], NULL, 'Vegetable'),
('Carrots', true, 'Can eat', ARRAY['Vegetable', 'Root'], NULL, 'Vegetable'),
('Beets', true, 'Can eat', ARRAY['Vegetable', 'Root'], NULL, 'Vegetable'),
('Sweet Potatoes', true, 'Can eat', ARRAY['Vegetable', 'Starchy', 'Root'], NULL, 'Vegetable'),
('Parsnips', true, 'Can eat', ARRAY['Vegetable', 'Root'], NULL, 'Vegetable'),
('Turnips', true, 'Can eat', ARRAY['Vegetable', 'Root'], NULL, 'Vegetable'),
('Rutabaga', true, 'Can eat', ARRAY['Vegetable', 'Root'], NULL, 'Vegetable'),
('Kale', true, 'Can eat', ARRAY['Vegetable', 'Leafy green', 'Cruciferous'], NULL, 'Vegetable'),
('Spinach', true, 'Can eat', ARRAY['Vegetable', 'Leafy green'], NULL, 'Vegetable'),
('Arugula', true, 'Can eat', ARRAY['Vegetable', 'Leafy green'], NULL, 'Vegetable'),
('Chard', true, 'Can eat', ARRAY['Vegetable', 'Leafy green'], NULL, 'Vegetable'),
('Lettuce', true, 'Can eat', ARRAY['Vegetable', 'Leafy green'], NULL, 'Vegetable'),
('Celery', true, 'Can eat', ARRAY['Vegetable'], NULL, 'Vegetable'),
('Fennel', true, 'Can eat', ARRAY['Vegetable'], NULL, 'Vegetable'),
('Zucchini', true, 'Can eat', ARRAY['Vegetable', 'Summer squash'], NULL, 'Vegetable'),
('Cucumber', true, 'Can eat', ARRAY['Vegetable'], NULL, 'Vegetable'),
('Radishes', true, 'Can eat', ARRAY['Vegetable', 'Root'], NULL, 'Vegetable'),
('Mushrooms', true, 'Can eat', ARRAY['Vegetable', 'Fungi'], NULL, 'Vegetable'),
('Onions', true, 'Can eat', ARRAY['Vegetable', 'Allium'], NULL, 'Vegetable'),
('Garlic', true, 'Can eat', ARRAY['Vegetable', 'Allium'], NULL, 'Vegetable'),
('Leeks', true, 'Can eat', ARRAY['Vegetable', 'Allium'], NULL, 'Vegetable'),
('Asparagus', true, 'Can eat', ARRAY['Vegetable'], NULL, 'Vegetable'),
('Tomatoes', false, 'Can''t eat', ARRAY['Vegetable', 'Nightshade'], NULL, 'Vegetable'),
('Peppers', false, 'Can''t eat', ARRAY['Vegetable', 'Nightshade'], NULL, 'Vegetable'),
('Eggplant', false, 'Can''t eat', ARRAY['Vegetable', 'Nightshade'], NULL, 'Vegetable'),
('Potatoes', false, 'Can''t eat', ARRAY['Vegetable', 'Starchy', 'Nightshade'], NULL, 'Vegetable')
ON CONFLICT DO NOTHING;
