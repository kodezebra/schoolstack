import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { apiFetch } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import { PaymentsSection, FeeStructuresSection, BalancesSection } from './sections'
import type { FeeTab } from './sections/fee.types'

export const Route = createFileRoute('/_dashboard/school/fees/')({
  component: FeesPage,
})

function FeesPage() {
  const [activeTab, setActiveTab] = useState<FeeTab>('payments')
  const [balanceFilters, setBalanceFilters] = useState({
    academicYearId: 'all',
    levelId: 'all',
    status: 'all'
  })
  const { renderConfirmDialog } = useConfirmDialog()

  const { data: feeStructures, refetch: refetchFees } = useQuery<any[]>({
    queryKey: ['school-fees'],
    queryFn: async () => {
      const res = await apiFetch('/school/fees')
      if (!res.ok) throw new Error('Failed to fetch fees')
      return res.json()
    }
  })

  const { data: payments, refetch: refetchPayments } = useQuery<any[]>({
    queryKey: ['school-payments'],
    queryFn: async () => {
      const res = await apiFetch('/school/payments')
      if (!res.ok) throw new Error('Failed to fetch payments')
      return res.json()
    }
  })

  const { data: levels } = useQuery<any[]>({
    queryKey: ['school-levels'],
    queryFn: async () => {
      const res = await apiFetch('/school/levels')
      if (!res.ok) return []
      return res.json()
    }
  })

  const { data: academicYears } = useQuery<any[]>({
    queryKey: ['school-academic-years'],
    queryFn: async () => {
      const res = await apiFetch('/school/academic-years')
      if (!res.ok) return []
      return res.json()
    }
  })

  const { data: balancesData, isLoading: balancesLoading } = useQuery<any>({
    queryKey: ['school-fee-balances', balanceFilters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (balanceFilters.academicYearId && balanceFilters.academicYearId !== 'all') {
        params.set('academicYearId', balanceFilters.academicYearId)
      }
      if (balanceFilters.levelId && balanceFilters.levelId !== 'all') {
        params.set('levelId', balanceFilters.levelId)
      }
      if (balanceFilters.status !== 'all') {
        params.set('status', balanceFilters.status)
      }
      const res = await apiFetch(`/school/fees/balances?${params}`)
      if (!res.ok) return { students: [], totals: { totalFees: 0, totalPaid: 0, totalOutstanding: 0, totalStudents: 0, paidStudents: 0, outstandingStudents: 0 } }
      return res.json()
    }
  })

  const { data: studentsData } = useQuery<{ data: any[] }>({
    queryKey: ['school-students', 'active'],
    queryFn: async () => {
      const res = await apiFetch('/school/students?status=active&limit=1000')
      if (!res.ok) return { data: [] }
      return res.json()
    }
  })

  const students = studentsData?.data || []
  const totalCollected = payments?.reduce((sum, p) => sum + p.amount, 0) || 0

  const fmtCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb items={[{ label: 'Fee Management' }]} />
          <h1 className="text-3xl font-bold tracking-tight mt-2">Fee Management</h1>
          <p className="text-muted-foreground">Manage fee structures and record payments.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Collected</CardDescription>
            <CardTitle className="text-2xl">{fmtCurrency(totalCollected)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Fee Structures</CardDescription>
            <CardTitle className="text-2xl">{feeStructures?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Transactions</CardDescription>
            <CardTitle className="text-2xl">{payments?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FeeTab)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="structures">Fee Structures</TabsTrigger>
          <TabsTrigger value="balances">Balances</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-0">
          <PaymentsSection
            payments={payments}
            feeStructures={feeStructures}
            students={students}
            onPaymentsRefresh={refetchPayments}
          />
        </TabsContent>

        <TabsContent value="structures" className="mt-0">
          <FeeStructuresSection
            feeStructures={feeStructures}
            academicYears={academicYears}
            onFeesRefresh={refetchFees}
          />
        </TabsContent>

        <TabsContent value="balances" className="mt-0">
          <BalancesSection
            balancesData={balancesData}
            levels={levels}
            academicYears={academicYears}
            balanceFilters={balanceFilters}
            onFilterChange={setBalanceFilters}
            isLoading={balancesLoading}
          />
        </TabsContent>
      </Tabs>

      {renderConfirmDialog()}
    </div>
  )
}
