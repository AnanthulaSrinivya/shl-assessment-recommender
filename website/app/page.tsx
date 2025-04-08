"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { Badge } from "@/components/ui/badge"
import { Clock, ExternalLink, Check, X, Star } from "lucide-react"
import { Loader2 } from "lucide-react"

const API_URL = "https://emotional-ofelia-nivya-f673d23e.koyeb.app/recommend"

type FormData = {
  job_title: string
  level: "Entry" | "Mid" | "Senior"
  use_case: "Hiring" | "Development"
  key_skills: string
}

type Recommendation = {
  url: string
  adaptive_support: string
  description: string
  duration: number
  remote_support: string
  test_type: string[]
  score: number
  reason: string
}

export default function AssessmentRecommender() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(false)

  const form = useForm<FormData>({
    defaultValues: {
      job_title: "",
      level: "Entry",
      use_case: "Hiring",
      key_skills: "",
    },
  })

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)

    const payload = {
      ...formData,
      key_skills: formData.key_skills.split(",").map((skill) => skill.trim()),
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      setRecommendations(data.recommendations || [])
    } catch (err) {
      console.error("API call failed:", err)
      setRecommendations([])
    } finally {
      setLoading(false)
    }
  }

  // Extract test name from URL
  const getTestName = (url: string) => {
    try {
      const urlPath = new URL(url).pathname
      const parts = urlPath.split("/")
      const lastPart = parts[parts.length - 2] || ""
      return lastPart
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    } catch {
      return "SHL Assessment"
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">SHL Assessment Recommender</CardTitle>
          <CardDescription>Enter job details to get personalized assessment recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="job_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Software Developer" required {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Entry">Entry</SelectItem>
                          <SelectItem value="Mid">Mid</SelectItem>
                          <SelectItem value="Senior">Senior</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="use_case"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Use Case</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select use case" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Hiring">Hiring</SelectItem>
                          <SelectItem value="Development">Development</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="key_skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key Skills (comma-separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. python,sql,data analysis" required {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting Recommendations...
                  </>
                ) : (
                  "Get Recommendations"
                )}
              </Button>
            </form>
          </Form>

          {recommendations.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Recommendations</h3>
              <div className="space-y-4">
                {recommendations.map((rec, idx) => (
                  <Card key={idx} className="overflow-hidden">
                    <div className="bg-gradient-to-r from-green-50 to-green-100 px-4 py-2 border-b flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="flex space-x-1 mr-2">
                          {Array.from({ length: rec.score }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                          ))}
                          {Array.from({ length: 5 - rec.score }).map((_, i) => (
                            <Star key={i + rec.score} className="h-4 w-4 text-gray-300" />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">Match score: {rec.score}/5</span>
                      </div>
                      <a
                        href={rec.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-700 hover:text-green-900 flex items-center"
                      >
                        View Details <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-2">
                        <h4 className="font-medium text-lg">{getTestName(rec.url)}</h4>
                        <p className="text-sm text-gray-700">{rec.description}</p>

                        <div className="flex flex-wrap gap-2 mt-1">
                          {rec.test_type.map((type, i) => (
                            <Badge key={i} variant="outline" className="bg-slate-50">
                              {type}
                            </Badge>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 mr-1 text-gray-500" />
                            <span>{rec.duration} minutes</span>
                          </div>
                          <div className="flex items-center text-sm">
                            {rec.remote_support === "Yes" ? (
                              <>
                                <Check className="h-4 w-4 mr-1 text-green-600" /> Remote Support
                              </>
                            ) : (
                              <>
                                <X className="h-4 w-4 mr-1 text-red-500" /> No Remote Support
                              </>
                            )}
                          </div>
                          <div className="flex items-center text-sm">
                            {rec.adaptive_support === "Yes" ? (
                              <>
                                <Check className="h-4 w-4 mr-1 text-green-600" /> Adaptive
                              </>
                            ) : (
                              <>
                                <X className="h-4 w-4 mr-1 text-red-500" /> Not Adaptive
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-slate-50 px-4 py-2 border-t">
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Why this test: </span>
                        {rec.reason}
                      </p>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {recommendations.length === 0 && !loading && (
            <div className="mt-8 text-center py-8 text-slate-500">
              <p>Submit the form to see assessment recommendations</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
