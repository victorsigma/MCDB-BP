import  express  from 'express';
import config from './config';
import cors from 'cors'

import mcdbExportsRoutes from './routes/mcdb-exports.routes';
import mcdbImportsRoutes from './routes/mcdb-imports.routes';

const app = express();

app.set('port', config.port);

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(mcdbExportsRoutes);
app.use(mcdbImportsRoutes);


export default app;