import { Router } from "express";
import { restoreBackup } from "../controllers/mcdb-restore.controller";

const router = Router();

router.post('/api/restore', restoreBackup);

export default router;