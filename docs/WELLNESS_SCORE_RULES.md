# Immu-Health Wellness Score Rules & Daily Insights

## Overview
The Wellness Score is a **0-100 normalized metric** that measures daily health and well-being based on four primary factors: mood, sleep, stress, and symptoms. The score is calculated daily and used to provide personalized daily insights to guide users toward better health outcomes.

---

## Wellness Score Calculation

### Formula
\`\`\`
Total Score = Average of all applicable factors
Final Score = Round(Total Score)

If no factors provided: Default = 50
\`\`\`

### Scoring Factors

#### 1. **Mood** (1-5 scale) → 0-100 points
- Conversion: `((mood - 1) / 4) × 100`
- **1** = 0 points (Very Poor)
- **2** = 25 points (Poor)
- **3** = 50 points (Neutral)
- **4** = 75 points (Good)
- **5** = 100 points (Excellent)

#### 2. **Sleep** (1-5 scale) → 0-100 points
- Conversion: `((sleep - 1) / 4) × 100`
- **1** = 0 points (Severe sleep issues)
- **2** = 25 points (Poor sleep)
- **3** = 50 points (Average sleep)
- **4** = 75 points (Good sleep)
- **5** = 100 points (Excellent sleep)

#### 3. **Stress** (1-5 scale, inverted) → 0-100 points
- Conversion: `((5 - stress) / 4) × 100`
- **1** = 100 points (No stress)
- **2** = 75 points (Minimal stress)
- **3** = 50 points (Moderate stress)
- **4** = 25 points (High stress)
- **5** = 0 points (Extreme stress)

#### 4. **Symptoms** (if provided) → 0-100 points
- Only includes symptoms with severity > 0
- Conversion: `((5 - avg_severity) / 4) × 100`
- Tracked Symptoms:
  - Menstrual cramps
  - Headaches
  - Breast tenderness
  - Lower back pain
  - Muscle aches
  - Joint pain
  - Digestive symptoms (bloating, constipation, diarrhea, nausea)
- **Severity Scale**: 1 (minimal) to 5 (severe)

---

## Wellness Score Ranges & Classifications

| Score Range | Level | Color | Classification |
|-------------|-------|-------|-----------------|
| **75-100** | Excellent | 🟢 Green | Optimal wellness |
| **50-74** | Good | 🟡 Yellow | Healthy baseline |
| **25-49** | Fair | 🟠 Orange | Needs attention |
| **0-24** | Poor | 🔴 Red | Critical concern |

---

## Daily Insights System

### Purpose
Daily Insights provide personalized, actionable recommendations based on:
1. Wellness Score level
2. Logged symptoms (period, digestive, general)
3. User profile (gender, preferences)
4. Current AIP diet phase

### Insight Generation Logic

#### **Trigger Conditions**
Insights are generated when:
- User has logged wellness data (mood, sleep, stress)
- User has logged symptoms
- User has completed daily log entry

#### **No Data Scenario**
If no wellness or symptom data logged:
- Display: "Log your symptoms to see daily insights."
- OR: "No insights for today. Try logging your symptoms and wellness data."

### Insight Categories

#### 1. **Period-Related Insights** (Female Users Only)
**Condition**: User is on their period

**Possible Insights**:
- `"You're on your period today, which may affect your energy levels and comfort."`
- `"Your period symptoms ({symptomNames}) may affect your overall wellness score today."`
  - Example: "Your period symptoms (menstrual cramps, breast tenderness) may affect your overall wellness score today."

**Triggers**:
- `isOnPeriod = true`
- Period symptoms logged: menstrual cramps, breast tenderness

---

#### 2. **Digestive Insights** (All Users)
**Condition**: User has logged digestive symptoms

**Possible Insights**:
- `"Your digestive symptoms ({symptomNames}) may be related to recent dietary changes."`
  - Example: "Your digestive symptoms (bloating, constipation) may be related to recent dietary changes."

**Associated Tips** (with links):
| Symptom | Tip | Link |
|---------|-----|------|
| Bloating | Increase water intake and reduce sodium | Learn more |
| Constipation | Add more fiber-rich foods gradually | Learn more |
| Diarrhea | Stay hydrated and avoid trigger foods | Learn more |
| Nausea | Try ginger tea or small frequent meals | Learn more |

**Triggers**:
- Logged digestive symptoms with severity > 0
- Symptoms: bloating, constipation, diarrhea, nausea

---

#### 3. **Wellness Score-Based Insights** (Primary Driver)

**Score: 75-100 (Excellent)**
- **Insight**: `"Your wellness score is excellent today! Keep up the good habits."`
- **Message Type**: Encouragement & reinforcement
- **Recommendation**: Continue current routines

**Score: 50-74 (Good)**
- **Insight**: `"Your wellness score is good. Consider focusing on sleep quality to improve further."`
- **Message Type**: Constructive suggestion
- **Focus Area**: Sleep optimization

**Score: 25-49 (Fair)**
- **Insight**: `"Your wellness score indicates you might benefit from stress reduction techniques today."`
- **Message Type**: Health alert
- **Focus Area**: Stress management

**Score: 0-24 (Poor)**
- **Insight**: Contextual based on lowest factor
- **Message Type**: Urgent recommendation
- **Focus Areas**: Overall wellness check, professional consultation

---

#### 4. **Default Insights** (No Specific Data)
If no specific conditions are met but user has logged some data:

- "Remember to stay hydrated throughout the day for optimal health."
- "Consider adding more leafy greens to your meals for additional nutrients."
- "Taking short breaks during the day can help reduce stress and improve focus."

---

### Insight Format & Presentation

#### Standard Insight
\`\`\`
{
  text: "Your wellness score is excellent today! Keep up the good habits.",
  type: "wellness" | "symptom" | "period" | "general",
  priority: 1-5 (1 = highest)
}
\`\`\`

#### Insight with Link
\`\`\`
{
  text: "Your digestive symptoms (bloating) may be related to recent dietary changes.",
  link: "/learning/digestive-health",
  linkText: "Learn more",
  type: "symptom"
}
\`\`\`

### Insight Display Rules

1. **Maximum Insights**: 5-7 insights per day
2. **Priority Order**:
   - Period-related insights (females on period)
   - Critical digestive symptoms
   - Wellness score insights
   - General health tips
3. **Timing**: Displayed on dashboard immediately after daily log
4. **Persistence**: Insights update daily; previous day's insights are replaced

---

## Implementation Details

### Current Implementation Location
- **File**: `app/dashboard/page.tsx`
- **Function**: `generateDailyObservations()`
- **Calculation**: `calculateWellnessScore()`

### Data Sources
- `mood`: User input (1-5 scale)
- `sleep`: User input (1-5 scale)
- `stress`: User input (1-5 scale)
- `symptoms`: Array of `{name: string, severity: number}`
- `userProfile`: Retrieved from localStorage (gender, preferences)
- `loggedPeriodSymptoms`: Array of period symptoms
- `loggedDigestiveSymptoms`: Array of digestive symptoms

---

## User Engagement Flow

\`\`\`
User Logs Daily Data
    ↓
Calculate Wellness Score (0-100)
    ↓
Generate Daily Insights
    ↓
Display on Dashboard
    ↓
User reads insights & acts on recommendations
    ↓
Data tracked over time for trend analysis
\`\`\`

---

## Example Scenarios

### Scenario 1: Excellent Day with Perfect Sleep
\`\`\`
Input:
- Mood: 5 (Excellent)
- Sleep: 5 (Excellent)
- Stress: 1 (No stress)
- Symptoms: None

Calculation:
- (4/4)×100 + (4/4)×100 + (4/4)×100 / 3 = 100

Output:
- Wellness Score: 100
- Insight: "Your wellness score is excellent today! Keep up the good habits."
- Color: 🟢 Green
\`\`\`

### Scenario 2: Fair Day with Digestive Issues
\`\`\`
Input:
- Mood: 3 (Neutral)
- Sleep: 3 (Average)
- Stress: 3 (Moderate)
- Symptoms: Bloating (severity 3)

Calculation:
- (2/4)×100 + (2/4)×100 + (2/4)×100 + (2/4)×100 / 4 = 50

Output:
- Wellness Score: 50
- Insights:
  1. "Your digestive symptoms (bloating) may be related to recent dietary changes. [Learn more]"
  2. "Your wellness score is good. Consider focusing on sleep quality to improve further."
- Color: 🟡 Yellow
\`\`\`

### Scenario 3: Poor Day with High Stress
\`\`\`
Input:
- Mood: 2 (Poor)
- Sleep: 2 (Poor)
- Stress: 5 (Extreme stress)
- Symptoms: Headaches (severity 4)

Calculation:
- (1/4)×100 + (1/4)×100 + (0/4)×100 + (1/4)×100 / 4 = 25

Output:
- Wellness Score: 25
- Insights:
  1. "Your wellness score indicates you might benefit from stress reduction techniques today."
  2. "Your headaches may be stress-related. [Learn stress relief techniques]"
- Color: 🟠 Orange
\`\`\`

---

## Future Enhancements

- [ ] Trend-based insights (comparing to past weeks)
- [ ] Food trigger correlation with symptoms
- [ ] Personalized recommendations based on AIP phase
- [ ] AI-generated insights based on historical patterns
- [ ] Voice-to-text insight summaries
- [ ] Insight scheduling (morning vs. evening)
