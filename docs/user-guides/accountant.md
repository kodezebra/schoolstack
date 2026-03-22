# Accountant Guide

**Role:** `admin` | **Version:** 1.0

---

## Welcome

As the Accountant, you manage all financial aspects of the school: fee structures, payment recording, financial reports, and account reconciliation. This guide helps you handle these tasks efficiently and maintain accurate financial records.

---

## Getting Started Checklist

- [ ] Review existing fee structures
- [ ] Check pending payments
- [ ] Understand payment methods
- [ ] Familiarize with reports
- [ ] Set up your payment workflow

---

## Your Financial Dashboard

Access fee management via **School** → **Fees**.

| Section | What You'll Find |
|---------|------------------|
| **Overview Cards** | Total expected, collected, outstanding |
| **Recent Payments** | Latest 10 transactions |
| **Quick Actions** | Record payment, view reports |

---

## Fee Structures

Fee structures define what students owe. Think of them as templates for different fee types.

### Viewing Fee Structures

1. Go to **School** → **Fees**
2. Click **Fee Structures** tab
3. See all fees in table format:
   - Name
   - Amount
   - Level
   - Term
   - Status

### Creating a Fee Structure

**Step 1: Add New Fee**

1. Click **Add Fee Structure**

**Step 2: Configure Fee**

| Field | Required | Description |
|-------|----------|-------------|
| Name | Yes | Descriptive name (e.g., "Term 1 Tuition") |
| Amount | Yes | Total amount in currency |
| Category | Yes | Type of fee |
| Level | Yes | Which class this applies to |
| Term | Yes | Academic term |
| Due Date | No | When fee should be paid |

**Step 3: Categories Explained**

| Category | Use For |
|----------|---------|
| **Tuition** | School fees |
| **Registration** | Enrollment fees |
| **Uniform** | Clothing items |
| **Books** | textbooks and materials |
| **Transport** | Bus service |
| **Boarding** | Dormitory fees |
| **Exam** | Examination fees |
| **Activity** | Sports, trips, events |
| **Other** | Miscellaneous fees |

**Step 4: Save**

Click **Save Fee Structure**.

### Editing a Fee Structure

1. Find fee in list
2. Click **Edit**
3. Make changes
4. Save

> ⚠️ **Note:** Changes don't affect already-generated student fees.

### Deactivating a Fee

Instead of deleting:

1. Edit fee structure
2. Toggle **Active** off
3. Save
4. Fee hidden from new enrollments

---

## Recording Payments

### Finding a Student

**Method 1: Search**

1. On Fees page, use search bar
2. Enter student name or admission number
3. Select from results

**Method 2: Browse by Class**

1. Filter by level
2. Browse student list
3. Click student to open account

### Recording a Payment

**Step 1: Open Student Account**

1. Search or browse to student
2. Click on their name
3. View fee summary

**Step 2: Record Payment**

1. Click **Record Payment**
2. Select fee(s) being paid
3. Enter payment details:

| Field | Description |
|-------|-------------|
| Amount | Payment amount |
| Payment Method | Cash, Bank Transfer, Mobile Money, Cheque |
| Reference | Transaction/cheque number |
| Date | Payment date (defaults to today) |
| Notes | Any additional info |

**Step 3: Confirm**

1. Review payment details
2. Click **Confirm Payment**
3. Receipt auto-generated

### Partial Payments

Students can pay in installments:

1. Record partial amount
2. Balance remains on account
3. Record next payment later
4. System tracks payment history

### Full vs. Overpayment

| Scenario | Action |
|----------|--------|
| Partial | Record amount paid |
| Exact | Record exact amount |
| Over | Record full amount, excess becomes credit |

### Payment Receipts

After each payment:

1. Receipt auto-generated
2. Options:
   - **Print**: Physical copy
   - **Email**: Send to parent
   - **Download**: Save as PDF

---

## Student Fee Management

### Viewing Individual Student

1. Click student name
2. See:
   - Total fees for year
   - Payments made
   - Outstanding balance
   - Payment history

### Fee Statement

Generate statement showing:

- All fee charges
- All payments
- Running balance
- Date range

### Applying Discounts

**Method 1: Override Amount**

