import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const whiteList = [
  'http://localhost:3000',
];

const corsOptions = {
    origin: function (origin, callback) {
      if(whiteList.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Não permitido pelo cors do site'));
      }
    }
};

class App {
    constructor() {
      this.app = express();
      this.middlewares();
      this.routes();
      console.log('Código rodando: http://localhost:3000 ')
    }
  
    middlewares() {
        this.app.use(cors(corsOptions));
        this.app.use(helmet());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.json());
    }
  
    routes() {
      
    }
  }
  
  export default new App().app;
