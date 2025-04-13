"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { List, Home, Plus, BookOpen, UtensilsCrossed, User, Search, Check, X, AlertCircle, Filter } from "lucide-react"
import Logo from "@/app/components/logo"

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
  // Add these non-AIP products to the allProducts array after the existing products

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

// Sort products alphabetically by name
const sortedProducts = [...allProducts].sort((a, b) => a.name.localeCompare(b.name))

// Get all unique tags for filtering
const allTags = Array.from(new Set(allProducts.flatMap((item) => item.tags))).sort()

type ProductStatus = "Can eat" | "Can't eat" | "Under evaluation"

type Product = {
  name: string
  isAIP: boolean
  status: ProductStatus
  tags: string[]
  tooltip?: string
}

export default function ProductListPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [showAIPOnly, setShowAIPOnly] = useState(true)
  const [showNonAIPOnly, setShowNonAIPOnly] = useState(false)
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "">("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [products, setProducts] = useState(sortedProducts)

  const handleProfileClick = () => {
    router.push("/profile")
  }

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleStatusChange = (productName: string, newStatus: ProductStatus) => {
    const updatedProducts = [...products]
    const productIndex = updatedProducts.findIndex((p) => p.name === productName)

    if (productIndex !== -1) {
      updatedProducts[productIndex].status = newStatus
      setProducts(updatedProducts)
    }

    setEditingProduct(null)
  }

  // Filter products based on search query, AIP status, status filter, and selected tags
  const filteredProducts = products.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesAIPFilter =
      (!showAIPOnly && !showNonAIPOnly) || (showAIPOnly && item.isAIP) || (showNonAIPOnly && !item.isAIP)
    const matchesStatusFilter = !statusFilter || item.status === statusFilter
    const matchesTags = selectedTags.length === 0 || selectedTags.every((tag) => item.tags.includes(tag))

    return matchesSearch && matchesAIPFilter && matchesStatusFilter && matchesTags
  })

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      {/* Header */}
      <header className="p-4 border-b border-brand-dark/10 flex justify-between items-center bg-brand-dark text-white">
        <Logo />
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
          onClick={handleProfileClick}
        >
          <User className="h-5 w-5 text-white" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-24 overflow-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">AIP Products</h2>
          <p className="text-brand-dark/70">Find out which foods are allowed on the AIP diet</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-brand-dark/50" />
          </div>
          <input
            type="text"
            placeholder="Search products"
            className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/80 border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
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

        {/* Filters */}
        <div className={`mb-6 glass-card rounded-xl p-4 ${!showFilters && "hidden"}`}>
          <h3 className="font-medium mb-3">Filters</h3>

          {/* AIP Status Filters */}
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">AIP Status</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setShowAIPOnly(!showAIPOnly)
                  if (showNonAIPOnly && !showAIPOnly) setShowNonAIPOnly(false)
                }}
                className={`flex items-center px-4 py-2 rounded-full text-sm ${
                  showAIPOnly ? "bg-green-500 text-white" : "bg-white/80 border border-brand-dark/20"
                }`}
              >
                <Check className={`h-4 w-4 mr-1 ${showAIPOnly ? "text-white" : "text-green-500"}`} />
                AIP Food
              </button>
              <button
                onClick={() => {
                  setShowNonAIPOnly(!showNonAIPOnly)
                  if (showAIPOnly && !showNonAIPOnly) setShowAIPOnly(false)
                }}
                className={`flex items-center px-4 py-2 rounded-full text-sm ${
                  showNonAIPOnly ? "bg-red-500 text-white" : "bg-white/80 border border-brand-dark/20"
                }`}
              >
                <X className={`h-4 w-4 mr-1 ${showNonAIPOnly ? "text-white" : "text-red-500"}`} />
                Non-AIP Food
              </button>
            </div>
          </div>

          {/* Status Filters */}
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Status</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter(statusFilter === "Can eat" ? "" : "Can eat")}
                className={`flex items-center px-4 py-2 rounded-full text-sm ${
                  statusFilter === "Can eat" ? "bg-green-500 text-white" : "bg-white/80 border border-brand-dark/20"
                }`}
              >
                <Check className={`h-4 w-4 mr-1 ${statusFilter === "Can eat" ? "text-white" : "text-green-500"}`} />
                Can eat
              </button>
              <button
                onClick={() => setStatusFilter(statusFilter === "Can't eat" ? "" : "Can't eat")}
                className={`flex items-center px-4 py-2 rounded-full text-sm ${
                  statusFilter === "Can't eat" ? "bg-red-500 text-white" : "bg-white/80 border border-brand-dark/20"
                }`}
              >
                <X className={`h-4 w-4 mr-1 ${statusFilter === "Can't eat" ? "text-white" : "text-red-500"}`} />
                Can't eat
              </button>
              <button
                onClick={() => setStatusFilter(statusFilter === "Under evaluation" ? "" : "Under evaluation")}
                className={`flex items-center px-4 py-2 rounded-full text-sm ${
                  statusFilter === "Under evaluation"
                    ? "bg-amber-500 text-white"
                    : "bg-white/80 border border-brand-dark/20"
                }`}
              >
                <AlertCircle
                  className={`h-4 w-4 mr-1 ${statusFilter === "Under evaluation" ? "text-white" : "text-amber-500"}`}
                />
                Under evaluation
              </button>
            </div>
          </div>

          {/* Tag Filters */}
          <div>
            <p className="text-sm font-medium mb-2">Tags</p>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs ${
                    selectedTags.includes(tag) ? "bg-pink-400 text-white" : "bg-white/80 border border-brand-dark/20"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product List */}
        <div className="space-y-2 mb-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((item, index) => (
              <div key={item.name} className="glass-card rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center relative group">
                    <span className="font-medium">{item.name}</span>
                    <span
                      className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                        item.isAIP ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.isAIP ? "AIP Food" : "Non-AIP Food"}
                    </span>

                    {item.tooltip && (
                      <div className="absolute left-0 -bottom-1 translate-y-full w-64 bg-brand-dark text-white text-xs rounded p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10">
                        {item.tooltip}
                      </div>
                    )}

                    {item.tooltip && <AlertCircle className="ml-1 h-4 w-4 text-amber-500" />}
                  </div>

                  {editingProduct && editingProduct.name === item.name ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange(item.name, "Can eat")}
                        className="p-1 rounded-full bg-green-100 text-green-600"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(item.name, "Can't eat")}
                        className="p-1 rounded-full bg-red-100 text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(item.name, "Under evaluation")}
                        className="p-1 rounded-full bg-amber-100 text-amber-600"
                      >
                        <AlertCircle className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingProduct(item)}
                      className={`px-2 py-1 rounded-full text-xs flex items-center ${
                        item.status === "Can eat"
                          ? "bg-green-100 text-green-800"
                          : item.status === "Can't eat"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {item.status === "Can eat" && <Check className="h-3 w-3 mr-1" />}
                      {item.status === "Can't eat" && <X className="h-3 w-3 mr-1" />}
                      {item.status === "Under evaluation" && <AlertCircle className="h-3 w-3 mr-1" />}
                      {item.status}
                    </button>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-brand-lightest text-brand-dark text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-brand-dark/70">No products found. Try adjusting your search or filters.</p>
            </div>
          )}
        </div>

        {/* Show more/less button */}
        {filteredProducts.length > 0 && (
          <div className="text-center py-4 mb-20">
            {showAIPOnly ? (
              <button
                onClick={() => setShowAIPOnly(false)}
                className="px-4 py-2 rounded-full text-pink-400 border border-pink-400 hover:bg-pink-50"
              >
                Show non-AIP products
              </button>
            ) : (
              <button
                onClick={() => setShowAIPOnly(true)}
                className="px-4 py-2 rounded-full text-pink-400 border border-pink-400 hover:bg-pink-50"
              >
                Show AIP products only
              </button>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 grid grid-cols-5 border-t border-brand-dark/10 bg-white/80 backdrop-blur-sm z-10">
        <button className="flex flex-col items-center justify-center py-3 text-xs text-pink-400">
          <List className="h-5 w-5 mb-1 text-pink-400" />
          <span>Products</span>
        </button>
        <button
          className="flex flex-col items-center justify-center py-3 text-xs"
          onClick={() => router.push("/dashboard")}
        >
          <Home className="h-5 w-5 mb-1 text-brand-dark" />
          <span className="text-brand-dark">Dashboard</span>
        </button>
        <button
          className="flex items-center justify-center rounded-full gradient-button h-14 w-14 -mt-7 mx-auto shadow-lg"
          onClick={() => router.push("/log-day")}
        >
          <Plus className="h-6 w-6" />
        </button>
        <button
          className="flex flex-col items-center justify-center py-3 text-xs"
          onClick={() => router.push("/nutrition")}
        >
          <BookOpen className="h-5 w-5 mb-1 text-brand-dark" />
          <span className="text-brand-dark">Nutrition</span>
        </button>
        <button
          className="flex flex-col items-center justify-center py-3 text-xs"
          onClick={() => router.push("/recipes")}
        >
          <UtensilsCrossed className="h-5 w-5 mb-1 text-brand-dark" />
          <span className="text-brand-dark">Recipes</span>
        </button>
      </nav>
    </div>
  )
}
