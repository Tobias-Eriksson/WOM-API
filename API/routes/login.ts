import express, { Express } from "express";
import { PrismaClient } from "@prisma/client";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
import authMiddleware from "../middleware/auth";
import { json } from "node:stream/consumers";

const prisma = new PrismaClient();
const router: Express = express();

interface createUserRequestBody {
    user: string;
    password: string;
    name: string;
    boards?: string[];
}
interface loginRequestBody {
    user: string;
    password: string;
}

//Login
router.post("/login", async (req: any, res: any) => {
    console.log("login");
    try {
        const requestBody: loginRequestBody = req.body;
        if (!requestBody) {
            return res.send({ msg: "Error", error: "Request body faulty" });
        }

        const user = await prisma.user.findUnique({
            where: { user: requestBody.user },
        });

        if (user == null) {
            return res
                .status(404)
                .send({ msg: "ERROR", error: "User not found" });
        }

        const hashMatch = await bcrypt.compare(
            requestBody.password,
            user.password
        );

        if (!hashMatch) {
            return res
                .status(401)
                .send({ msg: "ERROR", error: "Wrong password" });
        }

        const token = await jwt.sign(
            {
                sub: user.id,
                name: user.name,
                expiresIn: "1d",
                boards: user.boards,
            },
            process.env.JWT_SECRET
        );

        return res.send({
            token: token,
            msg: "Login successful",
            userId: user.id,
        });
    } catch (err) {
        console.log(err);
        return res.send({ msg: "ERROR", error: err });
    }
});

//Create user
router.post("/createUser", async (req: any, res: any) => {
    try {
        const requestBody: createUserRequestBody = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(requestBody.password, salt);
        const createUser = await prisma.user.create({
            data: {
                name: requestBody.name,
                password: hashedPassword,
                user: requestBody.user,
                boards: requestBody.boards,
            },
        });
        return res.send({ msg: "success", newUser: requestBody.user });
    } catch (err: any) {
        if (err.msg && err.msg.code === "P2002") {
            return res.send({ msg: "ERROR", error: "User already exists" })
        }
        return res
            .status(500)
            .send({
                error: "An error occurred while creating the user",
                msg: err,
            });
    }
});

//Patch user
router.patch("/", authMiddleware, async (req: any, res: any) => {
    const authUser = (req as any).authUser;
    try {
        const user = await prisma.user.update({
            where: {
                id: authUser.sub,
            },
            data: {
                password: req.body.password,
                name: req.body.name,
                boards: authUser.boards.concat(req.body.boards),
            },
        });
        return res.send({ msg: "patch", reqBody: req.body });
    } catch (err) {
        return res.send({ msg: "ERROR", error: err });
    }
});

module.exports = router;
