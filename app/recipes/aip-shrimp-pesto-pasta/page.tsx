"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { List, Home, Plus, BookOpen, UtensilsCrossed, ArrowLeft, Clock, User, Heart } from "lucide-react"
import Logo from "@/app/components/logo"
import Image from "next/image"

export default function ShimpPestoPastaPage() {
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(false)

  const handleBack = () => {
    router.back()
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-brand-dark text-white">
        <button onClick={handleBack} className="flex items-center text-white/80 hover:text-white">
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>Back</span>
        </button>
        <Logo />
        <div className="w-20"></div> {/* Empty div for spacing */}
      </header>

      {/* Recipe Image */}
      <div className="relative w-full h-64 md:h-80">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Apr%2018%2C%202025%2C%2011_14_18%20AM-fS3VCmaWCk9CtuFgUAGmJxj2EazeJW.png"
          alt="Shrimp Pesto Pasta with zucchini noodles"
          fill
          className="object-cover"
        />
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleFavorite}
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isFavorite ? "bg-pink-400" : "bg-white/80"
            }`}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? "text-white fill-current" : "text-pink-400"}`} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-auto">
        {/* Recipe Header */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="bg-pink-100 text-brand-dark px-2 py-1 rounded-full text-xs">AIP-Friendly</span>
            <span className="bg-pink-100 text-brand-dark px-2 py-1 rounded-full text-xs">Seafood</span>
            <span className="bg-pink-100 text-brand-dark px-2 py-1 rounded-full text-xs">Quick Meal</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Shrimp Pesto Pasta</h1>
          <p className="text-brand-dark/70 mb-4">
            A delicious AIP-friendly pasta dish featuring fresh shrimp and a flavorful basil pesto sauce over your
            choice of zucchini noodles or cassava pasta.
          </p>

          <div className="flex flex-wrap gap-4 mb-2">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-brand-dark/70" />
              <span className="text-sm">Prep: 15 min</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-brand-dark/70" />
              <span className="text-sm">Cook: 15 min</span>
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1 text-brand-dark/70" />
              <span className="text-sm">Serves: 4</span>
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Ingredients</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">For the shrimp:</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="h-2 w-2 rounded-full bg-pink-400 mt-2 mr-2"></div>
                  <span>1 pound shrimp, peeled and deveined</span>
                </li>
                <li className="flex items-start">
                  <div className="h-2 w-2 rounded-full bg-pink-400 mt-2 mr-2"></div>
                  <span>1 tbsp olive oil (or ghee for reintroduction phase)</span>
                </li>
                <li className="flex items-start">
                  <div className="h-2 w-2 rounded-full bg-pink-400 mt-2 mr-2"></div>
                  <span>3 cloves garlic, minced</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">For the pesto:</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="h-2 w-2 rounded-full bg-pink-400 mt-2 mr-2"></div>
                  <span>2 cups fresh basil</span>
                </li>
                <li className="flex items-start">
                  <div className="h-2 w-2 rounded-full bg-pink-400 mt-2 mr-2"></div>
                  <span>1/4 cup nutritional yeast</span>
                </li>
                <li className="flex items-start">
                  <div className="h-2 w-2 rounded-full bg-pink-400 mt-2 mr-2"></div>
                  <span>4 cloves garlic</span>
                </li>
                <li className="flex items-start">
                  <div className="h-2 w-2 rounded-full bg-pink-400 mt-2 mr-2"></div>
                  <span>1/2 cup olive oil</span>
                </li>
                <li className="flex items-start">
                  <div className="h-2 w-2 rounded-full bg-pink-400 mt-2 mr-2"></div>
                  <span>Juice of 1 lemon</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">For the pasta:</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="h-2 w-2 rounded-full bg-pink-400 mt-2 mr-2"></div>
                  <span>1 box cassava noodles OR 4 medium zucchini, spiralized</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Instructions</h2>
          <ol className="space-y-4">
            <li className="flex">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-400 text-white flex items-center justify-center mr-3">
                1
              </span>
              <p>
                If using cassava pasta, cook according to package instructions. If using zucchini noodles, set aside raw
                or lightly sauté for 2-3 minutes until just tender.
              </p>
            </li>
            <li className="flex">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-400 text-white flex items-center justify-center mr-3">
                2
              </span>
              <p>
                Heat olive oil in a large pan over medium heat. Add the minced garlic and cook for 30 seconds until
                fragrant.
              </p>
            </li>
            <li className="flex">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-400 text-white flex items-center justify-center mr-3">
                3
              </span>
              <p>
                Add the shrimp to the pan and cook for approximately 3 minutes on each side, or until pink and opaque.
                Remove from heat.
              </p>
            </li>
            <li className="flex">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-400 text-white flex items-center justify-center mr-3">
                4
              </span>
              <p>
                While the shrimp is cooking, prepare the pesto by combining all pesto ingredients in a food processor.
                Pulse until smooth, scraping down the sides as needed.
              </p>
            </li>
            <li className="flex">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-400 text-white flex items-center justify-center mr-3">
                5
              </span>
              <p>
                In a large bowl, combine the cooked pasta or zucchini noodles with the pesto sauce, tossing to coat
                evenly.
              </p>
            </li>
            <li className="flex">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-400 text-white flex items-center justify-center mr-3">
                6
              </span>
              <p>Add the cooked shrimp to the pasta and gently toss to combine.</p>
            </li>
            <li className="flex">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-400 text-white flex items-center justify-center mr-3">
                7
              </span>
              <p>Serve immediately, garnished with additional fresh basil if desired.</p>
            </li>
          </ol>
        </div>

        {/* Recipe Notes */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Recipe Notes</h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <div className="h-2 w-2 rounded-full bg-pink-400 mt-2 mr-2"></div>
              <p>For a lighter meal, use zucchini noodles. For a heartier dish, use cassava pasta.</p>
            </li>
            <li className="flex items-start">
              <div className="h-2 w-2 rounded-full bg-pink-400 mt-2 mr-2"></div>
              <p>The nutritional yeast gives the pesto a cheesy flavor without using dairy.</p>
            </li>
            <li className="flex items-start">
              <div className="h-2 w-2 rounded-full bg-pink-400 mt-2 mr-2"></div>
              <p>
                If you're in the reintroduction phase and have successfully reintroduced ghee, you can use it instead of
                olive oil for cooking the shrimp for a richer flavor.
              </p>
            </li>
            <li className="flex items-start">
              <div className="h-2 w-2 rounded-full bg-pink-400 mt-2 mr-2"></div>
              <p>Leftover pesto can be stored in an airtight container in the refrigerator for up to 5 days.</p>
            </li>
          </ul>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="grid grid-cols-5 border-t border-brand-dark/10 bg-white/80 backdrop-blur-sm">
        <button
          className="flex flex-col items-center justify-center py-3 text-xs"
          onClick={() => handleNavigation("/food-list")}
        >
          <List className="h-5 w-5 mb-1 text-brand-dark" />
          <span className="text-brand-dark">Products</span>
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
          className="flex flex-col items-center justify-center py-3 text-xs text-pink-400"
          onClick={() => handleNavigation("/recipes")}
        >
          <UtensilsCrossed className="h-5 w-5 mb-1 text-pink-400" />
          <span>Recipes</span>
        </button>
      </nav>
    </div>
  )
}
