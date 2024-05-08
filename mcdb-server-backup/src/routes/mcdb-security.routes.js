import { Router } from "express";
import { getSecurityConfig, login } from "../controllers/mcdb-security.controller";
import { verifyToken } from "../libs/verification";

const router = Router();

router.get('/api/security/config', getSecurityConfig);

router.get('/api/security/verification', verifyToken);

router.post('/api/security/login', login)

export default router;