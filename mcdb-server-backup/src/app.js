import  express  from 'express';
import config from './config';
import cors from 'cors'

import mcdbExportsRoutes from './routes/mcdb-exports.routes';

const app = express();

app.set('port', config.port);

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(mcdbExportsRoutes);

export default app;