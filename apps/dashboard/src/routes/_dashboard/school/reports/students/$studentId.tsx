import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/photo-upload'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft,
  Printer,
  GraduationCap,
  Star,
  CheckCircle2,
  Smile,
  Pencil,
  Save,
  X,
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

interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  header: string
  text: string
  background: string
  tableHeader: string
  tableRow: string
  footer: string
}

interface SchoolInfo {
  name: string
  address: string
  phone: string
  email: string
  logoType: string
  logoIcon: string
  logoImage: string | null
  reportCardTheme: string
  themeColors: ThemeColors
}

interface Student {
  id: string
  firstName: string
  lastName: string
  admissionNo: string
  rollNo: string | null
  gender: string
  dob: string | null
  photo?: string | null
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
  examId?: string | null
  examTitle?: string | null
  marks: number | null
  totalMarks: number | null
  percentage: number | null
  grade: string | null
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
  aggregate: number
  division: string
  divisionStanding: string
  divisionColor: string
}

interface ReportData {
  school: SchoolInfo
  student: Student
  level: Level
  academicYear: { id: string; name: string } | null
  term: Term | null
  subjects: SubjectResult[]
  summary: Summary
  gradeScale: { grade: string; color: string; minMarks: number }[]
  teacherRemarks: string
}

