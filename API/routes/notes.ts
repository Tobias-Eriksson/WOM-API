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
router.get("/board/:board", authMiddleware, async (req: any, res: any) => {
  try {
    //checka om access till board
    const authUser = (req as any).authUser;
    if (!authUser.boards.includes(req.params.board)) {
      return res
        .status(500)
        .send({
          msg: "Error",
          error: "User has no access to board " + req.params.board,
        });
    }

    //Hitta alla notes i board
    const noteData = await prisma.note.findMany({
      where: {
        board: req.params.board,
      },
    });
    if (!noteData) {
      return res.status(500).send({ msg: "Error", error: "No notes found" });
    }

    return res.send({ msg: "Success", notes: noteData });
  } catch (err) {
    return res.status(500).send({ msg: "Error", error: err });
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
    if (!findNote) {
      return res.send({ msg: "ERROR", error: "Note not found" });
    }
    if (!authUser.boards.includes(findNote.board)) {
      return res.send({
        msg: "ERROR",
        error: "User does not have access to board where the note is located",
      });
    }

    //Read note
    const note = await prisma.note.findUnique({
      where: {
        id: req.params.id,
      },
    })
    res.send({ msg: "get", reqBody: note })
  } catch (err) {
    res.send({ msg: "ERROR", error: err })
  }
})


//UPDATE
router.patch("/:id", authMiddleware, async (req: any, res: any) => {
  try {
    ////Checka om access till board vart note är
    const authUser = (req as any).authUser;
    const findNote = await prisma.note.findUnique({
      where: {
        id: req.params.id,
      },
    });
    if (!findNote) {
      return res.send({ msg: "ERROR", error: "Note not found" });
    }
    if (!authUser.boards.includes(findNote.board)) {
      return res.send({
        msg: "ERROR",
        error: "User does not have access to board where the note is located",
      });
    }

    //Patch note
    const note = await prisma.note.update({
      where: {
        id: req.params.id,
      },
      data: {
        board: req.body.board,
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
    if (!authUser.boards.includes(note.board)) {
      return res.send({
        msg: "ERROR",
        error: "User does not have access to board where the note is located",
      });
    }

    //Delete note
    const deleteId = await prisma.note.delete({
      where: {
        id: req.params.id,
      },
    });
    return res.send({
      msg: "delete",
      id: req.params.id,
    });
  } catch (err) {
    return res.send({ msg: "ERROR", error: err });
  }
});

//CREATE
router.post("/", authMiddleware, async (req: any, res: any) => {
  try {
    //Check om access till board
    const authUser = (req as any).authUser;
    if (!authUser.boards.includes(req.body.board)) {
      return res
        .status(500)
        .send({
          msg: "Error",
          error: "User has no access to board " + req.body.board,
        });
    }

    //Create note
    const note = await prisma.note.create({
      data: {
        board: req.body.board,
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

    return res.send({ msg: "post", note: note });
  } catch (err) {
    console.log(err);
    return res.send({ msg: "ERROR", error: err });
  }
});

module.exports = router;
