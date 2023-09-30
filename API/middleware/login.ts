import express, { Express } from 'express'
import { PrismaClient } from '@prisma/client'
import { Hash } from 'crypto'
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient()
const router: Express = express()

//Login
router.post("/", async (req: any, res: any) => {
    try {
        const user = await prisma.user.findUnique({
            where: { user: req.body.user }
        })

        if (user == null) {
            return res.status(404).send({ msg: 'ERROR', error: 'User not found' })
        }

        const hashMatch = await bcrypt.compare(req.body.password, user.password)

        if (!hashMatch) {
            return res.status(401).send({ msg: 'ERROR', error: 'Wrong password' })
        }

        const token = await jwt.sign({
            sub: user.id,
            name: user.name,
            expiresIn: '1d'
        }, process.env.JWT_SECRET)

        res.send({ token: token, msg: "Login successful", userId: user.id })


    } catch (err) {
        res.send({ msg: "ERROR", error: err });
    }
})
