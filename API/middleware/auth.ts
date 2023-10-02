import { Request, Response, NextFunction } from 'express'
const jwt = require('jsonwebtoken')
import dotenv from 'dotenv'

dotenv.config() // Load environment variables from .env

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {

    try {
        // Extract JWT from the header
        const token = req.headers['authorization']?.split(' ')[1]

        if (!token) {
            throw new Error('Authorization header is missing or malformed')
        }

        // Verify token and save user info
        const authUser = jwt.verify(token, process.env.JWT_SECRET as string);

        // Save user info in req
        (req as any).authUser = authUser

        next();
    } catch (error: any) {
        console.log('JWT error:', error.message)
        res.status(401).send({
            msg: 'Authorization failed',
            error: error.message,
        })
    }
}

export default authMiddleware
