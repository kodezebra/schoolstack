import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Mark {
  id: string
  examTitle: string
  subjectName: string
  examType: string
  examDate?: string
  marks: number
  totalMarks: number
}

interface MarksSectionProps {
  marks: Mark[]
  isLoadingMarks: boolean
}

export function MarksSection({ marks, isLoadingMarks }: MarksSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Exam Marks</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingMarks ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : marks?.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No exam results recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {marks?.map((mark) => {
              const percentage = Math.round((mark.marks / mark.totalMarks) * 100)
              return (
                <div key={mark.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{mark.examTitle}</p>
                      <Badge variant={percentage >= 50 ? 'default' : 'destructive'}>
                        {percentage}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {mark.subjectName} • {mark.examType} • {mark.examDate ? new Date(mark.examDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{mark.marks} / {mark.totalMarks}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
