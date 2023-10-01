import express, { Express } from 'express'
import { PrismaClient } from '@prisma/client'
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()
const router: Express = express()


//TODO INTERFACES
interface createUserRequestBody {
    user: string,
    password: string,
    name: string,
    boards?: string[];

}
interface loginRequestBody {
    user: string,
    password: string
}


//Login
router.post("/login", async (req: any, res: any) => {
    try {
        const requestBody: loginRequestBody = req.body;
        if (!requestBody) {
            res.send({ msg: "Error", error: "Request body faulty" })
        }

        const user = await prisma.user.findUnique({
            where: { user: requestBody.user }
        })

        if (user == null) {
            return res.status(404).send({ msg: 'ERROR', error: 'User not found' })
        }

        const hashMatch = await bcrypt.compare(requestBody.password, user.password)

        if (!hashMatch) {
            return res.status(401).send({ msg: 'ERROR', error: 'Wrong password' })
        }

        const token = await jwt.sign({
            sub: user.id,
            name: user.name,
            expiresIn: '1d',
            boards: user.boards
        }, process.env.JWT_SECRET)

        res.send({ token: token, msg: "Login successful", userId: user.id })

    } catch (err) {
        res.send({ msg: "ERROR", error: err })
    }
})

//Create user
router.post("/createUser", async (req: any, res: any) => {
    try {
        const requestBody: createUserRequestBody = req.body;
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(requestBody.password, salt)
        const createUser = await prisma.user.create({
            data: {
                name: requestBody.name,
                password: hashedPassword,
                user: requestBody.user,
                boards: requestBody.boards
            },
        })
        res.send({ msg: "success", newUser: requestBody.user })

    } catch (err) {
        console.error("Error creating user:", err);
        res.status(500).send({ error: "An error occurred while creating the user", msg: err });

    }
})


module.exports = router