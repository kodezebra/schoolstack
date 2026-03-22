import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/photo-upload'
import { 
  ArrowLeft,
  Printer,
  GraduationCap,
  Star,
  CheckCircle2,
  Heart,
  Smile,
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
  logoImage: string | null
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
      <main className="report-card-container bg-white shadow-2xl rounded-xl overflow-hidden print:shadow-none print:rounded-none w-full max-w-[210mm] min-h-[297mm] mx-auto flex flex-col relative print:m-0">
        
        {/* Playful Top Banner */}
        <div className="h-3 w-full bg-[#4ECDC4] repeating-stripe"></div>

        {/* Header Section - Shrinked */}
        <header className="px-10 py-5 flex justify-between items-center border-b-2 border-dashed border-slate-100">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden border border-slate-100">
              {reportData.school.logoImage ? (
                <img src={reportData.school.logoImage} alt="School Logo" className="w-full h-full object-contain p-1.5" />
              ) : (
                <div className="bg-[#4ECDC4] w-full h-full flex items-center justify-center">
                  <GraduationCap className="w-10 h-10 text-white" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#FF6B6B] tracking-tight leading-none mb-1 school-title">{reportData.school.name}</h1>
              <p className="text-[#4ECDC4] font-bold text-xs italic">{reportData.school.address || "Where little minds grow big!"}</p>
            </div>
          </div>
          <div className="bg-[#FFE66D] text-[#2D3436] px-5 py-2 rounded-full font-black text-base transform rotate-1 shadow-sm border-b-2 border-yellow-400/30">
            {reportData.term?.name || "Term Progress"} {reportData.academicYear?.name}
          </div>
        </header>

        {/* Student Profile Section - Shrinked */}
        <section className="px-10 py-5 bg-gradient-to-r from-[#FFF5F5] to-white flex items-center gap-8">
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-full border-[5px] border-[#4ECDC4] overflow-hidden bg-slate-100 shadow relative z-10">
              <Avatar 
                photo={reportData.student.photo}
                name={`${reportData.student.firstName} ${reportData.student.lastName}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-[#FFE66D] rounded-full flex items-center justify-center z-20 shadow transform rotate-12">
              <Star className="w-4 h-4 text-[#FF6B6B] fill-[#FF6B6B]" />
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-y-3 gap-x-10">
            <div className="space-y-0">
              <label className="text-[8px] font-black text-[#636E72] uppercase tracking-widest">Student Name</label>
              <p className="text-lg font-black text-[#2D3436] tracking-tight">{reportData.student.firstName} {reportData.student.lastName}</p>
            </div>
            <div className="space-y-0">
              <label className="text-[8px] font-black text-[#636E72] uppercase tracking-widest">Class Level</label>
              <p className="text-lg font-black text-[#2D3436] tracking-tight">{reportData.level.name}</p>
            </div>
            <div className="space-y-0">
              <label className="text-[8px] font-black text-[#636E72] uppercase tracking-widest">Admission No</label>
              <p className="text-sm font-bold text-[#2D3436]">{reportData.student.admissionNo}</p>
            </div>
            <div className="space-y-0">
              <label className="text-[8px] font-black text-[#636E72] uppercase tracking-widest">Gender</label>
              <p className="text-sm font-bold text-[#2D3436] capitalize">{reportData.student.gender}</p>
            </div>
          </div>
        </section>

        {/* Academic Content - Tighter Table */}
        <div className="px-10 py-3 flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-[#FFE66D] fill-[#FFE66D]" />
            <h2 className="text-lg font-black text-[#4ECDC4] tracking-tight">Academic Progress</h2>
          </div>

          <table className="w-full border-separate border-spacing-y-1">
            <thead>
              <tr className="text-left text-white bg-[#4ECDC4]">
                <th className="py-2.5 px-5 rounded-l-xl font-black text-[9px] uppercase tracking-widest">Learning Subject</th>
                <th className="py-2.5 px-3 text-center font-black text-[9px] uppercase tracking-widest">Score</th>
                <th className="py-2.5 px-3 text-center font-black text-[9px] uppercase tracking-widest">Effort</th>
                <th className="py-2.5 px-3 text-center font-black text-[9px] uppercase tracking-widest">Grade</th>
                <th className="py-2.5 px-5 rounded-r-xl font-black text-[9px] uppercase tracking-widest">Teacher Remarks</th>
              </tr>
            </thead>
            <tbody>
              {evaluatedSubjects.map((subject) => (
                <tr key={subject.subjectId} className="bg-slate-50/50 transition-colors group">
                  <td className="py-2.5 px-5">
                    <span className="font-black text-[#2D3436] text-sm">{subject.subjectName}</span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="font-black text-[#2D3436] text-xs">{subject.percentage !== null ? `${subject.percentage}%` : '-'}</span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex justify-center gap-0.5">
                      {[1, 2, 3].map(i => (
                        <Smile key={i} className={`w-3 h-3 ${subject.percentage && subject.percentage > (40 + i*20) ? 'text-[#FF6B6B] fill-[#FF6B6B]' : 'text-slate-200'}`} />
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

          {/* Highlights Section - Tighter */}
          <div className="mt-4 grid grid-cols-2 gap-5">
            <div className="bg-[#F8F9FA] rounded-xl p-4 border-2 border-slate-100 relative overflow-hidden">
              <h3 className="text-sm font-black text-[#FF6B6B] mb-2 flex items-center gap-2">
                <Star className="w-3.5 h-3.5 fill-[#FF6B6B]" /> Top Strengths
              </h3>
              <ul className="space-y-1.5">
                {evaluatedSubjects.slice(0, 3).map((s, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-[11px] font-bold text-[#2D3436]">
                    <CheckCircle2 className="w-3 h-3 text-[#4ECDC4]" /> {s.subjectName}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#F8F9FA] rounded-xl p-4 border-2 border-slate-100">
              <h3 className="text-sm font-black text-[#4ECDC4] mb-2 flex items-center gap-2">
                <Smile className="w-3.5 h-3.5 fill-[#4ECDC4] text-[#4ECDC4]" /> Performance Recap
              </h3>
              <div className="flex items-center justify-between mb-2">
                 <span className="text-slate-500 font-bold text-[9px] uppercase tracking-widest">Average</span>
                 <span className="text-xl font-black text-[#2D3436]">{reportData.summary.average}%</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-[9px] font-medium italic text-slate-600 leading-tight">
                "{getGradeRemarks(reportData.summary.overallGrade)}"
              </div>
            </div>
          </div>
        </div>

        {/* Footers - Shrinked */}
        <footer className="px-10 py-5 mt-auto bg-[#F0F4F8] flex justify-between items-end border-t-2 border-slate-100">
          <div className="text-center w-36">
             <div className="h-6 border-b-2 border-dashed border-slate-300 mb-1.5"></div>
             <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Class Teacher</p>
          </div>
          <div className="text-center w-36">
             <div className="h-6 border-b-2 border-dashed border-slate-300 mb-1.5"></div>
             <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Head Teacher</p>
          </div>
          <div className="text-center w-36">
             <div className="h-6 border-b-2 border-dashed border-slate-300 mb-1.5"></div>
             <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Parent/Guardian</p>
          </div>
        </footer>

        {/* Fine Print */}
        <div className="px-10 py-2.5 bg-[#FF6B6B] text-white flex justify-between items-center text-[7px] font-black uppercase tracking-[0.2em]">
           <span>KidzKave Digital School Records &copy; 2026</span>
           <span className="flex items-center gap-1.5">Sunshine Verified <Star className="w-2.5 h-2.5 fill-white" /></span>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
        
        .school-title {
          font-family: 'Quicksand', sans-serif;
        }

        .repeating-stripe {
          background: repeating-linear-gradient(
            45deg,
            #4ECDC4,
            #4ECDC4 15px,
            #45B7AF 15px,
            #45B7AF 30px
          );
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