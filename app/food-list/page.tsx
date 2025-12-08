"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  List,
  Home,
  Plus,
  BookOpen,
  UtensilsCrossed,
  User,
  Search,
  Filter,
  Info,
  ChevronDown,
  ChevronUp,
  Heart,
} from "lucide-react"
import Logo from "@/app/components/logo"

// Function to determine the current diet phase and day
const determineDietPhase = () => {
  if (typeof window === "undefined") return { phase: "elimination", adaptationDay: 0 }

  const adaptationChoice = localStorage.getItem("userAdaptationChoice")
  const hasAdaptation = adaptationChoice === "Yes"
  const startDate = localStorage.getItem("dietStartDate")

  if (!startDate) {
    return { phase: "elimination", adaptationDay: 0 }
  }

  const dietStartDate = new Date(startDate)
  const today = new Date()
  const daysElapsed = Math.floor((today.getTime() - dietStartDate.getTime()) / (1000 * 60 * 60 * 24))

  // Calculate adaptation days
  const adaptationDays = hasAdaptation ? 28 : 0

  // Get diet timeline
  const dietTimeline = localStorage.getItem("userDietTimeline")
  const totalSelectedDays = dietTimeline ? Number.parseInt(dietTimeline) : 30
  const eliminationDays = hasAdaptation ? totalSelectedDays - adaptationDays : totalSelectedDays

  // Determine current phase
  if (hasAdaptation && daysElapsed < adaptationDays) {
    // In adaptation phase
    return { phase: "adaptation", adaptationDay: daysElapsed + 1 } // +1 because day 1 is the first day
  } else if (daysElapsed < (hasAdaptation ? adaptationDays + eliminationDays : eliminationDays)) {
    // In elimination phase
    return { phase: "elimination", adaptationDay: 0 }
  } else {
    // In reintroduction phase
    return { phase: "reintroduction", adaptationDay: 0 }
  }
}

// Update the containsCaffeine function to better detect exact matches
const containsCaffeine = (product) => {
  // List of caffeine-containing keywords
  const caffeineKeywords = [
    "coffee",
    "caffeine",
    "black tea",
    "green tea",
    "matcha",
    "energy drink",
    "espresso",
    "coffee bean",
    "pre-workout",
    "yerba mate",
    "oolong tea",
    "white tea",
    "chai tea",
    "red bull",
    "monster",
    "5-hour energy",
  ]

  // List of caffeine-free herbal teas that should be allowed
  const herbalTeaKeywords = [
    "peppermint tea",
    "chamomile tea",
    "rooibos tea",
    "ginger tea",
    "herbal tea",
    "mint tea",
    "hibiscus tea",
    "lemon balm tea",
    "valerian tea",
    "lavender tea",
    "licorice root tea",
    "dandelion root tea",
    "nettle leaf tea",
    "raspberry leaf tea",
    "tulsi tea",
    "marshmallow root tea",
  ]

  // First check if it's explicitly a herbal tea that's allowed
  for (const herbalTea of herbalTeaKeywords) {
    if (product.name.toLowerCase().includes(herbalTea.toLowerCase())) {
      return false // Not caffeinated
    }
  }

  // Check if the product has the "Caffeine" tag
  if (product.tags && product.tags.includes("Caffeine")) {
    return true
  }

  // Check for exact matches with product name
  if (
    product.name === "Coffee" ||
    product.name === "Black tea" ||
    product.name === "Green tea" ||
    product.name === "Matcha" ||
    product.name === "Energy drinks" ||
    product.name === "Espresso" ||
    product.name === "Cappuccino" ||
    product.name === "Latte" ||
    product.name === "Americano" ||
    product.name === "Cold brew coffee" ||
    product.name === "Iced coffee" ||
    product.name === "Oolong tea" ||
    product.name === "White tea" ||
    product.name === "Chai tea" ||
    product.name === "Yerba mate" ||
    product.name === "Red Bull" ||
    product.name === "Monster Energy" ||
    product.name === "Pre-workout supplements" ||
    product.name === "Caffeinated water" ||
    product.name === "Caffeinated gum" ||
    product.name === "Chocolate covered espresso beans"
  ) {
    return true
  }

  // Then check if it contains caffeine keywords
  return caffeineKeywords.some(
    (keyword) =>
      product.name.toLowerCase().includes(keyword.toLowerCase()) ||
      (product.tags && product.tags.some((tag) => tag.toLowerCase().includes(keyword.toLowerCase()))),
  )
}

// Function to check if a product contains alcohol
const containsAlcohol = (product) => {
  const alcoholKeywords = [
    "alcohol",
    "wine",
    "beer",
    "liquor",
    "vodka",
    "whiskey",
    "rum",
    "gin",
    "tequila",
    "brandy",
    "cocktail",
  ]
  return alcoholKeywords.some(
    (keyword) =>
      product.name.toLowerCase().includes(keyword.toLowerCase()) ||
      (product.tags && product.tags.some((tag) => tag.toLowerCase().includes(keyword.toLowerCase()))),
  )
}

// Function to check if a product contains sugar
const containsSugar = (product) => {
  const sugarKeywords = [
    "sugar",
    "sweet",
    "candy",
    "chocolate",
    "dessert",
    "cake",
    "cookie",
    "pastry",
    "syrup",
    "honey",
    "molasses",
    "agave",
  ]
  return sugarKeywords.some(
    (keyword) =>
      product.name.toLowerCase().includes(keyword.toLowerCase()) ||
      (product.tags && product.tags.some((tag) => tag.toLowerCase().includes(keyword.toLowerCase()))),
  )
}