1. Open student account
2. Click **Override**
3. Set new fee amount
4. Add reason/notes

**Method 2: Percentage Discount**

1. Click **Add Discount**
2. Select type: Percentage or Fixed
3. Enter value (e.g., 10% or 50,000)
4. Add reason
5. Save

### Adding Extra Charges

For one-time fees:

1. Open student account
2. Click **Add Extra Charge**
3. Enter:
   - Description
   - Amount
   - Due date
4. Save

### Waiving Fees

For exceptional cases:

1. Open student account
2. Click **Waive Fee**
3. Select fee(s) to waive
4. Add reason
5. Confirm

---

## Financial Reports

### Collection Summary

**Step 1: Access Reports**

1. Click **View Reports**

**Step 2: Select Parameters**

- **Term**: Specific term or full year
- **Level**: Specific class or all
- **Status**: Paid/Unpaid/All

**Step 3: Generate**

View report showing:

| Metric | Description |
|--------|-------------|
| Total Expected | Sum of all fees |
| Total Collected | Sum of all payments |
| Outstanding | Expected minus collected |
| Collection Rate | Percentage collected |

### Payment History Report

Detailed transaction log:

- Date
- Student
- Amount
- Payment method
- Reference
- Recorded by

**Export Options:**

- View on screen
- Download CSV
- Print report

### Outstanding Fees Report

Students with unpaid balances:

- Student name
- Class/Level
- Total owed
- Days overdue

### Revenue by Category

Breakdown by fee type:

| Category | Amount | Percentage |
|----------|--------|------------|
| Tuition | 15,000,000 | 75% |
| Uniform | 2,000,000 | 10% |
| Transport | 3,000,000 | 15% |

---

## Reconciliation

### Daily Reconciliation

**Morning:**

1. Check yesterday's payments
2. Verify amounts in system
3. Compare to cash/bank records

**End of Day:**

1. Total all cash payments
2. Total all bank transfers
3. Verify against recorded

### Bank Reconciliation

**Step 1: Get Bank Statement**

1. Download or request statement
2. Note statement period

**Step 2: Compare Records**

Match each bank transaction to system payment:

| Bank Record | System Record | Status |
|-------------|--------------|--------|
| Matched | ✓ | Reconciled |
| Missing | ✗ | Investigate |
| Extra | ✗ | Unidentified |

**Step 3: Resolve Discrepancies**

- Missing: Check for system error, add if valid
- Extra: Investigate source
- Adjust as needed

---

## Exporting Data

### Export Payment Records

1. Go to **Payment History**
2. Set filters (date range, level, etc.)
3. Click **Export**
4. Choose format:
   - CSV (spreadsheet)
   - PDF (printable report)

### Export Student Balances

1. Go to **Outstanding Report**
2. Filter as needed
3. Export
4. Use for follow-up

### Data for Accounting Software

Export in standard formats:

- CSV for Excel/Sheets
- PDF for records

---

## Best Practices

### Daily Workflow

| Time | Task |
|------|------|
| Morning | Review pending fees |
| Throughout | Record payments promptly |
| Evening | Reconcile daily totals |

### Record Keeping

- Keep all payment receipts
- File by date/month
- Maintain digital backups
- Store bank statements

### Security

- Limit access to financial data
- Don't share login
- Review user permissions regularly
- Log out when done

### Common Issues

| Issue | Solution |
|-------|----------|
| Duplicate payment | Reverse extra, refund if needed |
| Wrong amount recorded | Edit immediately if same day |
| Missing payment | Check with parent, add if valid |
| Student overpaid | Create credit, apply to next term |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl` + `P` | Record payment |
| `Ctrl` + `F` | Find student |
| `Ctrl` + `R` | View reports |
| `?` | Open Help |

---

## Troubleshooting

### Payment not recording

- Check internet connection
- Verify amount is positive
- Ensure student is selected

### Report showing wrong totals

- Clear date filters
- Check academic year selected
- Verify fee structure is active

### Student balance incorrect

- Check for waivers/discounts applied
- Review payment history
- Check for edited fee amounts

---

## Getting Help

Click the **?** button for:
- Step-by-step guides
- Report explanations
- Contact support

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | March 2026 | Initial release |

---
