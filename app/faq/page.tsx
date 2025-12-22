"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, PlusIcon } from "lucide-react"
import Logo from "@/app/components/logo"
import { createBrowserClient } from "@/lib/supabase/client"

interface FAQItem {
  id: string
  question: string
  answer: string
  category?: string
  phase?: string
}

export default function FAQPage() {
  const router = useRouter()
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)
  const [faqItems, setFaqItems] = useState<FAQItem[]>([])
  const [loading, setLoading] = useState(true)

  const handleBack = () => {
    router.back()
  }

  const toggleFaq = (id: string) => {
    if (expandedFaq === id) {
      setExpandedFaq(null)
    } else {
      setExpandedFaq(id)
    }
  }

  useEffect(() => {
    async function fetchFAQs() {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )

        const { data, error } = await supabase.from("faqs").select("*").order("order_index")

        if (error) throw error

        setFaqItems(data || [])
      } catch (error) {
        console.error("Error fetching FAQs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFAQs()
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-brand-dark text-white">
        <button onClick={handleBack} className="flex items-center text-white/80 hover:text-white">
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>Back</span>
        </button>
        <Logo variant="light" />
        <div className="w-16" />
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-auto pb-24">
        <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>

        {loading ? (
          <div className="text-center py-8 text-brand-dark/60">Loading FAQs...</div>
        ) : (
          <div className="space-y-4">
            {faqItems.map((item) => (
              <div key={item.id} className="glass-card rounded-xl overflow-hidden">
                <button
                  className="w-full p-4 flex justify-between items-start text-left hover:bg-pink-50/50 transition-colors"
                  onClick={() => toggleFaq(item.id)}
                >
                  <span className="font-medium pr-4">{item.question}</span>
                  <PlusIcon
                    className={`h-5 w-5 flex-shrink-0 transition-transform ${expandedFaq === item.id ? "rotate-45" : ""}`}
                  />
                </button>
                {expandedFaq === item.id && (
                  <div className="px-4 pb-4">
                    <div className="text-brand-dark/80 whitespace-pre-wrap">{item.answer}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
