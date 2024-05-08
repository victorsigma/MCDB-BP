import { config } from 'dotenv';
import { propertiesSync } from './libs/readProperties';
config();


const propertie = propertiesSync();

export default {
    port: process.env.PORT || propertie['app.port'] || 3000
}