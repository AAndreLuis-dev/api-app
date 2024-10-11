import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import userRoutes from './routes/userRoutes.js';
import dicasRoutes from './routes/dicaRoutes.js';
/* import ingredientesRoutes from './routes/ingredienteRoutes.js' */


const whiteList = [
  'http://localhost:3000/',
];

const corsOptions = {
    origin: function (origin, callback) {
      if (whiteList.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Não permitido pelo CORS do site'));
      }
    }
};

class App {
    constructor() {
        this.app = express();
        this.middlewares();
        this.routes();
        this.start();
    }

    middlewares() {
        this.app.use(cors(corsOptions));
        this.app.use(helmet());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.json());
    }

    routes() {
        this.app.use('/api', userRoutes);
        this.app.use('/api', dicasRoutes);
        // this.app.use('/api', ingredientesRoutes);
    }

    start() {
        const PORT = process.env.PORT || 3000;
        this.app.listen(PORT, () => {
            console.log(`Servidor rodando em: http://localhost:${PORT}`);
        });
    }
}

export default new App().app;
