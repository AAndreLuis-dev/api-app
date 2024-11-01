const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

async function authMiddleware(req, res, next) {
    const token = req.headers['authorization'].split(' ')[1];
    if(!token) return res.status(401).json({ message: 'Token não fornecido'});

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(400).json({ message: 'Token Inválido ou erro de autenticação'});
    };
};

module.exports = authMiddleware;
