import { logger } from '@utils/logger.utils'
import app from './app'

app.listen(8080, () => {
  logger.info("Server running  at 8080!")
})
