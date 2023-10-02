import express, { Express } from 'express'
import { PrismaClient } from '@prisma/client'
import authMiddleware from '../middleware/auth'

const prisma = new PrismaClient()
const router: Express = express()



//Get all boards for user
router.get("/", authMiddleware, async (req: any, res: any) => {
    try {
        const authUser = (req as any).authUser;
        const userData = await prisma.user.findUnique({
            where: {
                id: authUser.sub
            }
        })
        if (!userData) {
            return res.status(500).send({ msg: "Error", error: "Boards not found" })
        }

        return res.send({ msg: "Success", boards: userData.boards })
    } catch (err) {
        res.status(500).send({ msg: "Error", error: err })
        console.log(err)
    }
})

//Create board
//Create board kan göras med att använda update i users och laga nya boards till en user


module.exports = router