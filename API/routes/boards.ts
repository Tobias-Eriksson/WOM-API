import express, { Express } from 'express'
import { PrismaClient } from '@prisma/client'
import authMiddleware from '../middleware/auth'
import { empty } from '@prisma/client/runtime/library'

const prisma = new PrismaClient()
const router: Express = express()



//Get all boards for user
router.get("/", authMiddleware, async (req: any, res: any) => {
    try {
        const authUser = (req as any).authUser;


        //Checka om owner av boarden
        const boardsData = await prisma.board.findMany({
            where: {
                boardOwnerId: authUser.sub
            },
        });

        //Checka om authUser är med i boardens boardUsers. Prisma includes fungerar inte så most för hand check
        const userBoardsData = await prisma.board.findMany();
        for (let i = 0; i < userBoardsData.length; i++) {
            if (userBoardsData[i].boardUsers.includes(authUser.user)) {
                boardsData.push(userBoardsData[i])
            }
        }

        if (boardsData.length == 0) {
            return res.status(500).send({ msg: "Error", error: "No boards found for user " + authUser.name })
        }

        return res.status(200).send({ msg: "Success", boards: boardsData })
    } catch (err) {
        res.status(500).send({ msg: "Error", error: err })
        console.log(err)
    }
})

//Create board
router.post('/:name', authMiddleware, async (req: any, res: any) => {
    try {
        const authUser = (req as any).authUser;

        // Create the board
        const board = await prisma.board.create({
            data: {
                name: req.params.name,
                boardOwnerId: authUser.sub,
            },
        });

        res.status(201).json(board);
    } catch (error) {
        console.error('Error creating board:', error);
        res.status(500).json({ error: 'Could not create board' });
    }
});

//update board
router.patch('/:id', authMiddleware, async (req, res) => {
    try {
        const authUser = (req as any).authUser;


        // Find the board by ID
        const existingBoard = await prisma.board.findUnique({
            where: {
                id: req.params.id,
            },
        });

        // Check if the board exists and the authenticated user is the owner
        if (!existingBoard || existingBoard.boardOwnerId !== authUser.sub) {
            return res.status(404).json({ error: 'Board not found or unauthorized' });
        }

        //Gör tom array ifall den inte är lagad me i request bodyn så att "Array.from" inte far sönder(används senare i prisma.board.update)
        if (!req.body.notes) req.body.notes = []

        const boardUsers = req.body.boardUsers

        //Chech ifall de kommer ingen req.body.boardUsers
        if (!req.body.boardUsers) {
            req.body.boardUsers = []


            ////Säkert en dålig practice att köra db queries i en loop sådär istället för en db query som hittar rätt sak
            ////MEN 'contains' fungerar inte i prisma.findmany för nån orsak. Kan inte query "(if db.users contains boardUser)"

            //Ifall boardUsers finns i bodyn, checka om de user(s) finns i databasen
            //Check ifall req.body.boardUsers kommer som en array fron request bodyn. Exempel: "boardUsers": ["Erik", "Tobias", "Erik4"]
        } else if (Array.isArray(req.body.boardUsers)) {

            //Checka att alla users från req.body.boardUsers finns påriktigt i databasen som users
            for (let i = 0; i < boardUsers.length; i++) {
                const user = await prisma.user.findUnique({
                    where: {
                        user: boardUsers[i],
                    },
                });
                if (!user) return res.status(404).json({ error: "User " + boardUsers[i] + " not found" });
            }

            //Ifall req.body.userBoards är 1 person inte i en array exmepel: "boardUsers": "Erik"
        } else {
            const user = await prisma.user.findUnique({
                where: {
                    user: boardUsers,
                },
            });
            if (!user) return res.status(404).json({ error: 'User ' + boardUsers + " not found" });
        }



        // Update the board
        const updatedBoard = await prisma.board.update({
            where: {
                id: req.params.id
            },
            data: {
                name: req.body.name,
                boardUsers: Array.from(new Set(existingBoard.boardUsers.concat(req.body.boardUsers))),
                notes: Array.from(new Set(existingBoard.notes.concat(req.body.notes))),
            },
        });

        res.status(201).json(updatedBoard);
    } catch (error) {
        console.error('Error updating board:', error);
        res.status(500).json({ error: 'Could not read board Server Error' });
    }
});


//delete boards
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const authUser = (req as any).authUser;


        // Find the board by ID
        const existingBoard = await prisma.board.findUnique({
            where: {
                id: req.params.id,
            },
        });

        // Check if the board exists and if the authenticated user is the owner
        if (!existingBoard || existingBoard.boardOwnerId !== authUser.sub) {
            return res.status(404).json({ error: 'Board not found or unauthorized' });
        }

        // Delete the board
        await prisma.board.delete({
            where: {
                id: req.params.id,
            },
        });

        res.status(200).json({ message: 'Board deleted successfully' });
    } catch (error) {
        console.error('Error deleting board:', error);
        res.status(500).json({ error: 'Could not delete board' });
    }
});
module.exports = router;
