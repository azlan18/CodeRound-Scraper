"use client"

import { useState, useEffect } from "react"
import {
  Zap,
  ArrowRight,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Database,
  Search,
  Briefcase,
  MapPin,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Code,
  Star,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"

// Types
interface Skill {
  skill: string
}

interface Company {
  id: number
  name: string
  rating: string
  reviews: string
  logo_url: string
}

interface Job {
  id: number
  job_id: string
  title: string
  company: Company
  experience: string
  salary: string
  location: string
  description: string
  detail_url: string
  posted_date: string
  date_scraped: string
  skills: Skill[]
}

interface ScraperResponse {
  success: boolean
  jobs: { [site_name: string]: Array<{
    job_id: string
    title: string
    company: string
    company_rating: string
    company_reviews: string
    experience: string
    salary: string
    location: string
    description: string
    skills: string[]
    posted: string
    detail_url: string
    logo_url: string
  }> }
  errors: string[]
}

interface ScraperStatus {
  status: "idle" | "running" | "completed" | "failed"
  last_run?: string
  job_count?: number
  errors?: string[]
}

const ScraperPage = () => {
  const [maxJobs, setMaxJobs] = useState<number>(2)
  const [status, setStatus] = useState<ScraperStatus>({ status: "idle" })
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isHealthLoading, setIsHealthLoading] = useState<boolean>(true)
  const [progress, setProgress] = useState<number>(0)
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [error, setError] = useState<string | null>(null)
  const [healthError, setHealthError] = useState<string | null>(null)

  // Filter states
  const [filters, setFilters] = useState({
    company: "",
    location: "",
    title: "",
    skill: "",
  })

  const [showFilters, setShowFilters] = useState(false)
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null)

  // Fetch scraper health status on mount
  useEffect(() => {
    const fetchHealthStatus = async () => {
      setIsHealthLoading(true)
      try {
        const response = await fetch("https://deploy-job-scrape.onrender.com/health")
        if (!response.ok) {
          throw new Error("Failed to fetch scraper health status")
        }
        const data = await response.json()
        if (data.status === "ok" && data.message === "Service is running") {
          setStatus({ status: "idle" })
          setHealthError(null)
        } else {
          throw new Error("Invalid health response")
        }
      } catch (err) {
        console.error("Error fetching scraper health status:", err)
        setStatus({ status: "failed", errors: ["Failed to connect to backend"] })
        setHealthError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setIsHealthLoading(false)
      }
    }

    fetchHealthStatus()
  }, [])

  const runScraper = async () => {
    setIsLoading(true)
    setProgress(0)
    setStatus({ status: "running" })
    setJobs([])
    setFilteredJobs([])
    setError(null)

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return 95
        }
        return prev + Math.random() * 10
      })
    }, 500)

    try {
      const response = await fetch(`https://deploy-job-scrape.onrender.com/scrape?max_jobs=${maxJobs}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        throw new Error("Failed to run scraper")
      }

      const data: ScraperResponse = await response.json()
      // Transform backend jobs to frontend Job interface
      const transformedJobs: Job[] = Object.values(data.jobs).flatMap((siteJobs, siteIndex) =>
        siteJobs.map((job, jobIndex) => ({
          id: siteIndex * 1000 + jobIndex, // Generate unique ID
          job_id: job.job_id,
          title: job.title,
          company: {
            id: siteIndex,
            name: job.company,
            rating: job.company_rating,
            reviews: job.company_reviews,
            logo_url: job.logo_url,
          },
          experience: job.experience,
          salary: job.salary,
          location: job.location,
          description: job.description,
          detail_url: job.detail_url,
          posted_date: job.posted,
          date_scraped: new Date().toISOString(),
          skills: job.skills.map((skill) => ({ skill })),
        }))
      )

      const totalJobs = transformedJobs.length
      setJobs(transformedJobs)
      setFilteredJobs(transformedJobs)
      setStatus({
        status: data.success ? "completed" : "failed",
        last_run: new Date().toISOString(),
        job_count: totalJobs,
        errors: data.errors,
      })
    } catch (err) {
      clearInterval(progressInterval)
      setProgress(100)
      setStatus({
        status: "failed",
        errors: [err instanceof Error ? err.message : "An unknown error occurred"],
      })
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // Apply client-side filters
  useEffect(() => {
    const applyFilters = () => {
      const filtered = jobs.filter((job) => {
        const matchesCompany =
          !filters.company || job.company.name.toLowerCase().includes(filters.company.toLowerCase())
        const matchesLocation =
          !filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase())
        const matchesTitle =
          !filters.title || job.title.toLowerCase().includes(filters.title.toLowerCase())
        const matchesSkill =
          !filters.skill ||
          job.skills.some((skill) => skill.skill.toLowerCase().includes(filters.skill.toLowerCase()))
        return matchesCompany && matchesLocation && matchesTitle && matchesSkill
      })
      setFilteredJobs(filtered)
    }

    applyFilters()
  }, [filters, jobs])

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      company: "",
      location: "",
      title: "",
      skill: "",
    })
  }

  const toggleJobExpansion = (jobId: number) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId)
  }

  // Get unique locations and companies for filter dropdowns
  const uniqueLocations = Array.from(new Set(jobs.map((job) => job.location)))
  const uniqueCompanies = Array.from(new Set(jobs.map((job) => job.company.name)))

  const getStatusIcon = () => {
    switch (status.status) {
      case "idle":
        return <Clock className="h-6 w-6 text-gray-400" />
      case "running":
        return <RefreshCw className="h-6 w-6 text-indigo-400 animate-spin" />
      case "completed":
        return <CheckCircle className="h-6 w-6 text-green-400" />
      case "failed":
        return <XCircle className="h-6 w-6 text-red-400" />
      default:
        return <AlertCircle className="h-6 w-6 text-yellow-400" />
    }
  }

  const getStatusText = () => {
    switch (status.status) {
      case "idle":
        return "Ready to run"
      case "running":
        return "Scraper is running..."
      case "completed":
        return "Scraping completed successfully"
      case "failed":
        return "Scraping failed"
      default:
        return "Unknown status"
    }
  }

  const getStatusColor = () => {
    switch (status.status) {
      case "idle":
        return "text-gray-400"
      case "running":
        return "text-indigo-400"
      case "completed":
        return "text-green-400"
      case "failed":
        return "text-red-400"
      default:
        return "text-yellow-400"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-gray-950 text-gray-100">
      {/* Scraper Section */}
      <section id="scraper" className="py-16 px-4 md:px-8 lg:px-12">
        <div className="container mx-auto">
          {/* Scraper Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto mb-12"
          >
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Database className="h-6 w-6 mr-3 text-indigo-400" />
                Scraper Status
              </h2>

              {isHealthLoading ? (
                <div className="flex flex-col items-center">
                  <RefreshCw className="h-6 w-6 text-indigo-400 animate-spin mb-4" />
                  <p className="text-gray-400 text-center">
                    Checking scraper server status... If this is taking time, the server may be spinning up (up to 50 seconds).
                  </p>
                </div>
              ) : healthError ? (
                <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-4">
                  <h3 className="text-red-400 font-medium mb-2 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Failed to Connect
                  </h3>
                  <p className="text-sm text-red-300">{healthError}</p>
                  <Button
                    variant="outline"
                    className="mt-3 border-red-700 text-red-200 hover:bg-red-800/50"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center mb-6">
                    {getStatusIcon()}
                    <span className={`ml-2 font-medium ${getStatusColor()}`}>{getStatusText()}</span>
                  </div>

                  {status.status === "running" && (
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2 bg-gray-800" indicatorClassName="bg-indigo-500" />
                    </div>
                  )}

                  {status.last_run && (
                    <div className="text-sm text-gray-400 mb-4">
                      <span className="font-medium">Last Run:</span>{" "}
                      {new Date(status.last_run).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                  )}

                  {status.status === "completed" && jobs.length > 0 && (
                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                      <div className="mb-4">
                        <div className="text-2xl font-bold text-indigo-400">{status.job_count}</div>
                        <div className="text-sm text-gray-400">Jobs Scraped</div>
                      </div>
                    </div>
                  )}

                  {status.status === "failed" && status.errors && status.errors.length > 0 && (
                    <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-4">
                      <h3 className="text-red-400 font-medium mb-2 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Errors Occurred
                      </h3>
                      <ul className="text-sm text-red-300 list-disc pl-5 space-y-1">
                        {status.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="text-sm text-gray-400 mt-4">
                    Please wait for the health check to complete before starting the scraper.
                  </p>
                </>
              )}
            </div>
          </motion.div>

          {/* Scraper Control Card */}
          {!isHealthLoading && !healthError && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-3xl mx-auto mb-12"
            >
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-30"></div>
                <div className="relative bg-gray-900/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 shadow-xl">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Settings className="h-6 w-6 mr-3 text-indigo-400" />
                    Scraper Configuration
                  </h2>

                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Maximum Jobs per Company ({maxJobs})
                    </label>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-400">1</span>
                      <Slider
                        value={[maxJobs]}
                        min={1}
                        max={5}
                        step={1}
                        onValueChange={(value) => setMaxJobs(value[0])}
                        className="flex-grow"
                      />
                      <span className="text-gray-400">5</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      Set how many jobs to scrape per company (max 5). Higher values will take longer to process.
                    </p>
                  </div>

                  <Button
                    onClick={runScraper}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 w-full"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                        Running Scraper...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-5 w-5" />
                        Run Scraper
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Jobs Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Filter Section */}
            <div className="mb-12 bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 shadow-xl">
              <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Search job titles..."
                    className="pl-10 bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-400 w-full"
                    value={filters.title}
                    onChange={(e) => handleFilterChange("title", e.target.value)}
                  />
                </div>

                <Button
                  variant="outline"
                  className="w-full md:w-auto border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter size={18} className="mr-2" />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>

                {Object.values(filters).some((value) => value !== "") && (
                  <Button
                    variant="ghost"
                    className="w-full md:w-auto text-red-400 hover:text-red-300 hover:bg-gray-800"
                    onClick={clearFilters}
                  >
                    <X size={18} className="mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Company</label>
                        <select
                          className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-gray-100"
                          value={filters.company}
                          onChange={(e) => handleFilterChange("company", e.target.value)}
                        >
                          <option value="">All Companies</option>
                          {uniqueCompanies.map((company) => (
                            <option key={company} value={company}>
                              {company}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
                        <select
                          className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-gray-100"
                          value={filters.location}
                          onChange={(e) => handleFilterChange("location", e.target.value)}
                        >
                          <option value="">All Locations</option>
                          {uniqueLocations.map((location) => (
                            <option key={location} value={location}>
                              {location}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Skill</label>
                        <Input
                          placeholder="e.g. React, Python, etc."
                          className="bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-400"
                          value={filters.skill}
                          onChange={(e) => handleFilterChange("skill", e.target.value)}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Section Title */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white">
                Available <span className="text-indigo-400">Jobs</span>
              </h2>
              {!isLoading && !error && (
                <div className="text-gray-400">
                  Showing {filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>

            {/* Job Listings */}
            <div className="space-y-8">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-800"
                  >
                    <div className="flex items-center mb-6">
                      <Skeleton className="h-16 w-16 rounded-xl bg-gray-800" />
                      <div className="ml-4 space-y-2">
                        <Skeleton className="h-6 w-48 bg-gray-800" />
                        <Skeleton className="h-4 w-32 bg-gray-800" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-3/4 mb-4 bg-gray-800" />
                    <Skeleton className="h-4 w-1/2 mb-6 bg-gray-800" />
                    <div className="flex flex-wrap gap-2 mt-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-8 w-20 rounded-full bg-gray-800" />
                      ))}
                    </div>
                  </div>
                ))
              ) : error ? (
                <div className="bg-red-900/30 border border-red-700 text-red-200 p-6 rounded-2xl">
                  <p className="font-medium">Error loading jobs</p>
                  <p className="text-sm mt-1">{error}</p>
                  <Button
                    variant="outline"
                    className="mt-3 border-red-700 text-red-200 hover:bg-red-800/50"
                    onClick={runScraper}
                    disabled={isHealthLoading || !!healthError}
                  >
                    Try Again
                  </Button>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-12 text-center shadow-xl border border-gray-800">
                  <div className="flex justify-center mb-6">
                    <Briefcase className="h-16 w-16 text-gray-600" />
                  </div>
                  <h3 className="text-2xl font-medium text-gray-300 mb-2">No jobs found</h3>
                  <p className="text-gray-400 mb-6">Run the scraper or adjust filters to see results</p>
                  <Button
                    onClick={runScraper}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    disabled={isHealthLoading || !!healthError}
                  >
                    Run Scraper
                    <Zap className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <AnimatePresence>
                  {filteredJobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="relative group"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-300"></div>
                      <div className="relative bg-gray-900/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 hover:translate-y-[-2px]">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                          <div className="flex items-center">
                            <div className="h-16 w-16 rounded-xl overflow-hidden bg-gray-800 flex items-center justify-center">
                              {job.company.logo_url ? (
                                <img
                                  src={job.company.logo_url}
                                  alt={`${job.company.name} logo`}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      `/placeholder.svg?height=64&width=64&query=${job.company.name} logo`
                                  }}
                                />
                              ) : (
                                <Briefcase className="h-8 w-8 text-gray-400" />
                              )}
                            </div>
                            <div className="ml-4">
                              <h3 className="font-medium text-xl text-white">{job.company.name}</h3>
                              <div className="flex items-center text-sm text-gray-400">
                                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                <span>{job.company.rating}</span>
                                <span className="mx-1">•</span>
                                <span>{job.company.reviews}</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 md:mt-0 text-sm text-gray-400 flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{job.posted_date}</span>
                          </div>
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-3">{job.title}</h2>

                        <div className="flex flex-wrap gap-y-3 text-sm text-gray-300 mb-6">
                          <div className="flex items-center mr-6">
                            <MapPin size={16} className="mr-1 text-indigo-400" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center mr-6">
                            <Briefcase size={16} className="mr-1 text-indigo-400" />
                            <span>{job.experience}</span>
                          </div>
                          {job.salary !== "Not disclosed" && (
                            <div className="flex items-center">
                              <span className="text-green-400 font-medium">{job.salary}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                          {job.skills
                            .slice(0, expandedJobId === job.id ? job.skills.length : 5)
                            .map((skillObj, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="bg-indigo-900/30 hover:bg-indigo-800/40 text-indigo-300 border-indigo-800/50 py-1.5 px-3 text-sm"
                              >
                                <Code className="h-3.5 w-3.5 mr-1.5" />
                                {skillObj.skill}
                              </Badge>
                            ))}
                          {job.skills.length > 5 && expandedJobId !== job.id && (
                            <Badge
                              variant="outline"
                              className="border-gray-700 text-gray-400 cursor-pointer hover:bg-gray-800 py-1.5 px-3 text-sm"
                              onClick={() => toggleJobExpansion(job.id)}
                            >
                              +{job.skills.length - 5} more
                            </Badge>
                          )}
                        </div>

                        <AnimatePresence>
                          {expandedJobId === job.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-gray-800 pt-6 mt-2">
                                <h4 className="font-medium text-gray-300 mb-3 flex items-center">
                                  <Sparkles className="h-4 w-4 mr-2 text-indigo-400" />
                                  Job Description
                                </h4>
                                <p className="text-gray-400">{job.description}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="flex justify-between items-center mt-6">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white hover:bg-gray-800"
                            onClick={() => toggleJobExpansion(job.id)}
                          >
                            {expandedJobId === job.id ? (
                              <>
                                <ChevronUp size={16} className="mr-1" />
                                Show Less
                              </>
                            ) : (
                              <>
                                <ChevronDown size={16} className="mr-1" />
                                Show More
                              </>
                            )}
                          </Button>

                          <a href={job.detail_url} target="_blank" rel="noopener noreferrer">
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                            >
                              Apply Now
                              <ExternalLink size={14} className="ml-1" />
                            </Button>
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center mb-8">
            <Zap className="h-8 w-8 text-indigo-400 mr-2" />
            <span className="text-2xl font-bold text-white">
              Scrape<span className="text-indigo-400">4Me</span>
            </span>
          </div>
          <p className="text-center text-gray-400">© {new Date().getFullYear()} Scrape4Me. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default ScraperPage
