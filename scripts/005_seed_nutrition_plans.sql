-- Seed nutrition plans from the app

INSERT INTO nutrition_plans (phase, title, description, duration_days, week_number, content) VALUES
-- Adaptation Phase
('Adaptation', 'Week 1: Remove Caffeine', 'Remove all caffeinated drinks and stimulants', 7, 1, 
'{"tasks": ["Remove all caffeinated drinks (like coffee, matcha, energy drinks)", "Remove any stimulants like pre-workout supplements", "This helps reduce stress on your nervous system", "Improves sleep and energy stability"]}'::jsonb),

('Adaptation', 'Week 2: Eliminate Alcohol', 'Eliminate alcohol while continuing to avoid caffeine', 7, 2, 
'{"tasks": ["Eliminate alcohol while continuing to avoid caffeine", "Start drinking 1.5–2L of water daily", "Increase your fruit intake to stay hydrated", "Helps ease cravings"]}'::jsonb),

('Adaptation', 'Week 3: Remove Added Sugars', 'Remove added sugars from your diet', 7, 3, 
'{"tasks": ["Remove added sugars", "You can still enjoy fruit or a little honey in moderation", "Boost your protein intake to feel satisfied", "Add more chicken, fish, or other lean proteins to your meals", "Avoids blood sugar dips"]}'::jsonb),

('Adaptation', 'Week 4: Increase Vegetables', 'Maintain new habits and increase vegetable intake', 7, 4, 
'{"tasks": ["Keep going with your new habits (no caffeine, sugar, or alcohol)", "Increase your vegetable intake", "Preparing for full AIP", "Proteins and vegetables are the foundation of your meals"]}'::jsonb),

-- Elimination Phase
('Elimination', 'Remove All Inflammatory Foods', 'Eliminate all common inflammatory foods', NULL, NULL,
'{"tasks": ["Eliminate grains, legumes, dairy, eggs, nightshades, nuts, seeds, and food additives from your diet completely"]}'::jsonb),

('Elimination', 'Focus on Nutrient Density', 'Prioritize nutrient-dense foods', NULL, NULL,
'{"tasks": ["Prioritize nutrient-dense foods like quality meats, seafood, bone broth, and a wide variety of vegetables"]}'::jsonb),

('Elimination', 'Track Your Symptoms', 'Monitor your health progress', NULL, NULL,
'{"tasks": ["Keep a detailed journal of your symptoms, energy levels, and any changes you notice as your body adjusts to the elimination diet"]}'::jsonb),

('Elimination', 'Maintain for 30-90 Days', 'Stay in elimination phase', NULL, NULL,
'{"tasks": ["Stay in this phase until your symptoms have significantly improved", "Typically 30-90 days depending on your individual response"]}'::jsonb),

-- Reintroduction Phase
('Reintroduction', 'The Reintroduction Process', 'Guidelines for reintroducing foods', NULL, NULL,
'{"steps": ["Choose one food at a time", "Only reintroduce a single ingredient — not a mix", "Example: reintroduce egg yolk before whole egg"]}'::jsonb),

('Reintroduction', 'Test in Increasing Amounts', 'How to properly test foods', NULL, NULL,
'{"steps": ["Morning: Take a small bite", "Wait 15 minutes. If no reaction, have a larger bite", "Wait 2–3 hours. If still no reaction, eat a normal portion", "Then wait 3 full days before testing the next food — keep your base AIP diet otherwise unchanged"]}'::jsonb),

('Reintroduction', 'Track Reactions Carefully', 'Monitor for any reactions', NULL, NULL,
'{"steps": ["Note any symptoms: fatigue, mood changes, digestive discomfort, headaches, pain, etc.", "Symptoms can appear immediately or be delayed, so that 3-day waiting period is important"]}'::jsonb)
ON CONFLICT DO NOTHING;
