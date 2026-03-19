import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft,
  Printer,
  User,
  GraduationCap,
  MapPin,
  Phone,
  BookOpen
} from 'lucide-react'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const Route = createFileRoute('/_dashboard/school/reports/students/$studentId')({
  component: StudentReportPage,
})

interface SchoolInfo {
  name: string
  address: string
  phone: string
  email: string
  logoType: string
  logoIcon: string
}

interface Student {
  id: string
  firstName: string
  lastName: string
  admissionNo: string
  rollNo: string | null
  gender: string
  dob: string | null
}

interface Level {
  id: string
  name: string
}

interface Term {
  id: string
  name: string
}

interface SubjectResult {
  subjectId: string
  subjectName: string
  subjectCode: string | null
  examId?: string
  examTitle: string
  marks: number
  totalMarks: number
  percentage: number
  grade: string
  gradeColor: string
  points: number
  notes: string
}

interface Summary {
  totalObtained: number
  totalMax: number
  average: number
  overallGrade: string
  overallGradeColor: string
  totalPoints: number
  subjectCount: number
  totalExams: number
  completedExams: number
}

interface ReportData {
  school: SchoolInfo
  student: Student
  level: Level
  academicYear: { id: string; name: string } | null
  term: Term | null
  subjects: SubjectResult[]
  summary: Summary
  gradeScale: { grade: string; color: string }[]
}

