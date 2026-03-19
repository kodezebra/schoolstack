import { Hono } from 'hono'
import dashboard from './dashboard'
import academicYears from './academic-years'
import levels from './levels'
import students from './students'
import staff from './staff'
import fees from './fees'
import payments from './payments'
import subjects from './subjects'
import exams from './exams'
import results from './results'
import terms from './terms'
import gradeScales from './grade-scales'
import reports from './reports'
import generateNumber from './generate-number'

const app = new Hono()

app.route('/', dashboard)
app.route('/academic-years', academicYears)
app.route('/levels', levels)
app.route('/students', students)
app.route('/staff', staff)
app.route('/fees', fees)
app.route('/payments', payments)
app.route('/subjects', subjects)
app.route('/exams', exams)
app.route('/results', results)
app.route('/terms', terms)
app.route('/grade-scales', gradeScales)
app.route('/reports', reports)
app.route('/generate-number', generateNumber)

export default app
