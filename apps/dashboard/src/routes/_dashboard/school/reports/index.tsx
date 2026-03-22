import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar } from '@/components/ui/photo-upload'
import { 
  BarChart3,
  FileText,
  Eye,
  Printer,
  GraduationCap
} from 'lucide-react'
import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const Route = createFileRoute('/_dashboard/school/reports/')({
  component: ReportsPage,
})

interface SchoolInfo {
  name: string
  address: string
  phone: string
  email: string
  logoType: string
  logoIcon: string
  logoImage: string | null
}

interface Level {
  id: string
  name: string
}

interface Term {
  id: string
  name: string
}

interface ExamSet {
  id: string
  name: string
}

interface AcademicYear {
  id: string
  name: string
}

interface StudentSubjectResult {
  subjectId: string
  subjectName: string
  percentage: number
  grade: string | null
  gradeColor: string
}

interface StudentReport {
  studentId: string
  studentName: string
  admissionNo: string
  rollNo: string | null
  gender: string
  photo?: string | null
  subjects: StudentSubjectResult[]
  summary: {
    totalObtained: number
    totalMax: number
    average: number
    overallGrade: string
    overallGradeColor: string
    subjectCount: number
    rank: number
    rankSuffix: string
  }
}

interface ReportData {
  school: SchoolInfo
  level: { id: string; name: string }
  academicYear: { id: string; name: string } | null
  term: Term | null
  examSet: ExamSet | null
  subjects: { id: string; name: string; code: string | null }[]
  students: StudentReport[]
  gradeScale: { grade: string; color: string }[]
}

