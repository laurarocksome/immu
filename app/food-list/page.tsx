"use client"

export const dynamic = "force-dynamic"

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
import { createBrowserClient } from "@supabase/ssr"

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

// Get all unique tags for filtering
const getAllTags = (products) => {
  return Array.from(new Set(products.flatMap((item) => item.tags))).sort()
}

export default function FoodListPage() {
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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
  const [allTags, setAllTags] = useState<string[]>([])

  // Router for navigation
  const router = useRouter()

  // Effect to load diet phase, favorites, and user statuses on component mount
  useEffect(() => {
    async function fetchFoods() {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )

        const { data, error } = await supabase.from("foods").select("*").order("name")

        if (error) throw error

        setAllProducts(data || [])
      } catch (error) {
        console.error("Error fetching foods:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFoods()

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

  useEffect(() => {
    setAllTags(getAllTags(allProducts))
  }, [allProducts])

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

    // If in elimination phase
    if (currentPhase === "elimination") {
      // Non-AIP items are "Can't eat"
      if (!product.isAIP) {
        return "Can't eat"
      }
      // AIP items are "Can eat"
      return "Can eat"
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

    // If in reintroduction phase, non-AIP items are "Under evaluation" by default
    if (currentPhase === "reintroduction") {
      if (!product.isAIP) {
        return "Under evaluation"
      }
      // AIP items remain "Can eat"
      return "Can eat"
    }

    // Default fallback - should not reach here in normal flow
    return product.isAIP ? "Can eat" : "Can't eat"
  }

  // Filter and sort products based on user selections
  const filteredProducts = allProducts
    .filter((product) => {
      // Filter "5-Hour Energy" from filtered products
      if (product.name === "5-Hour Energy") return false

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
        return "bg-peach-100 text-peach-800"
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
        return "bg-yellow-100 text-yellow-800"
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

  // Update the Products List - Alphabetical View section to limit items and add Show More button
  // Replace the existing alphabetical view with this:
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p>Loading foods...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      <header className="p-4 border-b border-pink-200/30 flex justify-between items-center bg-gradient-to-r from-pink-300 to-peach-300">
        <Logo variant="light" />
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors"
          onClick={() => router.push("/profile")}
        >
          <User className="h-5 w-5 text-white" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-hidden">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Food List</h2>

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
      <nav className="fixed bottom-0 left-0 right-0 grid grid-cols-5 border-t border-pink-200/10 bg-white/90 backdrop-blur-sm z-10">
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
          <BookOpen className="h-5 w-5 mb-1 text-brand-brand" />
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
