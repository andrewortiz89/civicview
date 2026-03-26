import { Router } from 'express'
import { getEvents, clearEventsCache } from '../controllers/eventsController.js'
import { apiLimiter, cacheLimiter } from '../middleware/rateLimiter.js'

const router = Router()
router.get('/', apiLimiter, getEvents)
router.delete('/cache', cacheLimiter, clearEventsCache)

export default router
