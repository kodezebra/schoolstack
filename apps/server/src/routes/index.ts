import { Hono } from 'hono'
import authApp from './auth'
import usersApp from './users'
import assetsApp from './assets'
import settingsApp from './settings'
import templatesApp from './templates'
import pagesApp from './pages'
import contactApp from './contact'
import schoolApp from './school'
import videoApp from './video'

type Bindings = {
  DB: D1Database
  FRONTEND_URL: string
  ASSETS: R2Bucket
}

const api = new Hono<{ Bindings: Bindings }>()

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

// School Management
api.route('/school', schoolApp)

// Video Utilities (thumbnails via oEmbed)
api.route('/video', videoApp)

export default api