// Flatten all products into a single array with categories as tags
const allProducts = [
  // Proteins
  {
    name: "Chicken",
    isAIP: true,
    status: "Can eat",
    tags: ["Protein", "Meat", "Poultry"],
  },
  {
    name: "Turkey",
    isAIP: true,
    status: "Can eat",
    tags: ["Protein", "Meat", "Poultry"],
  },
  {
    name: "Beef",
    isAIP: true,
    status: "Can eat",
    tags: ["Protein", "Meat", "Red meat"],
  },
  {
    name: "Lamb",
    isAIP: true,
    status: "Can eat",
    tags: ["Protein", "Meat", "Red meat"],
  },
  {
    name: "Pork",
    isAIP: false,
    status: "Can't eat",
    tags: ["Protein", "Meat", "Red meat"],
  },
  {
    name: "Fish (wild-caught)",
    isAIP: true,
    status: "Can eat",
    tags: ["Protein", "Seafood", "Omega-3"],
  },
  {
    name: "Shellfish",
    isAIP: true,
    status: "Can eat",
    tags: ["Protein", "Seafood"],
  },
  {
    name: "Eggs",
    isAIP: false,
    status: "Can't eat",
    tags: ["Protein"],
    tooltip: "Egg proteins can trigger immune responses. Eliminated even if pasture-raised.",
  },
  {
    name: "Tofu",
    isAIP: false,
    status: "Can't eat",
    tags: ["Protein", "Soy", "Legume"],
  },

  // Animal Proteins
  {
    name: "Grass-fed beef",
    isAIP: true,
    status: "Can eat",
    tags: ["Protein", "Meat", "Red meat", "Animal Protein"],
  },
  {
    name: "Bison",
    isAIP: true,
    status: "Can eat",
    tags: ["Protein", "Meat", "Red meat", "Game meat", "Animal Protein"],
  },
  {
    name: "Duck",
    isAIP: true,
    status: "Can eat",
    tags: ["Protein", "Meat", "Poultry", "Animal Protein"],
  },
  {
    name: "Rabbit",
    isAIP: true,
    status: "Can eat",
    tags: ["Protein", "Meat", "Game meat", "Animal Protein"],
  },
  {
    name: "Beef liver",
    isAIP: true,
    status: "Can eat",
    tags: ["Protein", "Meat", "Organ meat", "Nutrient-dense", "Animal Protein"],
  },
  {
    name: "Chicken liver",
    isAIP: true,
    status: "Can eat",
    tags: ["Protein", "Meat", "Organ meat", "Nutrient-dense", "Animal Protein"],
  },
  {
    name: "Lamb liver",
    isAIP: true,
    status: "Can eat",
    tags: ["Protein", "Meat", "Organ meat", "Nutrient-dense", "Animal Protein"],
  },
  {
    name: "Beef heart",
    isAIP: true,
    status: "Can eat",
    tags: ["Protein", "Meat", "Organ meat", "Nutrient-dense", "Animal Protein"],
  },
  {
    name: "Venison (deer)",
    isAIP: true,
    status: "Can eat",
    tags: ["Protein", "Meat", "Game meat", "Red meat", "Animal Protein"],
  },
  {
    name: "Elk",
    isAIP: true,
    status: "Can eat",
    tags: ["Protein", "Meat", "Game meat", "Red meat", "Animal Protein"],
  },
  {
    name: "Salmon",
    isAIP: true,
    status: "Can eat",
    tags: ["Protein", "Seafood", "Fish", "Omega-3", "Animal Protein"],
  },
  {
    name: "Sardines",
    isAIP: true,
    status: "Can eat",
    tags: ["Protein", "Seafood", "Fish", "Omega-3", "Nutrient-dense", "Animal Protein"],
  },
  {
    name: "Mackerel (small, Atlantic)",
    isAIP: true,
    status: "Can eat",
    tags: ["Protein", "Seafood", "Fish", "Omega-3", "Animal Protein"],
  },
  {
    name: "Cod",
    isAIP: true,
    status: "Can eat",
    tags: ["Protein", "Seafood", "Fish", "White fish", "Animal Protein"],
  },
  {
    name: "Shrimp",
    isAIP: true,
    status: "Can eat",
    tags: ["Protein", "Seafood", "Shellfish", "Animal Protein"],
  },
  {
    name: "Scallops",
    isAIP: true,
    status: "Can eat",
    tags: ["Protein", "Seafood", "Shellfish", "Animal Protein"],
  },
  {
    name: "Oysters",
    isAIP: true,
    status: "Can eat",
    tags: ["Protein", "Seafood", "Shellfish", "Nutrient-dense", "Animal Protein"],
  },

  // Vegetables
  {
    name: "Broccoli",
    isAIP: true,
    status: "Can eat",
    tags: ["Vegetable", "Cruciferous"],
  },
  {
    name: "Cauliflower",
    isAIP: true,
    status: "Can eat",
    tags: ["Vegetable", "Cruciferous"],
  },
  {
    name: "Cabbage",
    isAIP: true,
    status: "Can eat",
    tags: ["Vegetable", "Cruciferous"],
  },
  {
    name: "Brussels sprouts",
    isAIP: true,
    status: "Can eat",
    tags: ["Vegetable", "Cruciferous"],
  },
  {
    name: "Carrots",
    isAIP: true,
    status: "Can eat",
    tags: ["Vegetable", "Root"],
  },
  {
    name: "Beets",
    isAIP: true,
    status: "Can eat",
    tags: ["Vegetable", "Root"],
  },
  {
    name: "Sweet Potatoes",
    isAIP: true,
    status: "Can eat",
    tags: ["Vegetable", "Starchy", "Root"],
  },
  {
    name: "Parsnips",
    isAIP: true,
    status: "Can eat",
    tags: ["Vegetable", "Root"],
  },
  {
    name: "Turnips",
    isAIP: true,
    status: "Can eat",
    tags: ["Vegetable", "Root"],
  },
  {
    name: "Rutabaga",
    isAIP: true,
    status: "Can eat",
    tags: ["Vegetable", "Root"],
  },
  {
    name: "Kale",
    isAIP: true,
    status: "Can eat",
    tags: ["Vegetable", "Leafy green", "Cruciferous"],
  },
  {
    name: "Spinach",
    isAIP: true,
    status: "Can eat",
    tags: ["Vegetable", "Leafy green"],
  },
  {
    name: "Arugula",
    isAIP: true,
    status: "Can eat",
    tags: ["Vegetable", "Leafy green"],
  },
  {
    name: "Chard",
    isAIP: true,
    status: "Can eat",
    tags: ["Vegetable", "Leafy green"],
  },
  {
    name: "Lettuce",
    isAIP: true,
    status: "Can eat",
    tags: ["Vegetable", "Leafy green"],
  },
  {
    name: "Celery",
    isAIP: true,
    status: "Can eat",
    tags: ["Vegetable"],
  },
  {
    name: "Fennel",
    isAIP: true,
    status: "Can eat",
    tags: ["Vegetable"],
  },
  {
    name: "Zucchini",
    isAIP: true,
    status: "Can eat",
    tags: ["Vegetable", "Summer squash"],
  },
  {
    name: "Cucumber",
    isAIP: true,
    status: "Can eat",
    tags: ["Vegetable"],
  },
  {
    name: "Radishes",
    isAIP: true,
    status: "Can eat",
    tags: ["Vegetable", "Root"],
  },
  {
    name: "Mushrooms",
    isAIP: true,
    status: "Can eat",
    tags: ["Vegetable", "Fungi"],
  },
  {
    name: "Onions",
    isAIP: true,
    status: "Can eat",
    tags: ["Vegetable", "Allium"],
  },
  {
    name: "Garlic",
    isAIP: true,
    status: "Can eat",
    tags: ["Vegetable", "Allium"],
  },
  {
    name: "Leeks",
    isAIP: true,
    status: "Can eat",
    tags: ["Vegetable", "Allium"],
  },
  {
    name: "Asparagus",
    isAIP: true,
    status: "Can eat",
    tags: ["Vegetable"],
  },
  {
    name: "Tomatoes",
    isAIP: false,
    status: "Can't eat",
    tags: ["Vegetable", "Nightshade"],
  },
  {
    name: "Peppers",
    isAIP: false,
    status: "Can't eat",
    tags: ["Vegetable", "Nightshade"],
  },
  {
    name: "Eggplant",
    isAIP: false,
    status: "Can't eat",
    tags: ["Vegetable", "Nightshade"],
  },
  {
    name: "Potatoes",
    isAIP: false,
    status: "Can't eat",
    tags: ["Vegetable", "Starchy", "Nightshade"],
  },

  // Fruits
  {
    name: "Apples",
    isAIP: true,
    status: "Can eat",
    tags: ["Fruit"],
  },
  {
    name: "Bananas",
    isAIP: true,
    status: "Can eat",
    tags: ["Fruit"],
  },
  {
    name: "Blueberries",
    isAIP: true,
    status: "Can eat",
    tags: ["Fruit", "Berry", "Antioxidant-rich"],
  },
  {
    name: "Strawberries",
    isAIP: true,
    status: "Can eat",
    tags: ["Fruit", "Berry", "Antioxidant-rich"],
  },
  {
    name: "Raspberries",
    isAIP: true,
    status: "Can eat",
    tags: ["Fruit", "Berry", "Antioxidant-rich"],
  },
  {
    name: "Pears",
    isAIP: true,
    status: "Can eat",
    tags: ["Fruit"],
  },
  {
    name: "Peaches",
    isAIP: true,
    status: "Can eat",
    tags: ["Fruit"],
  },
  {
    name: "Mango",
    isAIP: true,
    status: "Can eat",
    tags: ["Fruit", "Tropical"],
  },
  {
    name: "Papaya",
    isAIP: true,
    status: "Can eat",
    tags: ["Fruit", "Tropical"],
  },
  {
    name: "Pineapple",
    isAIP: true,
    status: "Can eat",
    tags: ["Fruit", "Tropical"],
  },
  {
    name: "Kiwi",
    isAIP: true,
    status: "Can eat",
    tags: ["Fruit"],
  },
  {
    name: "Melons",
    isAIP: true,
    status: "Can eat",
    tags: ["Fruit"],
  },
  {
    name: "Grapes",
    isAIP: true,
    status: "Can eat",
    tags: ["Fruit"],
  },
  {
    name: "Figs",
    isAIP: true,
    status: "Can eat",
    tags: ["Fruit"],
  },
  {
    name: "Dates",
    isAIP: true,
    status: "Can eat",
    tags: ["Fruit", "Dried", "Natural sweetener"],
  },
  {
    name: "Avocados",
    isAIP: true,
    status: "Can eat",
    tags: ["Fruit", "Healthy fat"],
  },
  {
    name: "Plums",
    isAIP: true,
    status: "Can eat",
    tags: ["Fruit"],
  },
  {
    name: "Cherries",
    isAIP: true,
    status: "Can eat",
    tags: ["Fruit", "Antioxidant-rich"],
  },
  {
    name: "Citrus Fruits",
    isAIP: true,
    status: "Can eat",
    tags: ["Fruit", "Vitamin C"],
  },

  // Grains
  {
    name: "Rice",
    isAIP: false,
    status: "Can't eat",
    tags: ["Grain"],
  },
  {
    name: "Wheat",
    isAIP: false,
    status: "Can't eat",
    tags: ["Grain", "Gluten"],
  },
  {
    name: "Oats",
    isAIP: false,
    status: "Can't eat",
    tags: ["Grain"],
  },
  {
    name: "Corn",
    isAIP: false,
    status: "Can't eat",
    tags: ["Grain"],
  },
  {
    name: "Quinoa",
    isAIP: false,
    status: "Can't eat",
    tags: ["Pseudo-grain"],
  },
  {
    name: "Barley",
    isAIP: false,
    status: "Can't eat",
    tags: ["Grain", "Gluten"],
  },

  // Dairy
  {
    name: "Milk",
    isAIP: false,
    status: "Can't eat",
    tags: ["Dairy"],
    tooltip: "Contains casein and lactose – both can provoke immune/inflammatory reactions.",
  },
  {
    name: "Cheese",
    isAIP: false,
    status: "Can't eat",
    tags: ["Dairy"],
    tooltip: "Contains casein and lactose – both can provoke immune/inflammatory reactions.",
  },
  {
    name: "Yogurt",
    isAIP: false,
    status: "Can't eat",
    tags: ["Dairy", "Fermented"],
    tooltip: "Contains casein and lactose – both can provoke immune/inflammatory reactions.",
  },
  {
    name: "Butter",
    isAIP: false,
    status: "Can't eat",
    tags: ["Dairy"],
    tooltip: "Contains casein and lactose – both can provoke immune/inflammatory reactions.",
  },
  {
    name: "Ghee",
    isAIP: false,
    status: "Under evaluation",
    tags: ["Dairy"],
    tooltip: "Contains casein and lactose – both can provoke immune/inflammatory reactions.",
  },

  // Nuts & Seeds
  {
    name: "Almonds",
    isAIP: false,
    status: "Can't eat",
    tags: ["Nut"],
    tooltip: "High in omega-6 fats and phytic acid, can irritate digestion or trigger flares.",
  },
  {
    name: "Walnuts",
    isAIP: false,
    status: "Can't eat",
    tags: ["Nut"],
    tooltip: "High in omega-6 fats and phytic acid, can irritate digestion or trigger flares.",
  },
  {
    name: "Cashews",
    isAIP: false,
    status: "Can't eat",
    tags: ["Nut"],
    tooltip: "High in omega-6 fats and phytic acid, can irritate digestion or trigger flares.",
  },
  {
    name: "Sunflower Seeds",
    isAIP: false,
    status: "Can't eat",
    tags: ["Seed"],
    tooltip: "High in omega-6 fats and phytic acid, can irritate digestion or trigger flares.",
  },
  {
    name: "Chia Seeds",
    isAIP: false,
    status: "Can't eat",
    tags: ["Seed"],
    tooltip: "High in omega-6 fats and phytic acid, can irritate digestion or trigger flares.",
  },
  {
    name: "Flax Seeds",
    isAIP: false,
    status: "Can't eat",
    tags: ["Seed"],
    tooltip: "High in omega-6 fats and phytic acid, can irritate digestion or trigger flares.",
  },

  // Oils & Fats
  {
    name: "Olive Oil",
    isAIP: true,
    status: "Can eat",
    tags: ["Oil", "Healthy fat"],
  },
  {
    name: "Coconut Oil",
    isAIP: true,
    status: "Can eat",
    tags: ["Oil", "Healthy fat", "Coconut"],
  },
  {
    name: "Avocado Oil",
    isAIP: true,
    status: "Can eat",
    tags: ["Oil", "Healthy fat"],
  },
  {
    name: "Lard",
    isAIP: true,
    status: "Can eat",
    tags: ["Animal fat"],
  },
  {
    name: "Tallow",
    isAIP: true,
    status: "Can eat",
    tags: ["Animal fat"],
  },
  {
    name: "Duck fat",
    isAIP: true,
    status: "Can eat",
    tags: ["Animal fat", "Healthy fat"],
  },
  {
    name: "Vegetable Oils",
    isAIP: false,
    status: "Can't eat",
    tags: ["Oil", "Inflammatory"],
  },

  // Herbs & Spices
  {
    name: "Basil",
    isAIP: true,
    status: "Can eat",
    tags: ["Herb"],
  },
  {
    name: "Thyme",
    isAIP: true,
    status: "Can eat",
    tags: ["Herb"],
  },
  {
    name: "Oregano",
    isAIP: true,
    status: "Can eat",
    tags: ["Herb"],
  },
  {
    name: "Rosemary",
    isAIP: true,
    status: "Can eat",
    tags: ["Herb"],
  },
  {
    name: "Cilantro",
    isAIP: true,
    status: "Can eat",
    tags: ["Herb"],
  },
  {
    name: "Mint",
    isAIP: true,
    status: "Can eat",
    tags: ["Herb"],
  },
  {
    name: "Dill",
    isAIP: true,
    status: "Can eat",
    tags: ["Herb"],
  },
  {
    name: "Chives",
    isAIP: true,
    status: "Can eat",
    tags: ["Herb", "Allium"],
  },
  {
    name: "Bay leaf",
    isAIP: true,
    status: "Can eat",
    tags: ["Herb"],
  },
  {
    name: "Ginger",
    isAIP: true,
    status: "Can eat",
    tags: ["Spice", "Root", "Anti-inflammatory"],
  },
  {
    name: "Turmeric",
    isAIP: true,
    status: "Can eat",
    tags: ["Spice", "Root", "Anti-inflammatory"],
  },
  {
    name: "Garlic powder",
    isAIP: true,
    status: "Can eat",
    tags: ["Spice", "Allium"],
  },
  {
    name: "Onion powder",
    isAIP: true,
    status: "Can eat",
    tags: ["Spice", "Allium"],
  },

  // Coconut Products
  {
    name: "Coconut butter",
    isAIP: true,
    status: "Can eat",
    tags: ["Coconut", "Healthy fat"],
  },
  {
    name: "Coconut milk (additive-free)",
    isAIP: true,
    status: "Can eat",
    tags: ["Coconut", "Beverage"],
  },
  {
    name: "Coconut flakes (unsweetened)",
    isAIP: true,
    status: "Can eat",
    tags: ["Coconut"],
  },
  {
    name: "Coconut flour",
    isAIP: true,
    status: "Can eat",
    tags: ["Coconut", "Flour", "Baking"],
  },

  // Fermented Foods
  {
    name: "Sauerkraut (no nightshade spices)",
    isAIP: true,
    status: "Can eat",
    tags: ["Fermented", "Probiotic", "Vegetable"],
  },
  {
    name: "Kimchi (AIP-compliant only)",
    isAIP: true,
    status: "Can eat",
    tags: ["Fermented", "Probiotic", "Vegetable"],
  },
  {
    name: "Coconut yogurt (unsweetened, additive-free)",
    isAIP: true,
    status: "Can eat",
    tags: ["Fermented", "Probiotic", "Coconut"],
  },
  {
    name: "Kombucha (no added sugar post-ferment)",
    isAIP: true,
    status: "Can eat",
    tags: ["Fermented", "Probiotic", "Beverage"],
  },

  // Beverages
  {
    name: "Peppermint tea",
    isAIP: true,
    status: "Can eat",
    tags: ["Beverage", "Tea", "Herb"],
  },
  {
    name: "Chamomile tea",
    isAIP: true,
    status: "Can eat",
    tags: ["Beverage", "Tea", "Herb"],
  },
  {
    name: "Rooibos tea",
    isAIP: true,
    status: "Can eat",
    tags: ["Beverage", "Tea"],
  },
  {
    name: "Ginger tea",
    isAIP: true,
    status: "Can eat",
    tags: ["Beverage", "Tea", "Anti-inflammatory"],
  },
  {
    name: "Hibiscus tea",
    isAIP: true,
    status: "Can eat",
    tags: ["Beverage", "Tea", "Herb"],
  },
  {
    name: "Lemon balm tea",
    isAIP: true,
    status: "Can eat",
    tags: ["Beverage", "Tea", "Herb"],
  },
  {
    name: "Valerian tea",
    isAIP: true,
    status: "Can eat",
    tags: ["Beverage", "Tea", "Herb"],
  },
  {
    name: "Lavender tea",
    isAIP: true,
    status: "Can eat",
    tags: ["Beverage", "Tea", "Herb"],
  },
  {
    name: "Licorice root tea",
    isAIP: true,
    status: "Can eat",
    tags: ["Beverage", "Tea", "Herb"],
  },
  {
    name: "Dandelion root tea",
    isAIP: true,
    status: "Can eat",
    tags: ["Beverage", "Tea", "Herb"],
  },
  {
    name: "Nettle leaf tea",
    isAIP: true,
    status: "Can eat",
    tags: ["Beverage", "Tea", "Herb"],
  },
  {
    name: "Raspberry leaf tea",
    isAIP: true,
    status: "Can eat",
    tags: ["Beverage", "Tea", "Herb"],
  },
  {
    name: "Tulsi tea",
    isAIP: true,
    status: "Can eat",
    tags: ["Beverage", "Tea", "Herb"],
  },
  {
    name: "Marshmallow root tea",
    isAIP: true,
    status: "Can eat",
    tags: ["Beverage", "Tea", "Herb"],
  },
  {
    name: "Filtered water",
    isAIP: true,
    status: "Can eat",
    tags: ["Beverage"],
  },
  {
    name: "Bone broth",
    isAIP: true,
    status: "Can eat",
    tags: ["Beverage", "Protein", "Nutrient-dense", "Gut-healing"],
  },

  // Add these specific caffeinated products
  {
    name: "Espresso",
    isAIP: false,
    status: "Can't eat",
    tags: ["Beverage", "Caffeine"],
    tooltip: "Contains caffeine which can disrupt sleep and increase stress hormones.",
  },
  {
    name: "Cappuccino",
    isAIP: false,
    status: "Can't eat",
    tags: ["Beverage", "Caffeine", "Dairy"],
    tooltip: "Contains both caffeine and dairy, both excluded on AIP.",
  },
  {
    name: "Latte",
    isAIP: false,
    status: "Can't eat",
    tags: ["Beverage", "Caffeine", "Dairy"],
    tooltip: "Contains both caffeine and dairy, both excluded on AIP.",
  },
  {
    name: "Americano",
    isAIP: false,
    status: "Can't eat",
    tags: ["Beverage", "Caffeine"],
    tooltip: "Contains caffeine which can disrupt sleep and increase stress hormones.",
  },
  {
    name: "Cold brew coffee",
    isAIP: false,
    status: "Can't eat",
    tags: ["Beverage", "Caffeine"],
    tooltip: "Contains caffeine which can disrupt sleep and increase stress hormones.",
  },
  {
    name: "Iced coffee",
    isAIP: false,
    status: "Can't eat",
    tags: ["Beverage", "Caffeine"],
    tooltip: "Contains caffeine which can disrupt sleep and increase stress hormones.",
  },
  {
    name: "Oolong tea",
    isAIP: false,
    status: "Can't eat",
    tags: ["Beverage", "Tea", "Caffeine"],
    tooltip: "Contains caffeine which can disrupt sleep and increase stress hormones.",
  },
  {
    name: "White tea",
    isAIP: false,
    status: "Can't eat",
    tags: ["Beverage", "Tea", "Caffeine"],
    tooltip: "Contains caffeine which can disrupt sleep and increase stress hormones.",
  },
  {
    name: "Chai tea",
    isAIP: false,
    status: "Can't eat",
    tags: ["Beverage", "Tea", "Caffeine", "Spices"],
    tooltip: "Contains caffeine and seed-based spices, both excluded on AIP.",
  },
  {
    name: "Yerba mate",
    isAIP: false,
    status: "Can't eat",
    tags: ["Beverage", "Tea", "Caffeine"],
    tooltip: "Contains caffeine which can disrupt sleep and increase stress hormones.",
  },
  {
    name: "Red Bull",
    isAIP: false,
    status: "Can't eat",
    tags: ["Beverage", "Caffeine", "Energy drink", "Processed"],
    tooltip: "Contains caffeine, sugar, and additives - all excluded on AIP.",
  },
  {
    name: "Monster Energy",
    isAIP: false,
    status: "Can't eat",
    tags: ["Beverage", "Caffeine", "Energy drink", "Processed"],
    tooltip: "Contains caffeine, sugar, and additives - all excluded on AIP.",
  },
  {
    name: "Pre-workout supplements",
    isAIP: false,
    status: "Can't eat",
    tags: ["Beverage", "Caffeine", "Supplement", "Processed"],
    tooltip: "Contains caffeine, artificial ingredients, and often seed-based ingredients.",
  },
  {
    name: "Caffeinated water",
    isAIP: false,
    status: "Can't eat",
    tags: ["Beverage", "Caffeine", "Processed"],
    tooltip: "Contains caffeine which can disrupt sleep and increase stress hormones.",
  },
  {
    name: "Caffeinated gum",
    isAIP: false,
    status: "Can't eat",
    tags: ["Caffeine", "Processed", "Gum"],
    tooltip: "Contains caffeine and artificial ingredients, both excluded on AIP.",
  },
  {
    name: "Chocolate covered espresso beans",
    isAIP: false,
    status: "Can't eat",
    tags: ["Caffeine", "Chocolate", "Coffee", "Processed"],
    tooltip: "Contains caffeine, chocolate (seed-based), and coffee beans.",
  },

  // Flours & Starches
  {
    name: "Cassava flour",
    isAIP: true,
    status: "Can eat",
    tags: ["Flour", "Starch", "Baking"],
  },
  {
    name: "Tigernut flour",
    isAIP: true,
    status: "Can eat",
    tags: ["Flour", "Baking"],
  },
  {
    name: "Arrowroot flour",
    isAIP: true,
    status: "Can eat",
    tags: ["Flour", "Starch", "Thickener", "Baking"],
  },
  {
    name: "Tapioca flour",
    isAIP: true,
    status: "Can eat",
    tags: ["Flour", "Starch", "Thickener", "Baking"],
  },

  // Seaweeds
  {
    name: "Nori",
    isAIP: true,
    status: "Can eat",
    tags: ["Seaweed", "Nutrient-dense"],
  },
  {
    name: "Wakame",
    isAIP: true,
    status: "Can eat",
    tags: ["Seaweed", "Nutrient-dense"],
  },
  {
    name: "Dulse",
    isAIP: true,
    status: "Can eat",
    tags: ["Seaweed", "Nutrient-dense"],
  },

  // Gelatin & Thickeners
  {
    name: "Gelatin (grass-fed, unflavored)",
    isAIP: true,
    status: "Can eat",
    tags: ["Thickener", "Protein", "Gut-healing"],
  },
  {
    name: "Carob",
    isAIP: true,
    status: "Can eat",
    tags: ["Chocolate substitute", "Baking"],
  },

  // Sweeteners
  {
    name: "Maple syrup",
    isAIP: true,
    status: "Can eat",
    tags: ["Sweetener", "Natural sweetener"],
  },
  {
    name: "Honey",
    isAIP: true,
    status: "Can eat",
    tags: ["Sweetener", "Natural sweetener"],
  },
  {
    name: "Coconut palm sugar",
    isAIP: true,
    status: "Can eat",
    tags: ["Sweetener", "Natural sweetener"],
  },
  {
    name: "Molasses",
    isAIP: true,
    status: "Can eat",
    tags: ["Sweetener", "Natural sweetener", "Nutrient-dense"],
  },

  // Legumes
  {
    name: "Peanuts",
    isAIP: false,
    status: "Can't eat",
    tags: ["Legume", "Nut", "Allergen"],
  },
  {
    name: "Soybeans",
    isAIP: false,
    status: "Can't eat",
    tags: ["Legume", "Allergen"],
  },
  {
    name: "Chickpeas",
    isAIP: false,
    status: "Can't eat",
    tags: ["Legume"],
  },
  {
    name: "Lentils",
    isAIP: false,
    status: "Can't eat",
    tags: ["Legume"],
  },
  {
    name: "Black beans",
    isAIP: false,
    status: "Can't eat",
    tags: ["Legume"],
  },
  {
    name: "Kidney beans",
    isAIP: false,
    status: "Can't eat",
    tags: ["Legume"],
  },
  {
    name: "Pinto beans",
    isAIP: false,
    status: "Can't eat",
    tags: ["Legume"],
  },
  {
    name: "Lima beans",
    isAIP: false,
    status: "Can't eat",
    tags: ["Legume"],
  },
  {
    name: "Navy beans",
    isAIP: false,
    status: "Can't eat",
    tags: ["Legume"],
  },
  {
    name: "Fava beans",
    isAIP: false,
    status: "Can't eat",
    tags: ["Legume"],
  },
  {
    name: "Green peas",
    isAIP: false,
    status: "Can't eat",
    tags: ["Legume"],
  },
  {
    name: "Snow peas",
    isAIP: false,
    status: "Can't eat",
    tags: ["Legume"],
  },
  {
    name: "Edamame",
    isAIP: false,
    status: "Can't eat",
    tags: ["Legume", "Soy"],
  },

  // Additional Grains
  {
    name: "Rye",
    isAIP: false,
    status: "Can't eat",
    tags: ["Grain", "Gluten"],
  },
  {
    name: "Millet",
    isAIP: false,
    status: "Can't eat",
    tags: ["Grain"],
  },
  {
    name: "Sorghum",
    isAIP: false,
    status: "Can't eat",
    tags: ["Grain"],
  },
  {
    name: "Buckwheat",
    isAIP: false,
    status: "Can't eat",
    tags: ["Pseudo-grain"],
  },
  {
    name: "Amaranth",
    isAIP: false,
    status: "Can't eat",
    tags: ["Pseudo-grain"],
  },
  {
    name: "Bulgur",
    isAIP: false,
    status: "Can't eat",
    tags: ["Grain", "Wheat"],
  },
  {
    name: "Spelt",
    isAIP: false,
    status: "Can't eat",
    tags: ["Grain", "Gluten"],
  },
  {
    name: "Teff",
    isAIP: false,
    status: "Can't eat",
    tags: ["Grain"],
  },
  {
    name: "Triticale",
    isAIP: false,
    status: "Can't eat",
    tags: ["Grain", "Gluten"],
  },
  {
    name: "Farro",
    isAIP: false,
    status: "Can't eat",
    tags: ["Grain", "Gluten"],
  },

  // Additional Nightshades
  {
    name: "Bell peppers (all colors)",
    isAIP: false,
    status: "Can't eat",
    tags: ["Vegetable", "Nightshade"],
  },
  {
    name: "Chili peppers",
    isAIP: false,
    status: "Can't eat",
    tags: ["Vegetable", "Nightshade", "Spice"],
  },
  {
    name: "Cayenne",
    isAIP: false,
    status: "Can't eat",
    tags: ["Spice", "Nightshade"],
  },
  {
    name: "Jalapeños",
    isAIP: false,
    status: "Can't eat",
    tags: ["Vegetable", "Nightshade", "Spice"],
  },
  {
    name: "Goji berries",
    isAIP: false,
    status: "Can't eat",
    tags: ["Fruit", "Nightshade"],
  },
  {
    name: "Paprika",
    isAIP: false,
    status: "Can't eat",
    tags: ["Spice", "Nightshade"],
  },
  {
    name: "Pimentos",
    isAIP: false,
    status: "Can't eat",
    tags: ["Vegetable", "Nightshade"],
  },
  {
    name: "Tomatillos",
    isAIP: false,
    status: "Can't eat",
    tags: ["Vegetable", "Nightshade"],
  },
  {
    name: "Hot sauces",
    isAIP: false,
    status: "Can't eat",
    tags: ["Condiment", "Nightshade", "Processed"],
  },

  // Additional Nuts & Seeds
  {
    name: "Pecans",
    isAIP: false,
    status: "Can't eat",
    tags: ["Nut"],
    tooltip: "High in omega-6 fats and phytic acid, can irritate digestion or trigger flares.",
  },
  {
    name: "Pistachios",
    isAIP: false,
    status: "Can't eat",
    tags: ["Nut"],
    tooltip: "High in omega-6 fats and phytic acid, can irritate digestion or trigger flares.",
  },
  {
    name: "Brazil nuts",
    isAIP: false,
    status: "Can't eat",
    tags: ["Nut"],
    tooltip: "High in omega-6 fats and phytic acid, can irritate digestion or trigger flares.",
  },
  {
    name: "Macadamia nuts",
    isAIP: false,
    status: "Can't eat",
    tags: ["Nut"],
    tooltip: "High in omega-6 fats and phytic acid, can irritate digestion or trigger flares.",
  },
  {
    name: "Hazelnuts",
    isAIP: false,
    status: "Can't eat",
    tags: ["Nut"],
    tooltip: "High in omega-6 fats and phytic acid, can irritate digestion or trigger flares.",
  },
  {
    name: "Hemp seeds",
    isAIP: false,
    status: "Can't eat",
    tags: ["Seed"],
    tooltip: "High in omega-6 fats and phytic acid, can irritate digestion or trigger flares.",
  },
  {
    name: "Sesame seeds",
    isAIP: false,
    status: "Can't eat",
    tags: ["Seed", "Allergen"],
    tooltip: "High in omega-6 fats and phytic acid, can irritate digestion or trigger flares.",
  },
  {
    name: "Pumpkin seeds",
    isAIP: false,
    status: "Can't eat",
    tags: ["Seed"],
    tooltip: "High in omega-6 fats and phytic acid, can irritate digestion or trigger flares.",
  },
  {
    name: "Poppy seeds",
    isAIP: false,
    status: "Can't eat",
    tags: ["Seed"],
    tooltip: "High in omega-6 fats and phytic acid, can irritate digestion or trigger flares.",
  },

  // Seed-based Spices
  {
    name: "Black pepper",
    isAIP: false,
    status: "Can't eat",
    tags: ["Spice", "Seed-based"],
  },
  {
    name: "Cumin",
    isAIP: false,
    status: "Can't eat",
    tags: ["Spice", "Seed-based"],
  },
  {
    name: "Coriander seed",
    isAIP: false,
    status: "Can't eat",
    tags: ["Spice", "Seed-based"],
  },
  {
    name: "Fennel seed",
    isAIP: false,
    status: "Can't eat",
    tags: ["Spice", "Seed-based"],
  },
  {
    name: "Mustard seed",
    isAIP: false,
    status: "Can't eat",
    tags: ["Spice", "Seed-based", "Allergen"],
  },
  {
    name: "Celery seed",
    isAIP: false,
    status: "Can't eat",
    tags: ["Spice", "Seed-based"],
  },
  {
    name: "Dill seed",
    isAIP: false,
    status: "Can't eat",
    tags: ["Spice", "Seed-based"],
  },
  {
    name: "Nutmeg",
    isAIP: false,
    status: "Can't eat",
    tags: ["Spice", "Seed-based"],
  },
  {
    name: "Anise",
    isAIP: false,
    status: "Can't eat",
    tags: ["Spice", "Seed-based"],
  },
  {
    name: "Caraway",
    isAIP: false,
    status: "Can't eat",
    tags: ["Spice", "Seed-based"],
  },
  {
    name: "Cardamom",
    isAIP: false,
    status: "Can't eat",
    tags: ["Spice", "Seed-based"],
  },

  // Eggs
  {
    name: "Chicken eggs",
    isAIP: false,
    status: "Can't eat",
    tags: ["Egg", "Protein", "Allergen"],
    tooltip: "Egg proteins can trigger immune responses. Eliminated even if pasture-raised.",
  },
  {
    name: "Duck eggs",
    isAIP: false,
    status: "Can't eat",
    tags: ["Egg", "Protein"],
    tooltip: "Egg proteins can trigger immune responses. Eliminated even if pasture-raised.",
  },
  {
    name: "Quail eggs",
    isAIP: false,
    status: "Can't eat",
    tags: ["Egg", "Protein"],
    tooltip: "Egg proteins can trigger immune responses. Eliminated even if pasture-raised.",
  },
  {
    name: "Egg yolks",
    isAIP: false,
    status: "Can't eat",
    tags: ["Egg", "Protein"],
    tooltip: "Egg proteins can trigger immune responses. Eliminated even if pasture-raised.",
  },
  {
    name: "Egg whites",
    isAIP: false,
    status: "Can't eat",
    tags: ["Egg", "Protein", "Allergen"],
    tooltip: "Egg proteins can trigger immune responses. Eliminated even if pasture-raised.",
  },

  // Additional Dairy
  {
    name: "Kefir",
    isAIP: false,
    status: "Can't eat",
    tags: ["Dairy", "Fermented", "Probiotic"],
    tooltip: "Contains casein and lactose – both can provoke immune/inflammatory reactions.",
  },
  {
    name: "Cream",
    isAIP: false,
    status: "Can't eat",
    tags: ["Dairy"],
    tooltip: "Contains casein and lactose – both can provoke immune/inflammatory reactions.",
  },
  {
    name: "Ice cream",
    isAIP: false,
    status: "Can't eat",
    tags: ["Dairy", "Dessert", "Processed"],
    tooltip: "Contains casein and lactose – both can provoke immune/inflammatory reactions.",
  },
  {
    name: "Whey protein",
    isAIP: false,
    status: "Can't eat",
    tags: ["Dairy", "Protein", "Supplement"],
    tooltip: "Contains casein and lactose – both can provoke immune/inflammatory reactions.",
  },
  {
    name: "Casein protein",
    isAIP: false,
    status: "Can't eat",
    tags: ["Dairy", "Protein", "Allergen"],
    tooltip: "Contains casein and lactose – both can provoke immune/inflammatory reactions.",
  },
  {
    name: "Cow milk",
    isAIP: false,
    status: "Can't eat",
    tags: ["Dairy", "Allergen"],
    tooltip: "Contains casein and lactose – both can provoke immune/inflammatory reactions.",
  },
  {
    name: "Goat milk",
    isAIP: false,
    status: "Can't eat",
    tags: ["Dairy"],
    tooltip: "Contains casein and lactose – both can provoke immune/inflammatory reactions.",
  },
  {
    name: "Sheep milk",
    isAIP: false,
    status: "Can't eat",
    tags: ["Dairy"],
    tooltip: "Contains casein and lactose – both can provoke immune/inflammatory reactions.",
  },

  // Chocolate & Cocoa
  {
    name: "Cocoa powder",
    isAIP: false,
    status: "Can't eat",
    tags: ["Chocolate", "Seed-based"],
    tooltip: "Seed-based and can be inflammatory, especially with sugar or dairy.",
  },
  {
    name: "Chocolate bars",
    isAIP: false,
    status: "Can't eat",
    tags: ["Chocolate", "Processed", "Dessert"],
    tooltip: "Seed-based and can be inflammatory, especially with sugar or dairy.",
  },
  {
    name: "Hot chocolate",
    isAIP: false,
    status: "Can't eat",
    tags: ["Chocolate", "Beverage", "Processed"],
    tooltip: "Seed-based and can be inflammatory, especially with sugar or dairy.",
  },
  {
    name: "Cacao nibs",
    isAIP: false,
    status: "Can't eat",
    tags: ["Chocolate", "Seed-based"],
    tooltip: "Seed-based and can be inflammatory, especially with sugar or dairy.",
  },

  // Sweeteners
  {
    name: "Refined white sugar",
    isAIP: false,
    status: "Can't eat",
    tags: ["Sweetener", "Processed"],
  },
  {
    name: "Brown sugar",
    isAIP: false,
    status: "Can't eat",
    tags: ["Sweetener", "Processed"],
  },
  {
    name: "Cane sugar",
    isAIP: false,
    status: "Can't eat",
    tags: ["Sweetener", "Processed"],
  },
  {
    name: "Agave syrup",
    isAIP: false,
    status: "Can't eat",
    tags: ["Sweetener", "Processed"],
  },
  {
    name: "Corn syrup",
    isAIP: false,
    status: "Can't eat",
    tags: ["Sweetener", "Processed", "Corn"],
  },
  {
    name: "Aspartame",
    isAIP: false,
    status: "Can't eat",
    tags: ["Sweetener", "Artificial", "Processed"],
  },
  {
    name: "Sucralose",
    isAIP: false,
    status: "Can't eat",
    tags: ["Sweetener", "Artificial", "Processed"],
  },
  {
    name: "Saccharin",
    isAIP: false,
    status: "Can't eat",
    tags: ["Sweetener", "Artificial", "Processed"],
  },
  {
    name: "Stevia",
    isAIP: false,
    status: "Can't eat",
    tags: ["Sweetener", "Natural alternative"],
  },
  {
    name: "Monk fruit extract",
    isAIP: false,
    status: "Can't eat",
    tags: ["Sweetener", "Natural alternative"],
  },

  // Processed Foods
  {
    name: "Bread",
    isAIP: false,
    status: "Can't eat",
    tags: ["Grain", "Processed", "Gluten"],
  },
  {
    name: "Pasta",
    isAIP: false,
    status: "Can't eat",
    tags: ["Grain", "Processed", "Gluten"],
  },
  {
    name: "Cereal",
    isAIP: false,
    status: "Can't eat",
    tags: ["Grain", "Processed", "Breakfast"],
  },
  {
    name: "Tortillas",
    isAIP: false,
    status: "Can't eat",
    tags: ["Grain", "Processed"],
  },
  {
    name: "Crackers",
    isAIP: false,
    status: "Can't eat",
    tags: ["Grain", "Processed", "Snack"],
  },
  {
    name: "Cakes, cookies, donuts",
    isAIP: false,
    status: "Can't eat",
    tags: ["Grain", "Processed", "Dessert", "Baked goods"],
  },
  {
    name: "Energy bars",
    isAIP: false,
    status: "Can't eat",
    tags: ["Processed", "Snack"],
  },
  {
    name: "Granola",
    isAIP: false,
    status: "Can't eat",
    tags: ["Grain", "Processed", "Breakfast"],
  },
  {
    name: "Processed meat",
    isAIP: false,
    status: "Can't eat",
    tags: ["Meat", "Processed"],
  },
  {
    name: "Pre-packaged sauces",
    isAIP: false,
    status: "Can't eat",
    tags: ["Processed", "Condiment"],
  },
  {
    name: "Pre-packaged dressings",
    isAIP: false,
    status: "Can't eat",
    tags: ["Processed", "Condiment"],
  },

  // Beverages
  {
    name: "Coffee",
    isAIP: false,
    status: "Can't eat",
    tags: ["Beverage", "Caffeine"],
  },
  {
    name: "Decaf coffee",
    isAIP: false,
    status: "Can't eat",
    tags: ["Beverage"],
  },
  {
    name: "Green tea",
    isAIP: false,
    status: "Can't eat",
    tags: ["Beverage", "Tea", "Caffeine"],
    tooltip: "Excluded due to caffeine and compounds like theobromine.",
  },
  {
    name: "Black tea",
    isAIP: false,
    status: "Can't eat",
    tags: ["Beverage", "Tea", "Caffeine"],
    tooltip: "Excluded due to caffeine and compounds like theobromine.",
  },
  {
    name: "Matcha",
    isAIP: false,
    status: "Can't eat",
    tags: ["Beverage", "Tea", "Caffeine"],
    tooltip: "Excluded due to caffeine and compounds like theobromine.",
  },
  {
    name: "Alcohol",
    isAIP: false,
    status: "Can't eat",
    tags: ["Beverage", "Alcohol"],
  },
  {
    name: "Beer",
    isAIP: false,
    status: "Can't eat",
    tags: ["Beverage", "Alcohol", "Grain"],
  },
  {
    name: "Wine",
    isAIP: false,
    status: "Can't eat",
    tags: ["Beverage", "Alcohol"],
  },
  {
    name: "Liquor",
    isAIP: false,
    status: "Can't eat",
    tags: ["Beverage", "Alcohol"],
  },
  {
    name: "Energy drinks",
    isAIP: false,
    status: "Can't eat",
    tags: ["Beverage", "Caffeine", "Processed"],
  },
  {
    name: "Soda",
    isAIP: false,
    status: "Can't eat",
    tags: ["Beverage", "Processed"],
  },
  {
    name: "Juice with added sugar",
    isAIP: false,
    status: "Can't eat",
    tags: ["Beverage", "Processed", "Sweetened"],
  },

  // High-Mercury Fish
  {
    name: "Tuna",
    isAIP: false,
    status: "Can't eat",
    tags: ["Protein", "Seafood", "Fish", "High-mercury"],
    tooltip: "High in mercury which may impair detoxification, especially during healing.",
  },
  {
    name: "Swordfish",
    isAIP: false,
    status: "Can't eat",
    tags: ["Protein", "Seafood", "Fish", "High-mercury"],
    tooltip: "High in mercury which may impair detoxification, especially during healing.",
  },
  {
    name: "King mackerel",
    isAIP: false,
    status: "Can't eat",
    tags: ["Protein", "Seafood", "Fish", "High-mercury"],
    tooltip: "High in mercury which may impair detoxification, especially during healing.",
  },
  {
    name: "Tilefish",
    isAIP: false,
    status: "Can't eat",
    tags: ["Protein", "Seafood", "Fish", "High-mercury"],
    tooltip: "High in mercury which may impair detoxification, especially during healing.",
  },
  {
    name: "Shark",
    isAIP: false,
    status: "Can't eat",
    tags: ["Protein", "Seafood", "Fish", "High-mercury"],
    tooltip: "High in mercury which may impair detoxification, especially during healing.",
  },
  {
    name: "Marlin",
    isAIP: false,
    status: "Can't eat",
    tags: ["Protein", "Seafood", "Fish", "High-mercury"],
    tooltip: "High in mercury which may impair detoxification, especially during healing.",
  },

  // Food Additives
  {
    name: "Carrageenan",
    isAIP: false,
    status: "Can't eat",
    tags: ["Additive", "Thickener", "Processed"],
  },
  {
    name: "Guar gum",
    isAIP: false,
    status: "Can't eat",
    tags: ["Additive", "Thickener", "Processed"],
  },
  {
    name: "Xanthan gum",
    isAIP: false,
    status: "Can't eat",
    tags: ["Additive", "Thickener", "Processed"],
  },
  {
    name: "Soy lecithin",
    isAIP: false,
    status: "Can't eat",
    tags: ["Additive", "Soy", "Processed"],
  },
]

