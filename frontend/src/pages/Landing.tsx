"use client"

import { Zap, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-gray-950 text-gray-100">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden px-5 pt-6 pb-20 md:px-8 lg:px-12">
        {/* Animated background pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-full h-full bg-[radial-gradient(circle_500px_at_50%_200px,#4f46e5,transparent)]" />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='none' stroke='%231e293b' strokeWidth='2' strokeDasharray='10 10'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Main content */}
        <div className="relative container mx-auto px-4">
          <header className="py-6">
            <nav className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Zap className="h-8 w-8 text-indigo-400" />
                <span className="text-2xl font-bold text-white">
                  Scrape<span className="text-indigo-400">4Me</span>
                </span>
              </div>
              <div className="hidden md:flex items-center gap-8">
                <a href="#jobs" className="text-slate-300 hover:text-white transition-colors">
                  Jobs
                </a>
                <a href="#companies" className="text-slate-300 hover:text-white transition-colors">
                  Companies
                </a>
                <a href="/scraper" className="text-slate-300 hover:text-white transition-colors">
                  Scraper
                </a>
              </div>
            </nav>
          </header>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="py-12 md:py-20"
          >
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-2 text-indigo-400 mb-6">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-sm font-medium">Automated Job Discovery</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Discover Your Next
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                  Career Opportunity
                </span>
                With AI-Powered Job Scraping
              </h1>

              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                Scrape4Me automatically finds the best job opportunities across multiple platforms, tailored to your
                skills and preferences.
              </p>

              {/* Single Button to Scraper Page */}
              <div className="relative max-w-2xl mx-auto">
                <a href="/scraper">
                  <Button
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg h-14 px-8"
                  >
                    Run Scraper
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Landing
