/**
 * Utility function to set up test data and skip authentication/onboarding
 */
export function setupTestData() {
  // Set up minimal required localStorage data
  const testUserAccount = {
    name: "Test User",
    email: "test@example.com",
    createdAt: new Date().toISOString(),
  }

  // Set up basic user profile
  const testUserProfile = {
    gender: "female",
    age: 30,
    weight: 65,
    weightUnit: "kg",
    height: 170,
    heightUnit: "cm",
  }

  // Set up basic user conditions
  const testConditions = ["Hashimoto's", "Rheumatoid Arthritis"]

  // Set up basic user symptoms
  const testSymptoms = ["Joint Pain", "Fatigue", "Brain Fog"]

  // Set up diet start date (today)
  const dietStartDate = new Date().toISOString()

  // Set up diet timeline (30 days)
  const dietTimeline = "30"

  // Set up adaptation choice
  const adaptationChoice = "Yes"

  // Save to localStorage
  localStorage.setItem("userAccount", JSON.stringify(testUserAccount))
  localStorage.setItem("userProfile", JSON.stringify(testUserProfile))
  localStorage.setItem("userConditions", JSON.stringify(testConditions))
  localStorage.setItem("userSymptoms", JSON.stringify(testSymptoms))
  localStorage.setItem("dietStartDate", dietStartDate)
  localStorage.setItem("userDietTimeline", dietTimeline)
  localStorage.setItem("userAdaptationChoice", adaptationChoice)
}
