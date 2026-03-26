import { Router } from 'express'
import { getAirQuality, clearAirQualityCache } from '../controllers/airQualityController.js'
import { apiLimiter, cacheLimiter } from '../middleware/rateLimiter.js'

const router = Router()
router.get('/', apiLimiter, getAirQuality)
router.delete('/cache', cacheLimiter, clearAirQualityCache)

export default router
