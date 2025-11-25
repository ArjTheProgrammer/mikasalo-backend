import { server } from './app';
import config from './utils/config';
import logger from './utils/logger';
 
server.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
  logger.info('WebSocket server initialized')
})