function StudentReportPage() {
  const { studentId } = Route.useParams()
  const [selectedTerm, setSelectedTerm] = useState<string>('')
  const [selectedYear] = useState<string>('')
  const [isEditingRemarks, setIsEditingRemarks] = useState(false)
  const [editedRemarks, setEditedRemarks] = useState('')
  const queryClient = useQueryClient()

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

  const saveRemarksMutation = useMutation({
    mutationFn: async (remarks: string) => {
      const params = new URLSearchParams()
      if (selectedYear) params.append('academicYearId', selectedYear)
      if (selectedTerm && selectedTerm !== 'all') params.append('termId', selectedTerm)
      
      const res = await apiFetch('/school/remarks', {
        method: 'POST',
        body: JSON.stringify({
          studentId,
          academicYearId: selectedYear || reportData?.academicYear?.id,
          termId: selectedTerm || reportData?.term?.id,
          remarks
        })
      })
      if (!res.ok) throw new Error('Failed to save remarks')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-reports-student', studentId, selectedTerm, selectedYear] })
      setIsEditingRemarks(false)
    }
  })

  const handlePrint = () => {
    window.print()
  }

  const getGradeRemarks = (grade: string | null): string => {
    if (!grade) return 'Keep trying!'
    switch (grade) {
      case 'A': return 'Amazing work! You are a superstar.'
      case 'B': return 'Great job! Keep up the good work.'
      case 'C': return 'Good progress, keep practicing!'
      case 'D': return 'Keep working hard, you can do it!'
      default: return 'Let\'s work together to improve.'
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

  const theme = reportData.school.themeColors
  const evaluatedSubjects = [...reportData.subjects]
    .sort((a, b) => (b.percentage || 0) - (a.percentage || 0))

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto font-sans">
      {/* Controls - Hidden when printing */}
      <div className="flex items-center justify-between mb-4 no-print">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-slate-100 h-8 w-8">
            <Link to="/school/reports">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Report Card</h1>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedTerm} onValueChange={setSelectedTerm}>
            <SelectTrigger className="w-36 h-9 bg-white">
              <SelectValue placeholder="Select Term" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Full Year</SelectItem>
              {reportData.term && <SelectItem value={reportData.term.id}>{reportData.term.name}</SelectItem>}
            </SelectContent>
          </Select>
          <Button onClick={handlePrint} className="bg-[#FF6B6B] hover:bg-[#ee5a5a] h-9 text-white rounded-full px-6 shadow shadow-red-100">
            <Printer className="mr-2 h-4 w-4" /> Print Report
          </Button>
        </div>
      </div>

      {/* Report Card - COMPACT Single Page Layout */}
      <main 
        className="report-card-container shadow-2xl rounded-xl overflow-hidden print:shadow-none print:rounded-none w-full max-w-[210mm] min-h-[297mm] mx-auto flex flex-col relative print:m-0"
        style={{ backgroundColor: theme.background }}
      >
        
        {/* Top Banner */}
        <div className="h-3 w-full" style={{ backgroundColor: theme.primary }}></div>

        {/* Header Section */}
        <header className="px-10 py-5 flex justify-between items-center border-b-2 border-dashed border-slate-100">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden border border-slate-100">
              {reportData.school.logoImage ? (
                <img src={reportData.school.logoImage} alt="School Logo" className="w-full h-full object-contain p-1.5" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: theme.primary }}>
                  <GraduationCap className="w-10 h-10 text-white" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight leading-none mb-1 school-title" style={{ color: theme.header }}>{reportData.school.name}</h1>
              <p className="font-bold text-xs italic" style={{ color: theme.primary }}>{reportData.school.address || "Where little minds grow big!"}</p>
            </div>
          </div>
          <div className="px-5 py-2 rounded-full font-black text-base transform rotate-1 shadow-sm" style={{ backgroundColor: theme.accent, color: theme.text }}>
            {reportData.term?.name || "Term Progress"} {reportData.academicYear?.name}
          </div>
        </header>

        {/* Student Profile Section */}
        <section className="px-10 py-5 flex items-center gap-8" style={{ backgroundColor: `${theme.primary}10` }}>
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-full border-[5px] overflow-hidden bg-slate-100 shadow relative z-10" style={{ borderColor: theme.primary }}>
              <Avatar 
                photo={reportData.student.photo}
                name={`${reportData.student.firstName} ${reportData.student.lastName}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center z-20 shadow transform rotate-12" style={{ backgroundColor: theme.accent }}>
              <Star className="w-4 h-4" style={{ color: theme.secondary, fill: theme.secondary }} />
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-y-3 gap-x-10">
            <div className="space-y-0">
              <label className="text-[8px] font-black uppercase tracking-widest" style={{ color: theme.text }}>Student Name</label>
              <p className="text-lg font-black tracking-tight" style={{ color: theme.text }}>{reportData.student.firstName} {reportData.student.lastName}</p>
            </div>
            <div className="space-y-0">
              <label className="text-[8px] font-black uppercase tracking-widest" style={{ color: theme.text }}>Class Level</label>
              <p className="text-lg font-black tracking-tight" style={{ color: theme.text }}>{reportData.level.name}</p>
            </div>
            <div className="space-y-0">
              <label className="text-[8px] font-black uppercase tracking-widest" style={{ color: theme.text }}>Admission No</label>
              <p className="text-sm font-bold" style={{ color: theme.text }}>{reportData.student.admissionNo}</p>
            </div>
            <div className="space-y-0">
              <label className="text-[8px] font-black uppercase tracking-widest" style={{ color: theme.text }}>Gender</label>
              <p className="text-sm font-bold capitalize" style={{ color: theme.text }}>{reportData.student.gender}</p>
            </div>
          </div>
        </section>

        {/* Academic Content */}
        <div className="px-10 py-3 flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4" style={{ color: theme.accent, fill: theme.accent }} />
            <h2 className="text-lg font-black tracking-tight" style={{ color: theme.primary }}>Academic Progress</h2>
          </div>

          <table className="w-full border-separate border-spacing-y-1">
            <thead>
              <tr className="text-left text-white" style={{ backgroundColor: theme.tableHeader }}>
                <th className="py-2.5 px-5 rounded-l-xl font-black text-[9px] uppercase tracking-widest">Learning Subject</th>
                <th className="py-2.5 px-3 text-center font-black text-[9px] uppercase tracking-widest">Score</th>
                <th className="py-2.5 px-3 text-center font-black text-[9px] uppercase tracking-widest">Effort</th>
                <th className="py-2.5 px-3 text-center font-black text-[9px] uppercase tracking-widest">Grade</th>
                <th className="py-2.5 px-5 rounded-r-xl font-black text-[9px] uppercase tracking-widest">Teacher Remarks</th>
              </tr>
            </thead>
            <tbody>
              {evaluatedSubjects.map((subject) => (
                <tr key={subject.subjectId} className="transition-colors group" style={{ backgroundColor: theme.tableRow }}>
                  <td className="py-2.5 px-5">
                    <span className="font-black text-sm" style={{ color: theme.text }}>{subject.subjectName}</span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="font-black text-xs" style={{ color: theme.text }}>{subject.percentage !== null ? `${subject.percentage}%` : '-'}</span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex justify-center gap-0.5">
                      {[1, 2, 3].map(i => (
                        <Smile key={i} className={`w-3 h-3 ${subject.percentage && subject.percentage > (40 + i*20) ? '' : ''}`} style={{ color: subject.percentage && subject.percentage > (40 + i*20) ? theme.secondary : '#e5e7eb', fill: subject.percentage && subject.percentage > (40 + i*20) ? theme.secondary : '#e5e7eb' }} />
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span 
                      className="inline-flex items-center justify-center w-7 h-7 rounded text-white text-[9px] font-black shadow-sm"
                      style={{ backgroundColor: subject.gradeColor || '#4ECDC4' }}
                    >
                      {subject.grade || '-'}
                    </span>
                  </td>
                  <td className="py-2.5 px-5">
                    <p className="text-[9px] text-slate-500 font-medium italic leading-snug line-clamp-1">
                      "{subject.notes || getGradeRemarks(subject.grade)}"
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Highlights Section */}
          <div className="mt-4 space-y-4">
            {/* Top Strengths + Performance Recap */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl p-4 border-2 relative overflow-hidden" style={{ backgroundColor: theme.tableRow, borderColor: `${theme.primary}20` }}>
                <h3 className="text-sm font-black mb-3 flex items-center gap-2" style={{ color: theme.secondary }}>
                  <Star className="w-3.5 h-3.5" style={{ color: theme.secondary, fill: theme.secondary }} /> Top Strengths
                </h3>
                <ul className="space-y-2">
                  {evaluatedSubjects.slice(0, 4).map((s, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-[11px] font-bold" style={{ color: theme.text }}>
                      <CheckCircle2 className="w-3 h-3" style={{ color: theme.primary }} /> {s.subjectName}
                      <span className="text-[9px] text-slate-400 font-medium ml-auto">{s.percentage}%</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl p-4 border-2" style={{ backgroundColor: theme.tableRow, borderColor: `${theme.primary}20` }}>
                <h3 className="text-sm font-black mb-3 flex items-center gap-2" style={{ color: theme.primary }}>
                  <Smile className="w-3.5 h-3.5" style={{ color: theme.primary, fill: theme.primary }} /> Performance Recap
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold text-[9px] uppercase tracking-widest">Average</span>
                    <span className="text-lg font-black" style={{ color: theme.text }}>{reportData.summary.average}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold text-[9px] uppercase tracking-widest">Total Points</span>
                    <span className="text-lg font-black" style={{ color: theme.text }}>{reportData.summary.totalPoints}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold text-[9px] uppercase tracking-widest">Exams</span>
                    <span className="text-lg font-black" style={{ color: theme.text }}>{reportData.summary.completedExams}/{reportData.summary.totalExams}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Row */}
            <div className="rounded-xl p-4 border-2" style={{ backgroundColor: `${theme.accent}20`, borderColor: `${theme.accent}50` }}>
              <h3 className="text-sm font-black mb-3 flex items-center gap-2" style={{ color: theme.text }}>
                <GraduationCap className="w-3.5 h-3.5" style={{ color: theme.primary }} /> Summary
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Division</div>
                  <div className="flex flex-col items-center gap-1">
                    <span 
                      className="inline-block px-3 py-1.5 rounded-lg text-lg font-black text-white shadow"
                      style={{ backgroundColor: reportData.summary.divisionColor }}
                    >
                      {reportData.summary.division}
                    </span>
                    <span className="text-[8px] text-slate-500 font-medium">{reportData.summary.divisionStanding}</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Aggregate</div>
                  <div className="text-2xl font-black" style={{ color: theme.text }}>{reportData.summary.aggregate}</div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total Score</div>
                  <div className="text-2xl font-black" style={{ color: theme.text }}>{reportData.summary.totalObtained}/{reportData.summary.totalMax}</div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Overall Grade</div>
                  <span 
                    className="inline-block px-4 py-1.5 rounded-lg text-lg font-black text-white"
                    style={{ backgroundColor: reportData.summary.overallGradeColor }}
                  >
                    {reportData.summary.overallGrade}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Teacher Remarks */}
          <div className="mt-4 p-4 rounded-xl border-2" style={{ backgroundColor: theme.background, borderColor: `${theme.primary}20` }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black flex items-center gap-2" style={{ color: theme.primary }}>
                <Smile className="w-3.5 h-3.5" style={{ color: theme.primary }} /> Teacher's Remarks
              </h3>
              {!isEditingRemarks ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[10px] gap-1 text-muted-foreground hover:opacity-80 no-print"
                  onClick={() => {
                    setEditedRemarks(reportData.teacherRemarks || '')
                    setIsEditingRemarks(true)
                  }}
                >
                  <Pencil className="w-3 h-3" /> Edit
                </Button>
              ) : (
                <div className="flex items-center gap-2 no-print">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[10px] gap-1 text-muted-foreground"
                    onClick={() => setIsEditingRemarks(false)}
                  >
                    <X className="w-3 h-3" /> Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-[10px] gap-1 text-white"
                    style={{ backgroundColor: theme.primary }}
                    onClick={() => saveRemarksMutation.mutate(editedRemarks)}
                    disabled={saveRemarksMutation.isPending}
                  >
                    <Save className="w-3 h-3" /> Save
                  </Button>
                </div>
              )}
            </div>
            {isEditingRemarks ? (
              <Textarea
                value={editedRemarks}
                onChange={(e) => setEditedRemarks(e.target.value)}
                placeholder="Enter teacher's remarks..."
                className="text-[11px] min-h-[60px] resize-none"
              />
            ) : (
              <p className="text-[11px] text-slate-600 font-medium italic leading-relaxed">
                "{reportData.teacherRemarks || getGradeRemarks(reportData.summary.overallGrade)}"
              </p>
            )}
          </div>
        </div>

        {/* Footers - Shrinked */}
        <footer className="px-10 py-5 mt-auto flex justify-between items-end border-t-2" style={{ backgroundColor: theme.footer, borderColor: `${theme.primary}20` }}>
          <div className="text-center w-36">
             <div className="h-6 border-b-2 border-dashed mb-1.5" style={{ borderColor: `${theme.primary}40` }}></div>
             <p className="text-[8px] font-black uppercase tracking-widest" style={{ color: `${theme.text}80` }}>Class Teacher</p>
          </div>
          <div className="text-center w-36">
             <div className="h-6 border-b-2 border-dashed mb-1.5" style={{ borderColor: `${theme.primary}40` }}></div>
             <p className="text-[8px] font-black uppercase tracking-widest" style={{ color: `${theme.text}80` }}>Head Teacher</p>
          </div>
          <div className="text-center w-36">
             <div className="h-6 border-b-2 border-dashed mb-1.5" style={{ borderColor: `${theme.primary}40` }}></div>
             <p className="text-[8px] font-black uppercase tracking-widest" style={{ color: `${theme.text}80` }}>Parent/Guardian</p>
          </div>
        </footer>

        {/* Fine Print */}
        <div className="px-10 py-2.5 flex justify-between items-center text-[7px] font-black uppercase tracking-[0.2em]" style={{ backgroundColor: theme.secondary, color: 'white' }}>
           <span>{reportData.school.name} Report Card</span>
           <span className="flex items-center gap-1.5">Generated by KidzKave <Star className="w-2.5 h-2.5" style={{ fill: 'white' }} /></span>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
        
        .school-title {
          font-family: 'Quicksand', sans-serif;
        }

        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body { 
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print { display: none !important; }
          .report-card-container {
            box-shadow: none !important;
            border: none !important;
            width: 210mm !important;
            height: 297mm !important;
            max-width: 210mm !important;
            max-height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
          }
          /* Fix for Chrome/Safari background printing */
          * {
            -webkit-print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  )
}