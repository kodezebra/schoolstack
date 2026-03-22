export const VALIDATION = {
  phone: {
    pattern: /^(\+?256|0)?[0-9]{9}$/,
    message: 'Enter a valid phone number (e.g., 0771234567 or +256771234567)'
  },
  email: {
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message: 'Enter a valid email address'
  },
  names: {
    minLength: 2,
    maxLength: 100,
    message: 'Name must be between 2 and 100 characters'
  },
  amount: {
    min: 0,
    max: 999999999,
    message: 'Enter a valid amount'
  },
  password: {
    minLength: 8,
    maxLength: 128,
    message: 'Password must be at least 8 characters'
  }
}

export function validatePhone(value: string): string | null {
  if (!value?.trim()) return null
  const cleaned = value.replace(/\s/g, '')
  if (!VALIDATION.phone.pattern.test(cleaned)) {
    return VALIDATION.phone.message
  }
  return null
}

export function validateEmail(value: string): string | null {
  if (!value?.trim()) return null
  if (!VALIDATION.email.pattern.test(value)) {
    return VALIDATION.email.message
  }
  return null
}

export function validateRequired(value: string | null | undefined, fieldName: string): string | null {
  if (!value?.trim()) {
    return `${fieldName} is required`
  }
  return null
}

export function validateAmount(value: number | string | null | undefined): string | null {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (num === null || num === undefined || isNaN(num)) {
    return 'Amount is required'
  }
  if (num < VALIDATION.amount.min) {
    return 'Amount cannot be negative'
  }
  if (num > VALIDATION.amount.max) {
    return 'Amount is too large'
  }
  if (num === 0) {
    return 'Amount must be greater than zero'
  }
  return null
}

export function validatePassword(value: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (value.length < VALIDATION.password.minLength) {
    errors.push('At least 8 characters')
  }
  if (value.length > VALIDATION.password.maxLength) {
    errors.push('Maximum 128 characters')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

export function validateDateRange(startDate: string, endDate: string): string | null {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  if (isNaN(start.getTime())) return 'Invalid start date'
  if (isNaN(end.getTime())) return 'Invalid end date'
  
  if (end < start) {
    return 'End date must be after start date'
  }
  
  return null
}

export function formatPhoneForDisplay(value: string): string {
  const cleaned = value.replace(/\s/g, '').replace(/^0/, '')
  if (cleaned.startsWith('256')) {
    return `0${cleaned.slice(3)}`
  }
  return value
}

export function sanitizeInput(value: string): string {
  return value.trim().replace(/[<>]/g, '')
}
