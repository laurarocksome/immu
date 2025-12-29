-- Fix column naming inconsistencies to match the code
-- The user-data.ts code expects 'condition' and 'symptom', but schema has 'condition_name' and 'symptom_name'

ALTER TABLE user_conditions RENAME COLUMN condition TO condition_old;
ALTER TABLE user_conditions ADD COLUMN IF NOT EXISTS condition TEXT;
UPDATE user_conditions SET condition = condition_old WHERE condition IS NULL;
ALTER TABLE user_conditions DROP COLUMN IF EXISTS condition_old;

ALTER TABLE user_symptoms RENAME COLUMN symptom TO symptom_old;
ALTER TABLE user_symptoms ADD COLUMN IF NOT EXISTS symptom TEXT;
UPDATE user_symptoms SET symptom = symptom_old WHERE symptom IS NULL;
ALTER TABLE user_symptoms DROP COLUMN IF EXISTS symptom_old;
