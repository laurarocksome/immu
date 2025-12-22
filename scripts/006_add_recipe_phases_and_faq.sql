-- Add phase column to recipes table to assign recipes to nutrition phases
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS phase TEXT CHECK (phase IN ('Adaptation', 'Elimination', 'Reintroduction', 'General'));

-- Create FAQs table for manageable FAQ content
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  phase TEXT CHECK (phase IN ('Adaptation', 'Elimination', 'Reintroduction', 'General')),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Everyone can view FAQs
CREATE POLICY "Anyone can view faqs"
  ON faqs FOR SELECT
  USING (true);

-- Only admins can insert FAQs
CREATE POLICY "Admins can insert faqs"
  ON faqs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Only admins can update FAQs
CREATE POLICY "Admins can update faqs"
  ON faqs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Only admins can delete FAQs
CREATE POLICY "Admins can delete faqs"
  ON faqs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Seed existing FAQ data
INSERT INTO faqs (question, answer, category, phase, order_index) VALUES
('What is the AIP Diet?', 'The Autoimmune Protocol (AIP) diet is an elimination diet designed to help reduce inflammation and symptoms of autoimmune disorders. It removes potential trigger foods and then slowly reintroduces them to identify which ones cause symptoms.', 'General', 'General', 1),
('How long should I follow the AIP diet?', 'The elimination phase typically lasts 30-90 days, depending on your symptoms and response. The reintroduction phase can take several months as you test each food group carefully.', 'General', 'General', 2),
('What is the adaptation period?', 'The adaptation period is a 4-6 week transition phase that helps you gradually adjust to the AIP diet. This is especially helpful if you currently consume foods or beverages that might be difficult to eliminate all at once.', 'General', 'Adaptation', 3),
('What foods are eliminated on AIP?', 'The AIP diet eliminates grains, legumes, dairy, eggs, nightshade vegetables, nuts, seeds, processed foods, refined sugars, and certain oils. It also removes food additives and alcohol.', 'General', 'General', 4),
('How do I manage stress during AIP?', E'Stress management is a crucial part of the AIP protocol. Chronic stress can trigger inflammation and worsen autoimmune symptoms.\n\nRecommended light exercises:\n• Walking in nature (20-30 minutes daily)\n• Gentle swimming (avoid competitive swimming)\n• Restorative yoga or gentle stretching\n• Tai chi or qigong\n\nNote: Strenuous activities should be avoided during AIP as they can increase inflammation and stress hormones.\n\nDeep breathing techniques:\nDeep breathing activates your parasympathetic nervous system (rest and digest mode). Try the 4-7-8 method: inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds. Practice for 5 minutes daily.\n\nJournaling for stress reduction:\n• Record daily gratitude (3 things you''re thankful for)\n• Track your symptoms alongside emotional states\n• Write about challenging situations and possible solutions\n• Note positive experiences and small victories', 'General', 'General', 5),
('Why is caffeine not allowed on AIP?', E'Caffeine is eliminated during the initial phase of AIP for several important reasons:\n\n• It can irritate the gut lining, compromising intestinal barrier integrity\n• It stimulates the adrenals, potentially disrupting hormone balance\n• It masks fatigue instead of addressing the underlying cause\n• It can directly trigger autoimmune symptoms in sensitive individuals\n\nCoffee specifically is problematic because coffee beans are:\n• Seeds, which are eliminated on AIP (like nuts, legumes, etc.)\n• Known to cross-react with gluten for some people (the immune system treats it like gluten)\n\nOnce you''ve rebalanced your immune system and healed your gut (usually after 30–90 days), caffeine can be reintroduced mindfully as part of the reintroduction protocol.', 'General', 'General', 6),
('What about weight loss on AIP?', E'Many people experience weight loss on AIP as a natural side effect of:\n• Reduced inflammation throughout the body\n• Better hormone regulation and balance\n• Improved gut health and nutrient absorption\n• Elimination of processed foods and refined sugars\n\nImportant: AIP is not designed as a weight loss diet. The primary goal is health and symptom reduction.\n\nIf your weight isn''t changing or is increasing on AIP, consider these factors:\n• Consuming too many AIP-safe treats (coconut-heavy desserts, excessive sweet potatoes)\n• Underlying thyroid or hormonal imbalances that need addressing\n• Being in a caloric surplus (AIP is not automatically low-calorie)\n• Chronic stress or poor sleep affecting metabolism\n• Your body finding its natural, healthy weight (which may be different than expected)', 'General', 'General', 7),
('How do I track my symptoms?', 'IMMU helps you track your symptoms daily. Consistent tracking is important to identify patterns and connections between foods and symptoms. Use the dashboard to log your meals and symptoms each day.', 'General', 'General', 8),
('What causes nausea on AIP and how can I manage it?', E'If you''re experiencing nausea while following the AIP diet, several factors could be contributing:\n\n• Insufficient healthy fats: Increase your healthy fat intake gradually with foods like avocado, olive oil, and coconut oil.\n• Food sensitivities: Try to remember what you ate today and check if the same foods give you this feeling next time.\n• Fermented foods: Increase intake of fermented food gradually as they can cause digestive upset when introduced too quickly.\n• High iron-foods: Some AIP-compliant foods high in iron could cause nausea in sensitive individuals.\n• Low blood sugar: Ensure you''re eating regular, balanced meals throughout the day.\n• Too much fiber: Try to increase your fiber intake gradually and make sure to cook your vegetables thoroughly.\n• Dehydration: Ensure you''re drinking enough water throughout the day.\n\nIf nausea persists despite these adjustments, consider consulting with a healthcare provider to rule out other causes.', 'Digestive', 'General', 9),
('What causes bloating on AIP and how can I manage it?', E'Bloating can be common when transitioning to the AIP diet. Here are potential causes and solutions:\n\n• Too much fiber: Try to increase your fiber intake gradually and make sure to cook your vegetables thoroughly.\n• PMS: Hormonal fluctuations before your period can cause temporary bloating.\n• Fermented foods: Increase intake of fermented food gradually to allow your gut to adjust.\n• Coconut products: Large amounts of coconut can be hard to digest. Reduce the intake and experiment to see how it affects you.\n• Large portions and fast eating: Try eating smaller meals more slowly, chewing thoroughly.\n• Stress: Practice stress management techniques as stress can directly impact digestion.\n\nTracking your food intake alongside bloating symptoms can help identify your specific triggers.', 'Digestive', 'General', 10),
('What causes gas on AIP and how can I manage it?', E'Excessive gas can be uncomfortable but is often manageable with some adjustments:\n\n• Too much fiber: Try to increase your fiber intake gradually and make sure to cook your vegetables thoroughly.\n• Coconut products: Large amounts of coconut can be hard to digest. Reduce the intake and experiment to see how it affects you.\n• Large portions and fast eating: Eat smaller meals more slowly and chew thoroughly.\n• Fermented foods: Increase intake of fermented food gradually to allow your gut to adjust.\n• Drinking with a straw: This can cause you to swallow excess air.\n• Chewing gum: Avoid chewing gum as it can lead to swallowing air.\n• Cruciferous vegetables: Foods like cauliflower and Brussels sprouts can cause gas. Cook them well and reduce portions.\n• Starchy vegetables: Sweet potatoes, squash, and plantains can cause gas in some people. Try pairing them with non-starchy vegetables.\n\nRemember that some gas is normal, especially when transitioning to a new diet with different fiber sources.', 'Digestive', 'General', 11),
('What causes heartburn on AIP and how can I manage it?', E'Heartburn can occur even on the AIP diet. Here are common causes and management strategies:\n\n• High fat foods: Moderate high-fat foods, and try consuming smaller, balanced portions.\n• Overeating or large portions: Eat smaller meals more frequently throughout the day.\n• Spicy foods or strong seasonings: Even AIP-compliant seasonings can trigger heartburn in sensitive individuals.\n• Coconut products: Coconut oil, milk, or flour can sometimes cause digestive upset for those who are sensitive.\n• Acidic foods: Some AIP foods are naturally acidic, such as apple cider vinegar or certain fruits.\n• Underlying gut issues: Low stomach acid can paradoxically cause heartburn symptoms.\n• Eating too close to bedtime: Avoid eating at least 2-3 hours before lying down or going to bed.\n• Fermented foods: Start with very small amounts of fermented foods, and see how your body responds.\n• Stress and anxiety: Practice stress management techniques as stress can increase acid production.\n• Drinking large amounts of water with meals: This can dilute stomach acid and impair digestion.\n\nIf heartburn persists despite these adjustments, consult with a healthcare provider to rule out other causes.', 'Digestive', 'General', 12),
('Can I eat any nuts or seeds on AIP?', 'Most nuts and seeds are eliminated on the AIP diet, but there''s one exception: tigernuts. Despite the name, tigernuts aren''t actually nuts—they''re tubers—and are AIP-approved. They''re a great option if you''re craving that nutty crunch.', 'General', 'General', 13),
('I really love pasta. Is there any substitute on AIP?', E'While traditional wheat pasta is eliminated on the AIP diet, there are several delicious alternatives:\n\n• Vegetable noodles: Spiralized zucchini, sweet potato, or carrots make excellent pasta alternatives. They''re light, nutritious, and work well with most sauces.\n• Cassava pasta: Made from cassava (yuca) root, this is the closest to traditional pasta in texture and is completely AIP-compliant.\n• Plantain pasta: Some companies make pasta from green plantains, which is another AIP-friendly option.\n• Spaghetti squash: When cooked, the flesh separates into spaghetti-like strands, making it a natural pasta alternative.\n\nCheck out our recipes section for our AIP-friendly Shrimp Pesto Pasta that uses either zucchini noodles or cassava pasta!', 'General', 'General', 14);
