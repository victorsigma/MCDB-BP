import { Router } from "express";
import { backupDatabase } from "../controllers/mcdb-backup.controller";

const router = Router();

router.post('/api/backup', backupDatabase)

export default router;