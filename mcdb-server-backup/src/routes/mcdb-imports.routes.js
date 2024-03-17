import { Router } from "express";
import { importTableValues } from "../controllers/mcdb-imports.controller";

const router = Router();

router.post('/api/import', importTableValues);

export default router;