import express, { Express } from "express";
import { PrismaClient } from "@prisma/client";
import authMiddleware from "../middleware/auth";

const prisma = new PrismaClient();
const router: Express = express();

//READALL DISABLED. USE GET ALL NOTES FROM BOARD
/*
router.get("/", authMiddleware, async (req: any, res: any) => {
  try {
    const note = await prisma.note.findMany()
    res.status(200).json({ msg: "get", reqBody: note })
  } catch (err) {
    res.status(400).json({ msg: "ERROR", error: err })
  }
})
*/

//GET ALL NOTES FROM BOARD
router.get("/board/:boardId", authMiddleware, async (req: any, res: any) => {
  try {
    //checka om access till board
    const authUser = (req as any).authUser;
    const board = await prisma.board.findUnique({
      where: {
        id: req.params.boardId,
      },
    });

    //Check om board finns
    if (!board) return res.status(500).send({ msg: "Error", error: "Board not found" })

    //check om owner eller authuser
    if (!board.boardUsers.includes(authUser.user) && !board.boardOwnerId == authUser.sub) {
      return res.status(500).json({ error: 'User not authorized to board' });
    }
    //Hitta alla notes i board
    const noteData = await prisma.note.findMany({
      where: {
        boardId: req.params.boardId,
      },
    });
    if (!noteData) {
      return res.status(500).send({ msg: "Error", error: "No notes found" });
    }

    return res.send({ msg: "Success", notes: noteData });

  } catch (err) {
    console.error('Error fetching notes:', err);
    res.status(500).json({ error: 'Could not get notes' });
  }
});

//READ
router.get("/:id", authMiddleware, async (req: any, res: any) => {
  try {
    //Checka om access till board vart note är
    const authUser = (req as any).authUser;
    const findNote = await prisma.note.findUnique({
      where: {
        id: req.params.id,
      },
    });
    console.log(findNote)
    if (!findNote) {
      return res.send({ msg: "ERROR", error: "Note not found" });
    }
    //CHECK AUTH
    //Get board föratt check auth
    const board = await prisma.board.findUnique({
      where: {
        id: findNote.boardId,
      },
    });
    //Check om board finns
    if (!board) return res.status(500).send({ msg: "Error", error: "Board where note is not found" })
    //check om authoriserad
    if (board.boardOwnerId !== authUser.sub || (board.boardUsers && board.boardUsers.includes(authUser.user))) {
      return res.status(500).send({ msg: "Error", error: "Not authorized to board" })
    }

    //Read note
    const note = await prisma.note.findUnique({
      where: {
        id: req.params.id,
      },
    })
    res.send({ msg: "get", note })
  } catch (err) {
    console.error('Error fetching note:', err);
    res.status(500).json({ error: 'Could not fetch note' });
  }
})


//UPDATE
router.patch("/:id", authMiddleware, async (req: any, res: any) => {
  try {
    const authUser = (req as any).authUser;
    const findNote = await prisma.note.findUnique({
      where: {
        id: req.params.id,
      },
    });
    if (!findNote) {
      return res.send({ msg: "ERROR", error: "Note not found" });
    }

    //CHECK AUTH
    //Get board föratt check auth
    const board = await prisma.board.findUnique({
      where: {
        id: findNote.boardId,
      },
    });
    //Check om board finns
    if (!board) return res.status(500).send({ msg: "Error", error: "Board where note is not found" })
    //check om authoriserad
    if (board.boardOwnerId !== authUser.sub || (board.boardUsers && board.boardUsers.includes(authUser.user))) {
      return res.status(500).send({ msg: "Error", error: "Not authorized to board" })
    }

    //Patch note
    const note = await prisma.note.update({
      where: {
        id: req.params.id,
      },
      data: {
        boardId: req.body.board,
        heading: req.body.heading,
        content: req.body.content,
        color: req.body.color,
        position: req.body.position,
      },
    });
    return res.send({ msg: "patch", reqBody: req.body });
  } catch (err) {
    return res.send({ msg: "ERROR", error: err });
  }
});

//DELETE
router.delete("/:id", authMiddleware, async (req: any, res: any) => {
  try {
    //Checka om access till note
    const authUser = (req as any).authUser;
    const note = await prisma.note.findUnique({
      where: {
        id: req.params.id,
      },
    });
    if (!note) {
      return res.send({ msg: "ERROR", error: "Note not found" });
    }
    //CHECK AUTH
    //Get board föratt check auth
    const board = await prisma.board.findUnique({
      where: {
        id: note.boardId,
      },
    });
    //Check om board finns
    if (!board) return res.status(500).send({ msg: "Error", error: "Board where note is not found" })
    //check om authoriserad
    if (board.boardOwnerId !== authUser.sub || (board.boardUsers && board.boardUsers.includes(authUser.user))) {
      return res.status(500).send({ msg: "Error", error: "Not authorized to board" })
    }

    //Delete note
    const deleteId = await prisma.note.delete({
      where: {
        id: req.params.id,
      },
    });
    return res.send({
      msg: "delete",
      note
    });
  } catch (err) {
    return res.send({ msg: "ERROR", error: err });
  }
});

//CREATE
router.post("/:boardId", authMiddleware, async (req: any, res: any) => {
  try {
    //Check om access till board
    const authUser = (req as any).authUser;

    //CHECK AUTH
    //Get board föratt check auth
    const board = await prisma.board.findUnique({
      where: {
        id: req.params.boardId,
      },
    });
    //Check om board finns
    if (!board) return res.status(500).send({ msg: "Error", error: "Board where note is not found" })
    //check om authoriserad
    if (board.boardOwnerId !== authUser.sub || (board.boardUsers && board.boardUsers.includes(authUser.user))) {
      return res.status(500).send({ msg: "Error", error: "Not authorized to board" })
    }


    //Create note
    const note = await prisma.note.create({
      data: {
        boardId: board.id,
        heading: req.body.heading,
        content: req.body.content,
        color: req.body.color,
        creator: authUser.name,
        timestamp: new Date(Date.now()),
        position: req.body.position,
      },
    });

    if (!note) {
      return res.send({ msg: "ERROR", error: "failed to create note" });
    }

    //Update board to include note
    const updatedBoard = await prisma.board.update({
      where: {
        id: board.id
      },
      data: {
        notes: Array.from(new Set(board.notes.concat(note.id))),
      },
    });

    return res.send({ msg: "post", note: note });
  } catch (err) {
    console.log(err);
    return res.send({ msg: "ERROR", error: err });
  }
});

module.exports = router;
