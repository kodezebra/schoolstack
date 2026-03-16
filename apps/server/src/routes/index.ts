import { Hono } from 'hono'
import authApp from './auth'
import usersApp from './users'
import assetsApp from './assets'
import settingsApp from './settings'
import templatesApp from './templates'
import pagesApp from './pages'
import contactApp from './contact'

const api = new Hono()

// Auth Routes
api.route('/auth', authApp)

// Users Routes
api.route('/users', usersApp)

// Assets Routes
api.route('/assets', assetsApp)

// Settings Routes
api.route('/settings', settingsApp)

// Templates Routes
api.route('/templates', templatesApp)

// CMS Admin Routes
api.route('/pages', pagesApp)

// Contact Submissions
api.route('/contact', contactApp)

export default api