function ReportsPage() {
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [selectedTerm, setSelectedTerm] = useState<string>('')
  const [selectedLevel, setSelectedLevel] = useState<string>('')
  const [sortBy, setSortBy] = useState<'rank' | 'name' | 'average'>('rank')

  const { data: academicYears } = useQuery<AcademicYear[]>({
    queryKey: ['academic-years'],
    queryFn: async () => {
      const res = await apiFetch('/school/academic-years')
      if (!res.ok) return []
      return res.json()
    }
  })

  const { data: terms } = useQuery<Term[]>({
    queryKey: ['school-terms', selectedYear],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (selectedYear !== 'all' && selectedYear) params.set('academicYearId', selectedYear)
      const res = await apiFetch(`/school/terms?${params}`)
      if (!res.ok) return []
      return res.json()
    },
    enabled: !!selectedYear
  })

  const { data: levels } = useQuery<Level[]>({
    queryKey: ['school-levels', selectedYear],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (selectedYear !== 'all' && selectedYear) params.set('academicYearId', selectedYear)
      const res = await apiFetch(`/school/levels?${params}`)
      if (!res.ok) return []
      return res.json()
    },
    enabled: !!selectedYear
  })

  useEffect(() => {
    if (academicYears && academicYears.length > 0 && !selectedYear) {
      setSelectedYear(academicYears[0].id)
    }
  }, [academicYears])

  useEffect(() => {
    if (terms && terms.length > 0 && !selectedTerm) {
      setSelectedTerm(terms[0].id)
    }
  }, [terms])

  useEffect(() => {
    if (levels && levels.length > 0 && !selectedLevel) {
      setSelectedLevel(levels[0].id)
    }
  }, [levels])

  const { data: reportData, isLoading } = useQuery<ReportData>({
    queryKey: ['school-reports', selectedLevel, selectedTerm, selectedYear],
    queryFn: async () => {
      if (!selectedLevel) return null
      const params = new URLSearchParams()
      if (selectedYear !== 'all' && selectedYear) params.append('academicYearId', selectedYear)
      if (selectedTerm && selectedTerm !== 'all') params.append('termId', selectedTerm)
      
      const res = await apiFetch(`/school/reports/class/${selectedLevel}?${params}`)
      if (!res.ok) throw new Error('Failed to fetch report')
      return res.json()
    },
    enabled: !!selectedLevel
  })

  const currentYear = academicYears?.find(y => y.id === selectedYear)
  const currentTerm = terms?.find(t => t.id === selectedTerm)
  const currentLevel = levels?.find(l => l.id === selectedLevel)

  const sortedStudents = reportData?.students ? [...reportData.students].sort((a, b) => {
    if (sortBy === 'rank') return a.summary.rank - b.summary.rank
    if (sortBy === 'name') return a.studentName.localeCompare(b.studentName)
    if (sortBy === 'average') return b.summary.average - a.summary.average
    return 0
  }) : []

  const handlePrint = () => {
    window.print()
  }

  const today = new Date().toLocaleDateString('en-UG', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header - Hidden when printing */}
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Class Reports</h1>
          <p className="text-muted-foreground mt-1">Generate and view class-wise exam reports</p>
        </div>
      </div>

      {/* Filters - Hidden when printing */}
      <Card className="no-print">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-muted-foreground">Year:</label>
              <Select value={selectedYear} onValueChange={(v) => { setSelectedYear(v); setSelectedTerm(''); setSelectedLevel(''); }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears?.map(year => (
                    <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-muted-foreground">Term:</label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm} disabled={!selectedYear}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Terms</SelectItem>
                  {terms?.map(term => (
                    <SelectItem key={term.id} value={term.id}>{term.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-muted-foreground">Class:</label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel} disabled={!selectedYear}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {levels?.map(level => (
                    <SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1"></div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-muted-foreground">Sort:</label>
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rank">By Rank</SelectItem>
                  <SelectItem value="name">By Name</SelectItem>
                  <SelectItem value="average">By Average</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {!selectedLevel ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BarChart3 className="h-16 w-16 text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground text-lg">Select criteria above to generate report</p>
            <p className="text-sm text-muted-foreground mt-2">
              You can filter by academic year, term, and class
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      ) : sortedStudents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground text-lg">No report data found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Make sure exams are published for this class and term
            </p>
          </CardContent>
        </Card>
      ) : (
        /* Print Area */
        <div className="print-area space-y-4">
          {/* Print Header */}
          <div className="hidden print:block mb-6">
            <div className="flex items-center gap-4 border-b-2 border-black pb-3 mb-3">
              {reportData?.school.logoImage ? (
                <img 
                  src={reportData.school.logoImage} 
                  alt="School Logo" 
                  className="w-16 h-16 object-contain"
                />
              ) : (
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-8 h-8 text-primary" />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-xl font-bold uppercase">{reportData?.school.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {reportData?.school.address} | Tel: {reportData?.school.phone}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{currentTerm?.name || 'All Terms'}</div>
                <div className="text-xs text-muted-foreground">{currentYear?.name}</div>
                <div className="text-xs text-muted-foreground">{currentLevel?.name}</div>
              </div>
            </div>
            <h2 className="text-lg font-bold text-center uppercase">Class Report</h2>
          </div>

          {/* Report Info Bar */}
          <Card>
            <CardContent className="py-3 px-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  {currentYear && <Badge variant="outline">{currentYear.name}</Badge>}
                  {currentTerm && <Badge variant="outline">{currentTerm.name}</Badge>}
                  <Badge variant="secondary">{currentLevel?.name}</Badge>
                </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground no-print">
                  <span>{sortedStudents.length} Students • {reportData?.subjects.length || 0} Subjects</span>
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-1" /> Print
                  </Button>
                </div>
                <div className="hidden print:block text-sm">
                  Date: {today}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Report Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50 print:bg-gray-100">
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider border-b">#</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider border-b min-w-[150px]">Student Name</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider border-b">Adm No</th>
                    {reportData?.subjects.slice(0, 6).map(subject => (
                      <th key={subject.id} className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider border-b min-w-[60px]">
                        {subject.code || subject.name.substring(0, 3)}
                      </th>
                    ))}
                    <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider border-b">Total</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider border-b">Avg %</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider border-b">Grade</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider border-b">Rank</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider border-b print:hidden">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sortedStudents.map((student, index) => (
                    <tr key={student.studentId} className="hover:bg-muted/30 print:hover:bg-transparent">
                      <td className="px-3 py-2 text-sm text-muted-foreground">{index + 1}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-3">
                          <Avatar 
                            photo={student.photo}
                            name={student.studentName}
                            size="sm"
                          />
                          <div>
                            <div className="font-medium text-sm">{student.studentName}</div>
                            {student.rollNo && (
                              <div className="text-xs text-muted-foreground">Roll: {student.rollNo}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center text-xs font-mono text-muted-foreground">
                        {student.admissionNo}
                      </td>
                      {reportData?.subjects.slice(0, 6).map(subject => {
                        const subjectResult = student.subjects.find(s => s.subjectId === subject.id)
                        return (
                          <td key={subject.id} className="px-2 py-2 text-center">
                            {subjectResult?.percentage !== null ? (
                              <span 
                                className="inline-block px-1.5 py-0.5 rounded text-xs font-semibold text-white min-w-[32px]"
                                style={{ backgroundColor: subjectResult.gradeColor }}
                              >
                                {subjectResult.percentage}%
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        )
                      })}
                      <td className="px-3 py-2 text-center font-medium text-sm">
                        {student.summary.subjectCount > 0 
                          ? `${student.summary.totalObtained}/${student.summary.totalMax}`
                          : '-'
                        }
                      </td>
                      <td className="px-3 py-2 text-center text-sm">
                        {student.summary.subjectCount > 0 
                          ? `${student.summary.average.toFixed(1)}%`
                          : '-'
                        }
                      </td>
                      <td className="px-3 py-2 text-center">
                        {student.summary.subjectCount > 0 ? (
                          <span 
                            className="inline-block px-2 py-0.5 rounded text-sm font-bold text-white"
                            style={{ backgroundColor: student.summary.overallGradeColor }}
                          >
                            {student.summary.overallGrade}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center font-semibold text-sm">
                        {student.summary.rank}{student.summary.rankSuffix}
                      </td>
                      <td className="px-3 py-2 text-center print:hidden">
                        <Link to="/school/reports/students/$studentId" params={{ studentId: student.studentId }}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Grade Legend */}
          <Card>
            <CardContent className="py-3 px-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className="text-sm font-medium">Grade Scale:</span>
                <div className="flex flex-wrap items-center gap-3">
                  {reportData?.gradeScale.map((g) => (
                    <div key={g.grade} className="flex items-center gap-1.5">
                      <span 
                        className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: g.color }}
                      >
                        {g.grade}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Print Footer */}
          <div className="hidden print:block mt-8 pt-4 border-t">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-sm">Class Teacher's Signature: _________________</p>
                <p className="text-sm mt-2">Date: _________________</p>
              </div>
              <div>
                <p className="text-sm">Headteacher's Signature: _________________</p>
                <p className="text-sm mt-2">Date: _________________</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
