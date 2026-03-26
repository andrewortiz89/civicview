import { Router } from 'express'
import { getWeather, clearWeatherCache } from '../controllers/weatherController.js'
import { apiLimiter, cacheLimiter } from '../middleware/rateLimiter.js'

const router = Router()
router.get('/', apiLimiter, getWeather)
router.delete('/cache', cacheLimiter, clearWeatherCache)

export default router
