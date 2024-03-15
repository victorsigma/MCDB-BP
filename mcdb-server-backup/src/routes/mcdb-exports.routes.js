import { Router } from 'express';
import { exportCsv, exportJson, exportXml } from '../controllers/mcdb-exports.controller';

const router = Router();

router.post('/api/export/csv', exportCsv)
router.post('/api/export/json', exportJson)
router.post('/api/export/xml', exportXml)


export default router;