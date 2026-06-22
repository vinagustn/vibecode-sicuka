import fs from "fs/promises"
import path from "path"
import Link from "next/link"
import { ChevronLeft, ShieldCheck, CheckCircle2, AlertTriangle, Info, Terminal, Award } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Code Review & Security Report - Si Cuka",
  description: "Public code audit, security vulnerabilities check and standards compliance report.",
}

// Simple markdown parser helper for styled rendering
function renderMarkdown(md: string) {
  const lines = md.split("\n")
  const elements: React.ReactNode[] = []
  let inCodeBlock = false
  let codeBlockLines: string[] = []
  let inTable = false
  let tableRows: string[][] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Handle code blocks
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        inCodeBlock = false
        elements.push(
          <pre key={`code-${i}`} className="bg-slate-950 text-slate-200 p-4 rounded-xl text-xs overflow-x-auto font-mono my-3 border border-slate-800 shadow-inner">
            <code>{codeBlockLines.join("\n")}</code>
          </pre>
        )
        codeBlockLines = []
      } else {
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      codeBlockLines.push(lines[i])
      continue
    }

    // Handle Markdown tables
    if (line.startsWith("|")) {
      inTable = true
      const cells = line.split("|").map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
      
      // Skip markdown table separators like | :--- | :--- |
      if (!cells.every(c => c.startsWith(":") || c.startsWith("-") || c === "")) {
        tableRows.push(cells)
      }
      continue
    } else if (inTable) {
      inTable = false
      if (tableRows.length > 0) {
        const headers = tableRows[0]
        const bodyRows = tableRows.slice(1)
        elements.push(
          <div key={`table-${i}`} className="overflow-x-auto my-4 border border-slate-200 rounded-xl shadow-sm bg-white">
            <table className="w-full text-sm text-left text-slate-800">
              <thead className="bg-slate-50 text-xs text-slate-600 uppercase font-bold border-b border-slate-100">
                <tr>
                  {headers.map((h, idx) => (
                    <th key={idx} className="px-6 py-3.5">{h.replace(/\*\*/g, "")}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/30 transition-colors">
                    {row.map((cell, cIdx) => {
                      let cellContent: React.ReactNode = cell
                      if (cell.includes("FIXED") || cell.includes("COMPLIANT")) {
                        cellContent = (
                          <span className="inline-flex text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                            {cell}
                          </span>
                        )
                      } else if (cell.includes("Critical") || cell.includes("High")) {
                        cellContent = <span className="text-rose-600 font-bold">{cell}</span>
                      } else if (cell.includes("Medium")) {
                        cellContent = <span className="text-amber-600 font-semibold">{cell}</span>
                      }
                      return (
                        <td key={cIdx} className="px-6 py-4 font-medium">{cellContent}</td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
        tableRows = []
      }
    }

    if (line === "") continue

    // Handle Headings & Lists
    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={i} className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight my-4">
          {line.replace("# ", "")}
        </h1>
      )
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight mt-8 mb-4 border-b border-slate-100 pb-2.5">
          {line.replace("## ", "")}
        </h2>
      )
    } else if (line.startsWith("### ")) {
      const headerText = line.replace("### ", "")
      let headerIcon = <Info className="h-5 w-5 text-primary" />
      
      if (headerText.includes("✅") || headerText.includes("Selesai") || headerText.includes("FIXED")) {
        headerIcon = <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      } else if (headerText.includes("🔴") || headerText.includes("Critical")) {
        headerIcon = <AlertTriangle className="h-5 w-5 text-rose-500" />
      }
      
      elements.push(
        <h3 key={i} className="text-lg font-bold text-slate-900 flex items-center gap-2 mt-6 mb-3">
          {headerIcon}
          <span>{headerText.replace(/[✅🔴🟡]/g, "").trim()}</span>
        </h3>
      )
    } else if (line.startsWith("- ")) {
      elements.push(
        <li key={i} className="text-slate-600 text-sm ml-6 list-disc my-1">
          {line.replace("- ", "")}
        </li>
      )
    } else {
      elements.push(
        <p key={i} className="text-slate-600 text-sm my-2.5 leading-relaxed">
          {line}
        </p>
      )
    }
  }

  return elements
}

export default async function CodeReviewPage() {
  let reportContent = ""
  try {
    // Coba baca dari folder root saat ini (jika dideploy langsung dari root)
    let filePath = path.join(process.cwd(), "code_review_report.md")
    try {
      reportContent = await fs.readFile(filePath, "utf-8")
    } catch {
      // Fallback: Coba baca dari folder induk (jika berada di dalam subfolder sicuka)
      filePath = path.join(process.cwd(), "..", "code_review_report.md")
      reportContent = await fs.readFile(filePath, "utf-8")
    }
  } catch (error) {
    reportContent = "# Laporan tidak ditemukan\n\nSilakan jalankan audit terlebih dahulu."
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Kembali ke Login</span>
          </Link>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500 animate-bounce" />
            <span className="font-bold text-slate-900 text-sm tracking-wide">SI CUKA SECURITY CENTER</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Security Metrics Dashboard Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Card 1: Critical status */}
          <Card className="bg-white border-slate-100 shadow-md hover:shadow-lg transition">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Critical Vulnerabilities
              </CardTitle>
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-slate-900">0</div>
              <p className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>2 Fixed / 0 Open</span>
              </p>
            </CardContent>
          </Card>

          {/* Card 2: High status */}
          <Card className="bg-white border-slate-100 shadow-md hover:shadow-lg transition">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                High Vulnerabilities
              </CardTitle>
              <AlertTriangle className="h-5 w-5 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-slate-900">0</div>
              <p className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>1 Fixed / 0 Open</span>
              </p>
            </CardContent>
          </Card>

          {/* Card 3: AI compliance */}
          <Card className="bg-white border-slate-100 shadow-md hover:shadow-lg transition">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                AI Rules Compliance
              </CardTitle>
              <Award className="h-5 w-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-slate-900">100%</div>
              <p className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>TypeScript strict (0 'any')</span>
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Security Alert Banner */}
        <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-3 shadow-sm">
          <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-emerald-800">Sistem Lolos Audit Keamanan</h4>
            <p className="text-emerald-700 text-xs mt-1 leading-relaxed">
              Aplikasi **Si Cuka** telah diperbaiki berdasarkan celah keamanan kritis yang terdeteksi. Enkripsi cookie sesi AES-256-CBC, hashing kata sandi dengan bcryptjs, dan validasi otorisasi server-side telah terpasang dengan sukses.
            </p>
          </div>
        </div>

        {/* Report Content Card */}
        <Card className="bg-white border-slate-100 shadow-md p-6 sm:p-8 rounded-2xl">
          <article className="prose max-w-none prose-slate">
            {renderMarkdown(reportContent)}
          </article>
        </Card>
        
      </main>
    </div>
  )
}
