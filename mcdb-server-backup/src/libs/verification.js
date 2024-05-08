import jwt from "jsonwebtoken"
import { propertiesAsync } from "./readProperties";

//Authorization: Bearer <token>
export const verifyToken = async (req, res) => {
    const bearerHeader = req.headers['authorization']
    if(typeof bearerHeader === 'undefined') return res.sendStatus(403);
    const token = bearerHeader.split(' ')[1];
    req.token = token;

    const properties = await propertiesAsync();

    jwt.verify(req.token, properties['secutity.key'], (error, authData) => {
        if(error) {
            return res.status(300).send({ 'message': 'Session successfully closed' })
        } else {
            return res.json({ 'status': 200 });
        }
    })
}