function StudentReportPage() {
  const { studentId } = Route.useParams()
  const [selectedTerm, setSelectedTerm] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<string>('')

  const { data: reportData, isLoading } = useQuery<ReportData>({
    queryKey: ['school-reports-student', studentId, selectedTerm, selectedYear],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (selectedYear) params.append('academicYearId', selectedYear)
      if (selectedTerm && selectedTerm !== 'all') params.append('termId', selectedTerm)
      
      const res = await apiFetch(`/school/reports/student/${studentId}?${params}`)
      if (!res.ok) throw new Error('Failed to fetch report')
      return res.json()
    },
    enabled: !!studentId
  })

  const handlePrint = () => {
    window.print()
  }

  const today = new Date().toLocaleDateString('en-UG', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  const getGradeRemarks = (grade: string): string => {
    switch (grade) {
      case 'A': return 'Excellent'
      case 'B': return 'Very Good'
      case 'C': return 'Good'
      case 'D': return 'Fair'
      default: return 'Needs Improvement'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Report not found</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Controls - Hidden when printing */}
      <div className="flex items-center justify-between mb-6 no-print">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/school/reports">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Student Report</h1>
            <p className="text-muted-foreground">View and print student performance</p>
          </div>
        </div>
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" /> Print Report
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6 no-print">
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Academic Year" />
          </SelectTrigger>
          <SelectContent>
            {reportData.academicYear && (
              <SelectItem value={reportData.academicYear.id}>{reportData.academicYear.name}</SelectItem>
            )}
          </SelectContent>
        </Select>
        <Select value={selectedTerm} onValueChange={setSelectedTerm}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Terms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Terms</SelectItem>
            {reportData.term && (
              <SelectItem value={reportData.term.id}>{reportData.term.name}</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Report Card */}
      <div className="bg-white border rounded-lg overflow-hidden shadow-sm print:shadow-none print:border-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 print:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                <GraduationCap className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-xl font-bold uppercase tracking-wide">{reportData.school.name}</h2>
                <p className="text-slate-300 text-sm">
                  {reportData.school.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {reportData.school.address}</span>}
                </p>
                <p className="text-slate-300 text-sm">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {reportData.school.phone}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <h3 className="text-lg font-semibold uppercase tracking-wider">Report Card</h3>
              <p className="text-slate-300 text-sm">
                {reportData.academicYear?.name}
              </p>
              {reportData.term && (
                <p className="text-slate-300 text-sm">{reportData.term.name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Student Info & Summary */}
        <div className="p-6 print:p-4">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Student Details */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="text-lg font-bold uppercase">{reportData.student.firstName} {reportData.student.lastName}</h4>
                  <p className="text-sm text-muted-foreground">Student</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Admission No.</p>
                  <p className="font-semibold font-mono text-sm">{reportData.student.admissionNo}</p>
                </div>
                {reportData.student.rollNo && (
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Roll No.</p>
                    <p className="font-semibold text-sm">{reportData.student.rollNo}</p>
                  </div>
                )}
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Class</p>
                  <p className="font-semibold text-sm">{reportData.level.name}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Gender</p>
                  <p className="font-semibold text-sm capitalize">{reportData.student.gender}</p>
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-lg p-5">
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-slate-300">Performance Summary</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{reportData.summary.totalObtained}<span className="text-sm font-normal text-slate-400">/{reportData.summary.totalMax}</span></p>
                  <p className="text-xs text-slate-400">Total Marks</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{reportData.summary.average}%</p>
                  <p className="text-xs text-slate-400">Average</p>
                </div>
                <div className="text-center">
                  <span 
                    className="inline-block px-3 py-1 rounded text-lg font-bold"
                    style={{ backgroundColor: reportData.summary.overallGradeColor }}
                  >
                    {reportData.summary.overallGrade}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">Grade</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{reportData.summary.subjectCount}</p>
                  <p className="text-xs text-slate-400">Subjects</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-700 text-center">
                <p className="text-sm font-medium">{getGradeRemarks(reportData.summary.overallGrade)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Performance Table */}
        <div className="px-6 pb-6 print:px-4 print:pb-4">
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-muted-foreground" />
              <h4 className="font-semibold">Subject Performance</h4>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200 print:border-black">
                  <th className="text-left py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subject</th>
                  <th className="text-center py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Score</th>
                  <th className="text-center py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Grade</th>
                  <th className="text-left py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {reportData.subjects.filter(s => s.examId).map((subject, index) => (
                  <tr key={subject.subjectId} className={index % 2 === 0 ? 'bg-muted/20' : ''}>
                    <td className="py-3">
                      <p className="font-medium">{subject.subjectName}</p>
                      {subject.subjectCode && (
                        <p className="text-xs text-muted-foreground">{subject.subjectCode}</p>
                      )}
                    </td>
                    <td className="py-3 text-center">
                      <span className="font-semibold">{subject.marks}</span>
                      <span className="text-muted-foreground">/{subject.totalMarks}</span>
                      <span className="text-xs text-muted-foreground ml-1">({subject.percentage}%)</span>
                    </td>
                    <td className="py-3 text-center">
                      <span 
                        className="inline-block px-2 py-1 rounded text-xs font-bold text-white min-w-[32px]"
                        style={{ backgroundColor: subject.gradeColor }}
                      >
                        {subject.grade}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-muted-foreground">
                      {subject.notes || getGradeRemarks(subject.grade)}
                    </td>
                  </tr>
                ))}
                {reportData.subjects.filter(s => !s.examId).length > 0 && (
                  <tr className="text-muted-foreground">
                    <td colSpan={4} className="py-2 text-sm italic">
                      {reportData.subjects.filter(s => !s.examId).length} subject(s) not evaluated
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t px-6 py-4 print:bg-white print:border-t-2 print:border-black">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Grade Scale */}
            <div>
              <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Grade Scale</h5>
              <div className="flex flex-wrap gap-2">
                {reportData.gradeScale.map((g, i) => (
                  <span 
                    key={i}
                    className="px-2 py-1 rounded text-xs font-medium text-white"
                    style={{ backgroundColor: g.color }}
                  >
                    {g.grade}
                  </span>
                ))}
              </div>
            </div>

            {/* Comments & Signatures */}
            <div className="text-right">
              <div className="mb-4">
                <p className="text-xs text-muted-foreground">Class Teacher's Comment</p>
                <div className="border-b border-slate-300 mt-1 h-6"></div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-muted-foreground">Class Teacher</p>
                  <div className="border-b border-slate-300 mt-4 h-6"></div>
                  <p className="mt-1">Signature & Date</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Headteacher</p>
                  <div className="border-b border-slate-300 mt-4 h-6"></div>
                  <p className="mt-1">Signature & Date</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t text-center text-xs text-muted-foreground no-print">
            Generated on {today} • {reportData.school.name}
          </div>
          <div className="hidden print:block text-center text-xs mt-4">
            <p>Date: {today}</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body { 
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print { 
            display: none !important; 
          }
          .bg-white { 
            width: 100%;
            box-shadow: none !important;
            border: 1px solid #000 !important;
          }
        }
      `}</style>
    </div>
  )
}
