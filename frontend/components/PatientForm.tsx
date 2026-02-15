"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState } from "react"
import { Loader2, Languages, Watch } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { VoiceInput } from "@/components/VoiceInput"

const symptomOptions = [
  "Chest Pain",
  "Shortness of Breath",
  "Fever",
  "Headache",
  "Dizziness",
  "Fatigue",
  "Nausea",
  "Cough",
]

const languageOptions = ["English", "Hindi", "Tamil", "Telugu", "Spanish"]

const formSchema = z
  .object({
    name: z.string().min(1, "Patient name is required"),
    age: z.number().min(0).max(120),
    gender: z.string().min(1, "Gender is required"),
    symptoms: z.array(z.string()),
    symptoms_text: z.string().optional(),
    bp: z.string().regex(/^\d{2,3}\/\d{2,3}$/, "Invalid BP format (e.g. 120/80)"),
    heart_rate: z.number().min(30).max(250),
    temperature: z.number().min(90).max(110),
    conditions: z.string().optional(),
    ehr_text: z.string().optional(),
  })
  .refine(
    (value) => value.symptoms.length > 0 || Boolean(value.symptoms_text?.trim()),
    {
      message: "Add at least one symptom via checklist, text, or voice.",
      path: ["symptoms"],
    }
  )

type FormValues = z.infer<typeof formSchema>

type AnalysisResult = {
  risk_level: "Low" | "Medium" | "High"
  department: string
  confidence: number
  explanation: string
  contributing_factors: string[]
  bias_warning?: string
}

type WearableRisk = {
  risk_level: "Low" | "Medium" | "High"
  explanation: string
  confidence: number
}

type TranslateResponse = {
  translated_text: string
}

type WearableFile = {
  heart_rate_stream: number[]
  oxygen_level_stream: number[]
}

interface PatientFormProps {
  onTriageComplete?: () => void
}

