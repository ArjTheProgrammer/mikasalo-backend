import logger from './logger'
import { Response, Request, NextFunction } from 'express'
// import jwt from 'jsonwebtoken'

const requestLogger = (request: Request , _response: Response, next: NextFunction): void => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (_request: Request, response: Response): Response => {
  return response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (
  error: Error,
  _request: Request,
  response: Response,
  next: NextFunction
): Response | void => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(400).json({ error: 'token missing or invalid' })
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({ error: 'token expired' })
  }

  return next(error)
}

const tokenExtractor = (
  request: Request & { token?: string },
  _response: Response,
  next: NextFunction
): void => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    request.token = authorization.replace('Bearer ', '')
  }
  next()
}

// const userExtractor = async (request, response, next) => {
//   if (request.token) {
//     const decodedToken = jwt.verify(request.token, process.env.SECRET)
//     if (decodedToken.id) {
//       request.user = await User.findById(decodedToken.id)
//     }
//   }
//   next()
// }

export default {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
//   userExtractor
}