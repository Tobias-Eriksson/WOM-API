import express, { Express } from 'express'
import { PrismaClient } from '@prisma/client'
import authMiddleware from '../middleware/auth'

const prisma = new PrismaClient()
const router: Express = express()



//Get all boards for user
router.get("/", authMiddleware, async (req: any, res: any) => {
    try {
        const authUser = (req as any).authUser;
        const boardsData = await prisma.board.findMany();

        //Jank solution as I could not fetch with Prisma where boardUsers contains authUser.id...
        const filteredBoards = boardsData.filter(board => {
            return board.boardOwnerId === authUser.sub ||
                (board.boardUsers && board.boardUsers.includes(authUser.user));
        });
        if (!filteredBoards) {
            return res.status(500).send({ msg: "Error", error: "Boards not found" })
        }

        return res.send({ msg: "Success", boards: boardsData })
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
                boardOwnerId: authUser.sub, // Associate the owner's ID with the board
            },
        });

        res.status(201).json(board);
    } catch (error) {
        console.error('Error creating board:', error);
        res.status(500).json({ error: 'Could not create board' });
    }
});

//update board
router.put('/:id', authMiddleware, async (req, res) => {
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

        res.status(200).json(updatedBoard);
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