export function PatientForm({ onTriageComplete }: PatientFormProps) {
  const [loading, setLoading] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [inputLanguage, setInputLanguage] = useState("English")
  const [pdfText, setPdfText] = useState("")
  const [wearableRisk, setWearableRisk] = useState<WearableRisk | null>(null)
  const [statusMessage, setStatusMessage] = useState("")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      age: 0,
      gender: "",
      symptoms: [],
      symptoms_text: "",
      bp: "",
      heart_rate: 70,
      temperature: 98.6,
      conditions: "",
      ehr_text: "",
    },
  })

  const translateText = async (text: string, targetLang: string): Promise<string> => {
    if (!text.trim()) return text
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, target_lang: targetLang }),
      })
      if (!response.ok) return text
      const data: TranslateResponse = await response.json()
      return data.translated_text || text
    } catch {
      return text
    }
  }

  const maybeTranslateToEnglish = async (text: string): Promise<string> => {
    if (!text.trim() || inputLanguage === "English") return text
    return translateText(text, "English")
  }

  const handleTranslateSymptoms = async () => {
    const text = form.getValues("symptoms_text") || ""
    if (!text.trim() || inputLanguage === "English") return
    setTranslating(true)
    setStatusMessage("")
    try {
      const translated = await translateText(text, "English")
      form.setValue("symptoms_text", translated, { shouldValidate: true })
      setStatusMessage("Symptoms translated to English for model-safe triage.")
    } finally {
      setTranslating(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setStatusMessage("Extracting text from PDF...")
    try {
      const text = await extractTextFromPDF(file)
      if (!text.trim()) {
        setStatusMessage("No readable text found in PDF. Ensure it's a text-based PDF.")
        return
      }
      setPdfText(text)
      form.setValue("ehr_text", text, { shouldValidate: true })

      // Send to AI for structured extraction
      setStatusMessage("Analyzing medical record with AI...")
      try {
        const parseRes = await fetch("/api/parse-ehr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        })
        if (parseRes.ok) {
          const parsed = await parseRes.json()
          const filled: string[] = []

          if (parsed.name) {
            form.setValue("name", parsed.name, { shouldValidate: true })
            filled.push("Name")
          }
          if (parsed.age && typeof parsed.age === "number") {
            form.setValue("age", parsed.age, { shouldValidate: true })
            filled.push("Age")
          }
          if (parsed.gender) {
            form.setValue("gender", parsed.gender, { shouldValidate: true })
            filled.push("Gender")
          }
          if (parsed.bp) {
            form.setValue("bp", parsed.bp, { shouldValidate: true })
            filled.push("BP")
          }
          if (parsed.heart_rate && typeof parsed.heart_rate === "number") {
            form.setValue("heart_rate", parsed.heart_rate, { shouldValidate: true })
            filled.push("Heart Rate")
          }
          if (parsed.temperature && typeof parsed.temperature === "number") {
            form.setValue("temperature", parsed.temperature, { shouldValidate: true })
            filled.push("Temperature")
          }
          if (Array.isArray(parsed.conditions) && parsed.conditions.length > 0) {
            form.setValue("conditions", parsed.conditions.join(", "), { shouldValidate: true })
            filled.push("Conditions")
          }
          if (Array.isArray(parsed.symptoms) && parsed.symptoms.length > 0) {
            const currentText = form.getValues("symptoms_text") || ""
            const symptomStr = parsed.symptoms.join(", ")
            form.setValue("symptoms_text", currentText ? `${currentText}; ${symptomStr}` : symptomStr, { shouldValidate: true })
            filled.push("Symptoms")
          }

          if (filled.length > 0) {
            setStatusMessage(`✅ Auto-filled from PDF: ${filled.join(", ")}. Review and correct if needed.`)
          } else {
            setStatusMessage("PDF extracted but no structured data found. Raw text saved.")
          }
        } else {
          setStatusMessage(`PDF text extracted (${text.length} chars). AI parsing unavailable.`)
        }
      } catch {
        setStatusMessage(`PDF text extracted (${text.length} chars). AI parsing unavailable.`)
      }
    } catch (error) {
      console.error("PDF extraction failed", error)
      setStatusMessage("Failed to parse PDF. Please upload a valid text-based PDF.")
    }
  }

  const handleWearableUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const parsed = JSON.parse(await file.text()) as WearableFile
      if (!Array.isArray(parsed.heart_rate_stream) || !Array.isArray(parsed.oxygen_level_stream)) {
        throw new Error("Missing required wearable arrays")
      }

      const response = await fetch("/api/analyze-wearable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      })
      if (!response.ok) {
        throw new Error("Wearable analysis failed")
      }

      const result: WearableRisk = await response.json()
      setWearableRisk(result)
      setStatusMessage("Wearable stream integrated into triage context.")
    } catch (error) {
      console.error(error)
      setStatusMessage("Invalid wearable JSON. Expected heart_rate_stream and oxygen_level_stream arrays.")
    }
  }

  async function onSubmit(values: FormValues) {
    setLoading(true)
    setStatusMessage("")
    try {
      const parsedConditions = values.conditions
        ? values.conditions.split(",").map((condition) => condition.trim()).filter(Boolean)
        : []

      const translatedSymptomsText = await maybeTranslateToEnglish(values.symptoms_text || "")
      const wearableSummary = wearableRisk ? `Wearable Insight: ${wearableRisk.explanation}` : ""
      const mergedSymptomsText = [translatedSymptomsText, wearableSummary].filter(Boolean).join(" ").trim()

      const normalizedSymptoms =
        values.symptoms.length > 0
          ? values.symptoms
          : mergedSymptomsText
            ? [mergedSymptomsText]
            : []

      const analyzePayload = {
        ...values,
        symptoms: normalizedSymptoms,
        symptoms_text: mergedSymptomsText,
        conditions: parsedConditions,
      }

      const analyzeResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analyzePayload),
      })
      if (!analyzeResponse.ok) throw new Error("Risk analysis failed")

      const result: AnalysisResult = await analyzeResponse.json()
      const factors = Array.isArray(result.contributing_factors) ? [...result.contributing_factors] : []
      if (result.bias_warning) factors.push(`Bias Note: ${result.bias_warning}`)
      if (wearableRisk) factors.push(`Wearable Risk: ${wearableRisk.risk_level}`)

      const persistPayload = {
        age: values.age,
        gender: values.gender,
        symptoms: normalizedSymptoms,
        symptoms_text: mergedSymptomsText,
        bp: values.bp,
        heart_rate: values.heart_rate,
        temperature: values.temperature,
        conditions: parsedConditions,
        ehr_text: values.ehr_text || "",
        risk_level: result.risk_level,
        department: result.department,
        confidence: result.confidence,
        explanation: result.explanation,
        contributing_factors: factors,
      }

      const saveResponse = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(persistPayload),
      })
      if (!saveResponse.ok) throw new Error("Could not save patient record")

      if (onTriageComplete) onTriageComplete()
    } catch (error) {
      console.error(error)
      setStatusMessage("Triage failed. Verify API keys, backend URL, and required fields.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-md border border-border/30 bg-muted/20 p-3 text-xs text-muted-foreground">
          Supports multilingual intake, voice input, document parsing, and wearable stream integration.
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Patient Name</FormLabel>
              <FormControl>
                <Input placeholder="Full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="symptoms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Symptoms Checklist</FormLabel>
              <div className="grid grid-cols-2 gap-2 rounded-md border p-3">
                {symptomOptions.map((symptom) => {
                  const checked = field.value?.includes(symptom)
                  return (
                    <label key={symptom} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(isChecked) => {
                          if (isChecked) {
                            field.onChange([...(field.value || []), symptom])
                          } else {
                            field.onChange((field.value || []).filter((value) => value !== symptom))
                          }
                        }}
                      />
                      <span>{symptom}</span>
                    </label>
                  )
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="symptoms_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Symptoms Free Text / Voice</FormLabel>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Select value={inputLanguage} onValueChange={setInputLanguage}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languageOptions.map((language) => (
                        <SelectItem key={language} value={language}>
                          {language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={inputLanguage === "English" || translating}
                    onClick={handleTranslateSymptoms}
                  >
                    {translating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Languages className="mr-2 h-4 w-4" />}
                    Translate to English
                  </Button>
                </div>
                <div className="flex gap-2">
                  <FormControl>
                    <Textarea placeholder="Describe symptoms..." {...field} />
                  </FormControl>
                  <VoiceInput
                    language={speechLocaleForLanguage(inputLanguage)}
                    onTranscript={(text) => {
                      const current = form.getValues("symptoms_text")
                      form.setValue("symptoms_text", current ? `${current} ${text}` : text, { shouldValidate: true })
                    }}
                  />
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="bp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Blood Pressure</FormLabel>
                <FormControl>
                  <Input placeholder="120/80" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="heart_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heart Rate</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="temperature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temp (F)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="conditions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pre-existing Conditions (comma separated)</FormLabel>
              <FormControl>
                <Input placeholder="Diabetes, Hypertension..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Medical Record PDF</FormLabel>
          <FormControl>
            <Input type="file" accept="application/pdf" onChange={handleFileUpload} />
          </FormControl>
          {pdfText && <p className="text-xs text-emerald-400">Extracted {pdfText.length} characters from PDF.</p>}
        </FormItem>

        <FormItem>
          <FormLabel>Wearable Data (JSON)</FormLabel>
          <FormControl>
            <Input type="file" accept=".json" onChange={handleWearableUpload} />
          </FormControl>
          <p className="text-xs text-muted-foreground">
            Expected keys: <code>heart_rate_stream</code> and <code>oxygen_level_stream</code>.
          </p>
          {wearableRisk && (
             <div className="mt-2 rounded-md border border-border/30 bg-muted/20 p-3 text-sm">
               <div className="mb-2 flex items-center gap-2">
                 <Watch className="h-4 w-4 text-primary" />
                 <span className="font-medium">Wearable Analysis</span>
                 <Badge variant={wearableRisk.risk_level === "High" ? "destructive" : wearableRisk.risk_level === "Medium" ? "default" : "secondary"}>
                   {wearableRisk.risk_level}
                 </Badge>
               </div>
               <p className="text-muted-foreground">{wearableRisk.explanation}</p>
             </div>
          )}
        </FormItem>

        {statusMessage && (
          <div className="rounded-md border border-border/30 bg-muted/20 p-3 text-xs text-muted-foreground">
            {statusMessage}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Run Triage Analysis
        </Button>
      </form>
    </Form>
  )
}

type PdfTextItem = {
  str?: string
}

async function extractTextFromPDF(file: File): Promise<string> {
  if (typeof window === "undefined") return ""

  const pdfjs = await import("pdfjs-dist")
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
  let fullText = ""

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const textContent = await page.getTextContent()
    const pageText = textContent.items
      .map((item) => ("str" in item ? String((item as PdfTextItem).str || "") : ""))
      .join(" ")
    fullText += `${pageText} `
  }

  return fullText.trim()
}

function speechLocaleForLanguage(language: string): string {
  switch (language) {
    case "Hindi":
      return "hi-IN"
    case "Tamil":
      return "ta-IN"
    case "Telugu":
      return "te-IN"
    case "Spanish":
      return "es-ES"
    default:
      return "en-US"
  }
}
