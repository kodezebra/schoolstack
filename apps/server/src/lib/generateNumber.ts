import { sql, eq, like, desc } from 'drizzle-orm';
import type { SQLiteTable } from 'drizzle-orm/sqlite-core';
import { students, staff, feePayments } from '@/db/schema';

export function getPrefixForType(type: 'student' | 'staff' | 'receipt', role?: string): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const basePrefix = `${yy}${mm}`;

  if (type === 'student') return `S${basePrefix}`;
  if (type === 'receipt') return `R${basePrefix}`;
  if (type === 'staff' && role) {
    switch (role) {
      case 'teacher': return `T${basePrefix}`;
      case 'admin': return `A${basePrefix}`;
      case 'counselor': return `C${basePrefix}`;
      case 'principal': return `P${basePrefix}`;
      default: return `T${basePrefix}`;
    }
  }
  return `T${basePrefix}`;
}

export async function generateNumber(
  db: any,
  type: 'student' | 'staff' | 'receipt',
  role?: string
): Promise<string> {
  const prefix = getPrefixForType(type, role);
  const prefixPattern = `${prefix}%`;

  let table: SQLiteTable;
  let column: any;

  if (type === 'student') {
    table = students;
    column = students.admissionNo;
  } else if (type === 'staff') {
    table = staff;
    column = staff.employeeNo;
  } else {
    table = feePayments;
    column = feePayments.receiptNo;
  }

  const result = await db
    .select({ maxVal: sql<string>`MAX(${column})` })
    .from(table)
    .where(sql`${column} LIKE ${prefixPattern}`)
    .get();

  let nextNum = 1;
  if (result?.maxVal) {
    const existingNum = parseInt(result.maxVal.replace(prefix, ''), 10);
    if (!isNaN(existingNum)) {
      nextNum = existingNum + 1;
    }
  }

  return `${prefix}${String(nextNum).padStart(4, '0')}`;
}
