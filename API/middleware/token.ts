const jwt = require('jsonwebtoken');

import { JsonObject } from "@prisma/client/runtime/library";

require('dotenv').config()

function generateToken(user: JsonObject) {
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '1h' // Token expiration time
    });
    return token;
}

