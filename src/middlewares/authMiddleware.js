import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

async function authMiddleware(req, res, next) {
    const token = req.headers['authorization'];
    if(!token) return res.status(401).json({ message: 'Token não fornecido'});

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(400).json({ message: 'Token Inválido ou erro de autenticação'});
    };
};
export default authMiddleware;