// Remove "5-Hour Energy" from allProducts
const allProductsWithout5HourEnergy = allProducts.filter((product) => product.name !== "5-Hour Energy")

// Sort products alphabetically by name
const sortedProducts = [...allProductsWithout5HourEnergy].sort((a, b) => a.name.localeCompare(b.name))

// Get all unique tags for filtering
const allTags = Array.from(new Set(allProducts.flatMap((item) => item.tags))).sort()

export default function FoodList() {
  // Add a new state to track how many items to show
  const [itemsToShow, setItemsToShow] = useState(12)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [currentPhase, setCurrentPhase] = useState<string>("elimination")
  const [adaptationDay, setAdaptationDay] = useState(0)
  const [sortBy, setSortBy] = useState<"name" | "status">("name")
  const [showTagDropdown, setShowTagDropdown] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)
  const [userModifiedStatuses, setUserModifiedStatuses] = useState<Record<string, string>>({})

  // Router for navigation
  const router = useRouter()

  // Effect to load diet phase, favorites, and user statuses on component mount
  useEffect(() => {
    // Determine current diet phase
    const { phase, adaptationDay: day } = determineDietPhase()
    setCurrentPhase(phase)
    setAdaptationDay(day)

    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem("aipFavorites")
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }

    // Load user modified statuses from localStorage
    const savedStatuses = localStorage.getItem("userModifiedStatuses")
    if (savedStatuses) {
      setUserModifiedStatuses(JSON.parse(savedStatuses))
    }
  }, [])

  // Toggle product favorite status
  const toggleFavorite = (productName: string) => {
    const newFavorites = favorites.includes(productName)
      ? favorites.filter((name) => name !== productName)
      : [...favorites, productName]

    setFavorites(newFavorites)
    localStorage.setItem("aipFavorites", JSON.stringify(newFavorites))
  }

  // Update product status
  const updateProductStatus = (productName: string, status: string) => {
    const newStatuses = { ...userModifiedStatuses, [productName]: status }
    setUserModifiedStatuses(newStatuses)
    localStorage.setItem("userModifiedStatuses", JSON.stringify(newStatuses))
  }

  // Update the getProductStatus function to replace "Can't eat yet" with "Can't eat"
  const getProductStatus = (product: any) => {
    // Check if the user has manually modified the status
    if (userModifiedStatuses[product.name]) {
      return userModifiedStatuses[product.name]
    }

    // If in adaptation phase, apply the progressive restrictions
    if (currentPhase === "adaptation") {
      // Days 1-7: Only caffeine is restricted
      if (adaptationDay <= 7) {
        if (containsCaffeine(product)) {
          return "Can't eat"
        }
        // All other products (including non-AIP) are "Can eat" during adaptation
        return "Can eat"
      }

      // Days 8-14: Caffeine and alcohol are restricted
      if (adaptationDay <= 14) {
        if (containsCaffeine(product) || containsAlcohol(product)) {
          return "Can't eat"
        }
        // All other products (including non-AIP) are "Can eat"
        return "Can eat"
      }

      // Days 15-28: Caffeine, alcohol, and sugar are restricted
      if (adaptationDay <= 28) {
        if (containsCaffeine(product) || containsAlcohol(product) || containsSugar(product)) {
          return "Can't eat"
        }
        // All other products (including non-AIP) are "Can eat"
        return "Can eat"
      }
    }

    // If in elimination phase, non-AIP items are "Can't eat"
    if (currentPhase === "elimination" && !product.isAIP) {
      return "Can't eat"
    }

    // If in reintroduction phase, non-AIP items are "Under evaluation"
    if (currentPhase === "reintroduction" && !product.isAIP) {
      return "Under evaluation"
    }

    // Default to the product's original status
    return product.status
  }

  // Filter and sort products based on user selections
  const filteredProducts = sortedProducts
    .filter((product) => {
      // Apply search filter
      const matchesSearch =
        searchQuery === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      // Apply tag filter
      const matchesTags = selectedTags.length === 0 || selectedTags.every((tag) => product.tags.includes(tag))

      // Apply favorites filter
      const matchesFavorites = !showOnlyFavorites || favorites.includes(product.name)

      return matchesSearch && matchesTags && matchesFavorites
    })
    .sort((a, b) => {
      // Update the status order in the sort function
      if (sortBy === "status") {
        // Sort by status (Can eat, Can't eat, Under evaluation)
        const statusA = getProductStatus(a)
        const statusB = getProductStatus(b)

        const statusOrder = {
          "Can eat": 0,
          "Can't eat": 1,
          "Under evaluation": 2,
        }

        return (statusOrder[statusA] ?? 999) - (statusOrder[statusB] ?? 999) || a.name.localeCompare(b.name)
      }
      // Default sort by name
      return a.name.localeCompare(b.name)
    })

  // Update the productsByStatus object to remove "Can't eat yet"
  const productsByStatus = {
    "Can eat": filteredProducts.filter((p) => getProductStatus(p) === "Can eat"),
    "Can't eat": filteredProducts.filter((p) => getProductStatus(p) === "Can't eat"),
    "Under evaluation": filteredProducts.filter((p) => getProductStatus(p) === "Under evaluation"),
  }

  // Handle navigation
  const handleNavigation = (path: string) => {
    router.push(path)
  }

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("")
    setSelectedTags([])
    setShowOnlyFavorites(false)
  }

  // Get classes for status badge
  const getStatusClasses = (status: string) => {
    switch (status) {
      case "Can eat":
        return "bg-green-100 text-green-800"
      case "Can't eat":
        return "bg-red-100 text-red-800"
      case "Under evaluation":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Get phase indicator text
  const getPhaseIndicator = () => {
    switch (currentPhase) {
      case "adaptation":
        return `Adaptation Phase - Day ${adaptationDay}`
      case "elimination":
        return "Elimination Phase"
      case "reintroduction":
        return "Reintroduction Phase"
      default:
        return "Unknown Phase"
    }
  }

  // Get phase indicator classes
  const getPhaseIndicatorClasses = () => {
    switch (currentPhase) {
      case "adaptation":
        return "bg-amber-100 text-amber-800"
      case "elimination":
        return "bg-pink-100 text-pink-800"
      case "reintroduction":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Add a function to handle showing more items
  const handleShowMore = () => {
    setItemsToShow((prevCount) => prevCount + 12)
  }

  // Modify the Products List - Alphabetical View section to limit items and add Show More button
  // Replace the existing alphabetical view with this:
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      {/* Header */}
      <header className="p-4 border-b border-brand-dark/10 flex justify-between items-center bg-brand-dark text-white">
        <Logo />
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
          onClick={() => router.push("/profile")}
        >
          <User className="h-5 w-5 text-white" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-auto">
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-1">Food List</h2>
          <div className={`inline-block px-3 py-1 rounded-full text-sm ${getPhaseIndicatorClasses()}`}>
            {getPhaseIndicator()}
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="mb-6">
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-brand-dark/50" />
            </div>
            <input
              type="text"
              placeholder="Search foods, categories..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/80 border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-5 w-5 text-brand-dark/50" />
            </button>
          </div>

          {/* Filter Options */}
          <div className="glass-card rounded-xl p-4 mb-4 space-y-4">
            {/* Category Filter */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Filter by category</h3>
                <button
                  onClick={() => setShowTagDropdown(!showTagDropdown)}
                  className="text-sm text-pink-500 flex items-center"
                >
                  {selectedTags.length > 0 ? `${selectedTags.length} selected` : "Select categories"}
                  {showTagDropdown ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
                </button>
              </div>

              {showTagDropdown && (
                <div className="max-h-40 overflow-y-auto p-2 border border-brand-dark/10 rounded-lg bg-white/90 mb-3">
                  {allTags.map((tag) => (
                    <div key={tag} className="flex items-center mb-1">
                      <input
                        type="checkbox"
                        id={`tag-${tag}`}
                        checked={selectedTags.includes(tag)}
                        onChange={() => toggleTag(tag)}
                        className="mr-2 h-4 w-4 rounded border-brand-dark/30 text-pink-400 focus:ring-pink-400"
                      />
                      <label htmlFor={`tag-${tag}`} className="text-sm">
                        {tag}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Tags Display */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 rounded-full bg-pink-100 text-pink-800 text-xs flex items-center"
                    >
                      {tag}
                      <button onClick={() => toggleTag(tag)} className="ml-1 text-pink-800 hover:text-pink-900">
                        ×
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={() => setSelectedTags([])}
                    className="px-2 py-1 text-xs text-brand-dark/70 hover:text-brand-dark"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Sort and Favorites Options */}
            <div className="flex flex-wrap gap-3 justify-between">
              <div>
                <label className="block text-sm mb-1">Sort by</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSortBy("name")}
                    className={`px-3 py-1 rounded-full text-sm ${
                      sortBy === "name" ? "bg-pink-400 text-white" : "bg-white border border-brand-dark/20"
                    }`}
                  >
                    Name
                  </button>
                  <button
                    onClick={() => setSortBy("status")}
                    className={`px-3 py-1 rounded-full text-sm ${
                      sortBy === "status" ? "bg-pink-400 text-white" : "bg-white border border-brand-dark/20"
                    }`}
                  >
                    Status
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="favorites-only"
                  checked={showOnlyFavorites}
                  onChange={() => setShowOnlyFavorites(!showOnlyFavorites)}
                  className="mr-2 h-4 w-4 rounded border-brand-dark/30 text-pink-400 focus:ring-pink-400"
                />
                <label htmlFor="favorites-only" className="text-sm">
                  Show favorites only
                </label>
              </div>
            </div>

            {/* Clear All Filters Button */}
            <button
              onClick={clearFilters}
              className="w-full text-center py-2 border border-pink-300 text-pink-500 rounded-lg hover:bg-pink-50"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Products List */}
        {sortBy === "status" ? (
          <div className="space-y-6 pb-20">
            {Object.entries(productsByStatus).map(
              ([status, products]) =>
                products.length > 0 && (
                  <div key={status} className="mb-6">
                    <h3 className={`inline-block px-3 py-1 rounded-full text-sm mb-3 ${getStatusClasses(status)}`}>
                      {status} ({products.length})
                    </h3>

                    <div className="space-y-2">
                      {products.slice(0, itemsToShow).map((product) => (
                        <div key={product.name} className="glass-card p-3 rounded-xl flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{product.name}</h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {/* AIP/Non-AIP Tag */}
                              <span
                                className={`px-2 py-0.5 rounded text-xs ${product.isAIP ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                              >
                                {product.isAIP ? "AIP" : "Non-AIP"}
                              </span>

                              {product.tags.slice(0, 2).map((tag) => (
                                <span key={tag} className="bg-brand-lightest px-2 py-0.5 rounded text-xs">
                                  {tag}
                                </span>
                              ))}
                              {product.tags.length > 2 && (
                                <span className="bg-brand-lightest px-2 py-0.5 rounded text-xs">
                                  +{product.tags.length - 2}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {/* Add the Editable Status Dropdown here */}
                            <div className="relative inline-block mr-2">
                              <select
                                value={getProductStatus(product)}
                                onChange={(e) => updateProductStatus(product.name, e.target.value)}
                                className={`px-2 py-1 rounded text-xs appearance-none pr-6 cursor-pointer ${getStatusClasses(getProductStatus(product))}`}
                              >
                                <option value="Can eat">Can eat</option>
                                <option value="Can't eat">Can't eat</option>
                                <option value="Under evaluation">Under evaluation</option>
                              </select>
                              <ChevronDown className="absolute right-1 top-1/2 transform -translate-y-1/2 h-3 w-3 pointer-events-none" />
                            </div>

                            {product.tooltip && (
                              <button className="text-gray-400 hover:text-gray-600" title={product.tooltip}>
                                <Info className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => toggleFavorite(product.name)}
                              className="text-gray-400 hover:text-pink-400"
                            >
                              <Heart
                                className={`h-5 w-5 ${favorites.includes(product.name) ? "fill-pink-400 text-pink-400" : ""}`}
                              />
                            </button>
                          </div>
                        </div>
                      ))}

                      {products.length > itemsToShow && (
                        <button
                          onClick={handleShowMore}
                          className="w-full py-3 mt-4 text-pink-500 border border-pink-300 rounded-lg hover:bg-pink-50"
                        >
                          Show More ({products.length - itemsToShow} remaining)
                        </button>
                      )}
                    </div>
                  </div>
                ),
            )}
          </div>
        ) : (
          // Products List - Alphabetical View
          <div className="space-y-2 pb-20">
            {filteredProducts.slice(0, itemsToShow).map((product) => (
              <div key={product.name} className="glass-card p-3 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{product.name}</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {/* AIP/Non-AIP Tag */}
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${product.isAIP ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {product.isAIP ? "AIP" : "Non-AIP"}
                    </span>

                    {product.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="bg-brand-lightest px-2 py-0.5 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                    {product.tags.length > 2 && (
                      <span className="bg-brand-lightest px-2 py-0.5 rounded text-xs">+{product.tags.length - 2}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Add the Editable Status Dropdown here */}
                  <div className="relative inline-block mr-2">
                    <select
                      value={getProductStatus(product)}
                      onChange={(e) => updateProductStatus(product.name, e.target.value)}
                      className={`px-2 py-1 rounded text-xs appearance-none pr-6 cursor-pointer ${getStatusClasses(getProductStatus(product))}`}
                    >
                      <option value="Can eat">Can eat</option>
                      <option value="Can't eat">Can't eat</option>
                      <option value="Under evaluation">Under evaluation</option>
                    </select>
                    <ChevronDown className="absolute right-1 top-1/2 transform -translate-y-1/2 h-3 w-3 pointer-events-none" />
                  </div>

                  {product.tooltip && (
                    <button className="text-gray-400 hover:text-gray-600" title={product.tooltip}>
                      <Info className="h-4 w-4" />
                    </button>
                  )}
                  <button onClick={() => toggleFavorite(product.name)} className="text-gray-400 hover:text-pink-400">
                    <Heart
                      className={`h-5 w-5 ${favorites.includes(product.name) ? "fill-pink-400 text-pink-400" : ""}`}
                    />
                  </button>
                </div>
              </div>
            ))}

            {filteredProducts.length > itemsToShow && (
              <button
                onClick={handleShowMore}
                className="w-full py-3 mt-4 text-pink-500 border border-pink-300 rounded-lg hover:bg-pink-50"
              >
                Show More ({filteredProducts.length - itemsToShow} remaining)
              </button>
            )}
          </div>
        )}

        {/* No Results Message */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-brand-dark/70 mb-4">No foods match your search</p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-pink-500 border border-pink-300 rounded-lg hover:bg-pink-50"
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 grid grid-cols-5 border-t border-brand-dark/10 bg-white/90 backdrop-blur-sm z-10">
        <button className="flex flex-col items-center justify-center py-3 text-xs text-pink-400">
          <List className="h-5 w-5 mb-1 text-pink-400" />
          <span>Products</span>
        </button>
        <button
          className="flex flex-col items-center justify-center py-3 text-xs"
          onClick={() => handleNavigation("/dashboard")}
        >
          <Home className="h-5 w-5 mb-1 text-brand-dark" />
          <span className="text-brand-dark">Dashboard</span>
        </button>
        <button
          className="flex items-center justify-center rounded-full gradient-button h-14 w-14 -mt-7 mx-auto shadow-lg"
          onClick={() => handleNavigation("/log-day")}
        >
          <Plus className="h-6 w-6" />
        </button>
        <button
          className="flex flex-col items-center justify-center py-3 text-xs"
          onClick={() => handleNavigation("/nutrition")}
        >
          <BookOpen className="h-5 w-5 mb-1 text-brand-dark" />
          <span className="text-brand-dark">Nutrition</span>
        </button>
        <button
          className="flex flex-col items-center justify-center py-3 text-xs"
          onClick={() => handleNavigation("/recipes")}
        >
          <UtensilsCrossed className="h-5 w-5 mb-1 text-brand-dark" />
          <span className="text-brand-dark">Recipes</span>
        </button>
      </nav>
    </div>
  )
}
