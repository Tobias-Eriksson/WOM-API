import express, { Express, Request, Response, Router } from 'express'
import dotenv from 'dotenv'
var cors = require('cors')
const notes = require('./routes/notes')
const login = require('./routes/login')
const boards = require('./routes/boards')
import authMiddleware from './middleware/auth'

dotenv.config()



const app: Express = express()
app.use(express.json())
app.use(cors())
const port = process.env.PORT


app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server')
})

app.use('/notes', notes)
app.use('/login', login)
app.use('/boards', boards)

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`)
})

