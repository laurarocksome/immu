"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { List, Home, Plus, BookOpen, UtensilsCrossed, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react"
import Logo from "@/app/components/logo"

// FAQ item interface
export const dynamic = 'force-dynamic'

interface FAQItem {
  id: string
  question: string
  answer: React.ReactNode
}

export default function FAQPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const handleBack = () => {
    router.back()
  }

  const toggleExpand = (index: number) => {
    if (expandedIndex === index) {
      setExpandedIndex(null)
    } else {
      setExpandedIndex(index)
    }
  }

  // Check for hash in URL on mount to expand specific FAQ item
  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      const targetId = hash.substring(1) // Remove the # character
      const targetIndex = faqItems.findIndex((item) => item.id === targetId)
      if (targetIndex !== -1) {
        setExpandedIndex(targetIndex)
        // Scroll to the element
        setTimeout(() => {
          const element = document.getElementById(targetId)
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" })
          }
        }, 100)
      }
    }
  }, [])

  // FAQ data
  const faqItems: FAQItem[] = [
    {
      id: "aip-diet",
      question: "What is the AIP Diet?",
      answer: (
        <p className="text-brand-dark/80">
          The Autoimmune Protocol (AIP) diet is an elimination diet designed to help reduce inflammation and symptoms of
          autoimmune disorders. It removes potential trigger foods and then slowly reintroduces them to identify which
          ones cause symptoms.
        </p>
      ),
    },
    {
      id: "diet-duration",
      question: "How long should I follow the AIP diet?",
      answer: (
        <p className="text-brand-dark/80">
          The elimination phase typically lasts 30-90 days, depending on your symptoms and response. The reintroduction
          phase can take several months as you test each food group carefully.
        </p>
      ),
    },
    {
      id: "adaptation-period",
      question: "What is the adaptation period?",
      answer: (
        <p className="text-brand-dark/80">
          The adaptation period is a 4-6 week transition phase that helps you gradually adjust to the AIP diet. This is
          especially helpful if you currently consume foods or beverages that might be difficult to eliminate all at
          once.
        </p>
      ),
    },
    {
      id: "eliminated-foods",
      question: "What foods are eliminated on AIP?",
      answer: (
        <p className="text-brand-dark/80">
          The AIP diet eliminates grains, legumes, dairy, eggs, nightshade vegetables, nuts, seeds, processed foods,
          refined sugars, and certain oils. It also removes food additives and alcohol.
        </p>
      ),
    },
    {
      id: "stress-management",
      question: "How do I manage stress during AIP?",
      answer: (
        <div>
          <p className="text-brand-dark/80 mb-2">
            Stress management is a crucial part of the AIP protocol. Chronic stress can trigger inflammation and worsen
            autoimmune symptoms.
          </p>
          <h4 className="font-medium text-base mt-3 mb-1">Recommended light exercises:</h4>
          <ul className="list-disc pl-5 text-brand-dark/80 mb-2">
            <li>Walking in nature (20-30 minutes daily)</li>
            <li>Gentle swimming (avoid competitive swimming)</li>
            <li>Restorative yoga or gentle stretching</li>
            <li>Tai chi or qigong</li>
          </ul>
          <p className="text-brand-dark/80 italic mb-2">
            Note: Strenuous activities should be avoided during AIP as they can increase inflammation and stress
            hormones.
          </p>

          <h4 className="font-medium text-base mt-3 mb-1">Deep breathing techniques:</h4>
          <p className="text-brand-dark/80 mb-2">
            Deep breathing activates your parasympathetic nervous system (rest and digest mode). Try the 4-7-8 method:
            inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds. Practice for 5 minutes daily.
          </p>

          <h4 className="font-medium text-base mt-3 mb-1">Journaling for stress reduction:</h4>
          <ul className="list-disc pl-5 text-brand-dark/80">
            <li>Record daily gratitude (3 things you're thankful for)</li>
            <li>Track your symptoms alongside emotional states</li>
            <li>Write about challenging situations and possible solutions</li>
            <li>Note positive experiences and small victories</li>
          </ul>
        </div>
      ),
    },
    {
      id: "caffeine-restriction",
      question: "Why is caffeine not allowed on AIP?",
      answer: (
        <div>
          <p className="text-brand-dark/80 mb-3">
            Caffeine is eliminated during the initial phase of AIP for several important reasons:
          </p>
          <ul className="list-disc pl-5 text-brand-dark/80 mb-3">
            <li>It can irritate the gut lining, compromising intestinal barrier integrity</li>
            <li>It stimulates the adrenals, potentially disrupting hormone balance</li>
            <li>It masks fatigue instead of addressing the underlying cause</li>
            <li>It can directly trigger autoimmune symptoms in sensitive individuals</li>
          </ul>
          <p className="text-brand-dark/80 mb-3">Coffee specifically is problematic because coffee beans are:</p>
          <ul className="list-disc pl-5 text-brand-dark/80 mb-3">
            <li>Seeds, which are eliminated on AIP (like nuts, legumes, etc.)</li>
            <li>Known to cross-react with gluten for some people (the immune system treats it like gluten)</li>
          </ul>
          <p className="text-brand-dark/80 italic">
            Once you've rebalanced your immune system and healed your gut (usually after 30–90 days), caffeine can be
            reintroduced mindfully as part of the reintroduction protocol.
          </p>
        </div>
      ),
    },
    {
      id: "weight-loss",
      question: "What about weight loss on AIP?",
      answer: (
        <div>
          <p className="text-brand-dark/80 mb-3">
            Many people experience weight loss on AIP as a natural side effect of:
          </p>
          <ul className="list-disc pl-5 text-brand-dark/80 mb-3">
            <li>Reduced inflammation throughout the body</li>
            <li>Better hormone regulation and balance</li>
            <li>Improved gut health and nutrient absorption</li>
            <li>Elimination of processed foods and refined sugars</li>
          </ul>
          <p className="text-brand-dark/80 mb-3 font-medium">
            Important: AIP is not designed as a weight loss diet. The primary goal is health and symptom reduction.
          </p>
          <p className="text-brand-dark/80 mb-2">
            If your weight isn't changing or is increasing on AIP, consider these factors:
          </p>
          <ul className="list-disc pl-5 text-brand-dark/80">
            <li>Consuming too many AIP-safe treats (coconut-heavy desserts, excessive sweet potatoes)</li>
            <li>Underlying thyroid or hormonal imbalances that need addressing</li>
            <li>Being in a caloric surplus (AIP is not automatically low-calorie)</li>
            <li>Chronic stress or poor sleep affecting metabolism</li>
            <li>Your body finding its natural, healthy weight (which may be different than expected)</li>
          </ul>
        </div>
      ),
    },
    {
      id: "symptom-tracking",
      question: "How do I track my symptoms?",
      answer: (
        <p className="text-brand-dark/80">
          IMMU helps you track your symptoms daily. Consistent tracking is important to identify patterns and
          connections between foods and symptoms. Use the dashboard to log your meals and symptoms each day.
        </p>
      ),
    },
    {
      id: "digestive-nauseous",
      question: "What causes nausea on AIP and how can I manage it?",
      answer: (
        <div>
          <p className="text-brand-dark/80 mb-3">
            If you're experiencing nausea while following the AIP diet, several factors could be contributing:
          </p>
          <ul className="list-disc pl-5 text-brand-dark/80 mb-3">
            <li>
              <strong>Insufficient healthy fats:</strong> Increase your healthy fat intake gradually with foods like
              avocado, olive oil, and coconut oil.
            </li>
            <li>
              <strong>Food sensitivities:</strong> Try to remember what you ate today and check if the same foods give
              you this feeling next time.
            </li>
            <li>
              <strong>Fermented foods:</strong> Increase intake of fermented food gradually as they can cause digestive
              upset when introduced too quickly.
            </li>
            <li>
              <strong>High iron-foods:</strong> Some AIP-compliant foods high in iron could cause nausea in sensitive
              individuals.
            </li>
            <li>
              <strong>Low blood sugar:</strong> Ensure you're eating regular, balanced meals throughout the day.
            </li>
            <li>
              <strong>Too much fiber:</strong> Try to increase your fiber intake gradually and make sure to cook your
              vegetables thoroughly.
            </li>
            <li>
              <strong>Dehydration:</strong> Ensure you're drinking enough water throughout the day.
            </li>
          </ul>
          <p className="text-brand-dark/80 italic">
            If nausea persists despite these adjustments, consider consulting with a healthcare provider to rule out
            other causes.
          </p>
        </div>
      ),
    },
    {
      id: "digestive-bloated",
      question: "What causes bloating on AIP and how can I manage it?",
      answer: (
        <div>
          <p className="text-brand-dark/80 mb-3">
            Bloating can be common when transitioning to the AIP diet. Here are potential causes and solutions:
          </p>
          <ul className="list-disc pl-5 text-brand-dark/80 mb-3">
            <li>
              <strong>Too much fiber:</strong> Try to increase your fiber intake gradually and make sure to cook your
              vegetables thoroughly.
            </li>
            <li>
              <strong>PMS:</strong> Hormonal fluctuations before your period can cause temporary bloating.
            </li>
            <li>
              <strong>Fermented foods:</strong> Increase intake of fermented food gradually to allow your gut to adjust.
            </li>
            <li>
              <strong>Coconut products:</strong> Large amounts of coconut can be hard to digest. Reduce the intake and
              experiment to see how it affects you.
            </li>
            <li>
              <strong>Large portions and fast eating:</strong> Try eating smaller meals more slowly, chewing thoroughly.
            </li>
            <li>
              <strong>Stress:</strong> Practice stress management techniques as stress can directly impact digestion.
            </li>
          </ul>
          <p className="text-brand-dark/80 italic">
            Tracking your food intake alongside bloating symptoms can help identify your specific triggers.
          </p>
        </div>
      ),
    },
    {
      id: "digestive-gassy",
      question: "What causes gas on AIP and how can I manage it?",
      answer: (
        <div>
          <p className="text-brand-dark/80 mb-3">
            Excessive gas can be uncomfortable but is often manageable with some adjustments:
          </p>
          <ul className="list-disc pl-5 text-brand-dark/80 mb-3">
            <li>
              <strong>Too much fiber:</strong> Try to increase your fiber intake gradually and make sure to cook your
              vegetables thoroughly.
            </li>
            <li>
              <strong>Coconut products:</strong> Large amounts of coconut can be hard to digest. Reduce the intake and
              experiment to see how it affects you.
            </li>
            <li>
              <strong>Large portions and fast eating:</strong> Eat smaller meals more slowly and chew thoroughly.
            </li>
            <li>
              <strong>Fermented foods:</strong> Increase intake of fermented food gradually to allow your gut to adjust.
            </li>
            <li>
              <strong>Drinking with a straw:</strong> This can cause you to swallow excess air.
            </li>
            <li>
              <strong>Chewing gum:</strong> Avoid chewing gum as it can lead to swallowing air.
            </li>
            <li>
              <strong>Cruciferous vegetables:</strong> Foods like cauliflower and Brussels sprouts can cause gas. Cook
              them well and reduce portions.
            </li>
            <li>
              <strong>Starchy vegetables:</strong> Sweet potatoes, squash, and plantains can cause gas in some people.
              Try pairing them with non-starchy vegetables.
            </li>
          </ul>
          <p className="text-brand-dark/80 italic">
            Remember that some gas is normal, especially when transitioning to a new diet with different fiber sources.
          </p>
        </div>
      ),
    },
    {
      id: "digestive-heartburn",
      question: "What causes heartburn on AIP and how can I manage it?",
      answer: (
        <div>
          <p className="text-brand-dark/80 mb-3">
            Heartburn can occur even on the AIP diet. Here are common causes and management strategies:
          </p>
          <ul className="list-disc pl-5 text-brand-dark/80 mb-3">
            <li>
              <strong>High fat foods:</strong> Moderate high-fat foods, and try consuming smaller, balanced portions.
            </li>
            <li>
              <strong>Overeating or large portions:</strong> Eat smaller meals more frequently throughout the day.
            </li>
            <li>
              <strong>Spicy foods or strong seasonings:</strong> Even AIP-compliant seasonings can trigger heartburn in
              sensitive individuals.
            </li>
            <li>
              <strong>Coconut products:</strong> Coconut oil, milk, or flour can sometimes cause digestive upset for
              those who are sensitive.
            </li>
            <li>
              <strong>Acidic foods:</strong> Some AIP foods are naturally acidic, such as apple cider vinegar or certain
              fruits.
            </li>
            <li>
              <strong>Underlying gut issues:</strong> Low stomach acid can paradoxically cause heartburn symptoms.
            </li>
            <li>
              <strong>Eating too close to bedtime:</strong> Avoid eating at least 2-3 hours before lying down or going
              to bed.
            </li>
            <li>
              <strong>Fermented foods:</strong> Start with very small amounts of fermented foods, and see how your body
              responds.
            </li>
            <li>
              <strong>Stress and anxiety:</strong> Practice stress management techniques as stress can increase acid
              production.
            </li>
            <li>
              <strong>Drinking large amounts of water with meals:</strong> This can dilute stomach acid and impair
              digestion.
            </li>
          </ul>
          <p className="text-brand-dark/80 italic">
            If heartburn persists despite these adjustments, consult with a healthcare provider to rule out other
            causes.
          </p>
        </div>
      ),
    },
    {
      id: "nuts-seeds",
      question: "Can I eat any nuts or seeds on AIP?",
      answer: (
        <p className="text-brand-dark/80">
          Most nuts and seeds are eliminated on the AIP diet, but there's one exception: tigernuts. Despite the name,
          tigernuts aren't actually nuts—they're tubers—and are AIP-approved. They're a great option if you're craving
          that nutty crunch.
        </p>
      ),
    },
    {
      id: "pasta-substitute",
      question: "I really love pasta. Is there any substitute on AIP?",
      answer: (
        <div>
          <p className="text-brand-dark/80 mb-3">
            While traditional wheat pasta is eliminated on the AIP diet, there are several delicious alternatives:
          </p>
          <ul className="list-disc pl-5 text-brand-dark/80 mb-3">
            <li>
              <strong>Vegetable noodles:</strong> Spiralized zucchini, sweet potato, or carrots make excellent pasta
              alternatives. They're light, nutritious, and work well with most sauces.
            </li>
            <li>
              <strong>Cassava pasta:</strong> Made from cassava (yuca) root, this is the closest to traditional pasta in
              texture and is completely AIP-compliant.
            </li>
            <li>
              <strong>Plantain pasta:</strong> Some companies make pasta from green plantains, which is another
              AIP-friendly option.
            </li>
            <li>
              <strong>Spaghetti squash:</strong> When cooked, the flesh separates into spaghetti-like strands, making it
              a natural pasta alternative.
            </li>
          </ul>
          <p className="text-brand-dark/80">
            Check out our recipes section for our AIP-friendly Shrimp Pesto Pasta that uses either zucchini noodles or
            cassava pasta!
          </p>
        </div>
      ),
    },
  ]

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

      {/* Main Content */}
      <main className="flex-1 px-4 pb-8 overflow-auto">
        <div className="max-w-md mx-auto">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-2">
            {faqItems.map((item, index) => (
              <div key={index} id={item.id} className="glass-card rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleExpand(index)}
                  className="w-full p-4 flex justify-between items-center text-left font-semibold"
                >
                  <span>{item.question}</span>
                  {expandedIndex === index ? (
                    <ChevronUp className="h-5 w-5 flex-shrink-0 text-brand-dark/70" />
                  ) : (
                    <ChevronDown className="h-5 w-5 flex-shrink-0 text-brand-dark/70" />
                  )}
                </button>
                {expandedIndex === index && <div className="p-4 pt-0 border-t border-brand-dark/10">{item.answer}</div>}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="grid grid-cols-5 border-t border-brand-dark/10 bg-white/80 backdrop-blur-sm">
        <button
          className="flex flex-col items-center justify-center py-3 text-xs"
          onClick={() => router.push("/food-list")}
        >
          <List className="h-5 w-5 mb-1 text-brand-dark" />
          <span className="text-brand-dark">Food List</span>
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
          onClick={() => router.push("/add-meal")}
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
