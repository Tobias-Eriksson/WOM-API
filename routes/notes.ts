import express, { Express, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router: Express = express();

console.log("Notes");

//READALL
router.get("/", async (req: any, res: any) => {
  try {
    const note = await prisma.notes.findMany();
    res.status(200).json({ msg: "get", reqBody: note });
  } catch (err) {
    res.status(400).json({ msg: "ERROR", error: err });
  }
});

//READ
router.get("/:id", async (req: any, res: any) => {
  try {
    const note = await prisma.notes.findUnique({
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
    const note = await prisma.notes.update({
      where: {
        id: req.params.id,
      },
      data: {
        noteText: req.body.text,
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
    const deleteId = await prisma.notes.delete({
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
    const note = await prisma.notes.create({
      data: {
        noteText: req.body.text,
      },
    });
    res.send({ msg: "post", reqBody: req.body });
  } catch (err) {
    res.send({ msg: "ERROR", error: err });
    console.log(err)
  }
});

module.exports = router;
