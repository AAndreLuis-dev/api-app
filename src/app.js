import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import userRoutes from './routes/userRoutes.js';
import dicasRoutes from './routes/dicaRoutes.js';
import temaRoutes from './routes/temaRoutes.js';
import receitaRoutes from './routes/receitaRoutes.js';

/* import ingredientesRoutes from './routes/ingredienteRoutes.js' */

const whiteList = ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:8080'];


const corsOptions = {
    origin: function (origin, callback) {
        if (whiteList.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Não permitido pelo CORS do site'));
        }
    }
};

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API APP',
            version: '1.0.0',
            description: 'Documentação da API usada para o desenvolvimento dos aplicativos ecológicos',
        },
        servers: [
            {
                url: 'http://localhost:3000/',
                description: 'Ambiente Local backend'
            },
            {
                url: 'https://api-app-seven-chi.vercel.app/',
                description: 'Ambiente de Produção'
            },
        ],
    },
    apis: ['./src/routes/*.js'],
};

const options = {
    customCss: '.swagger-ui .topbar { display: none }'
}

const swaggerDocs = swaggerJsDoc(swaggerOptions);

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
        this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, options));
    }

    routes() {
        this.app.use('/api', userRoutes);
        this.app.use('/api', dicasRoutes);
        this.app.use('/api', temaRoutes);
        this.app.use('/api', receitaRoutes);
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
