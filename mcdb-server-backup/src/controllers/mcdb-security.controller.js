import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { propertiesAsync } from '../libs/readProperties';

export const getSecurityConfig = async (req, res) => {
    try {
        const config = await propertiesAsync();

        if (!config) return res.status(404).send({ 'message': "Not Found" });

        if (!config['secutity.password'] || !config['secutity.password']) return res.status(404).send({ 'message': "Not Found" });
        const password = await bcrypt.hash(config['secutity.password'], 10);

        const user = {
            user: config['secutity.user'],
            password: password
        }

        return res.json(user);
    } catch (error) {
        return res.status(500).send({ 'message': error.message });
    }
}

export const login = async (req, res) => {
    const { userSelect, userQuery } = req.body;
    if (!userSelect || !userQuery) return res.status(400).send({ 'message': "Bad Request" });

    const properties = await propertiesAsync();

    try {
        bcrypt.compare(userQuery.password, userSelect.password).then((result) => {
            if (result) {
                jwt.sign({
                    user: userSelect.user
                }, process.env.KEY || properties['secutity.key'], { expiresIn: '30m' }, (err, token) => {
                    return res.json({ token })
                })
            } else {
                return res.status(401).json({ 'message': 'Incorrect data' })
            }
        })
    } catch (error) {
        return res.status(500).send({ 'message': error.message });
    }
}