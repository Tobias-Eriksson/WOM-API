import express, { Express } from 'express';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router: Express = express();

console.log("note");

//READALL
router.get("/", async (req: any, res: any) => {
  try {
    const note = await prisma.note.findMany();
    res.status(200).json({ msg: "get", reqBody: note });
  } catch (err) {
    res.status(400).json({ msg: "ERROR", error: err });
  }
});

//READ
router.get("/:id", async (req: any, res: any) => {
  try {
    const note = await prisma.note.findUnique({
      where: {
        id: req.params.id,
      },
    });
    res.send({ msg: "get", reqBody: note });
  } catch (err) {
    res.send({ msg: "ERROR", error: err });
  }
});

//UPDATE
router.patch("/:id", async (req: any, res: any) => {
  try {
    const note = await prisma.note.update({
      where: {
        id: req.params.id,
      },
      data: {
        content: req.body.text,
      },
    });
    res.send({ msg: "patch", reqBody: req.body });
  } catch (err) {
    res.send({ msg: "ERROR", error: err });
    console.log(err)
  }
});

//DELETE
router.delete("/:id", async (req: any, res: any) => {
  try {
    const deleteId = await prisma.note.delete({
      where: {
        id: req.params.id,
      },
    });
    res.send({
      msg: "delete",
      id: req.params.id,
    });
  } catch (err) {
    res.send({ msg: "ERROR", error: err });
  }
});

//CREATE
router.post("/", async (req: any, res: any) => {
  try {
    const note = await prisma.note.create({
      data: {
        content: req.body.text,
      },
    });
    res.send({ msg: "post", reqBody: req.body });
  } catch (err) {
    res.send({ msg: "ERROR", error: err });
    console.log(err)
  }
});

module.exports = router;
