import { Router, type IRouter } from "express";
import healthRouter from "./health";
import licensesRouter from "./licenses";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(licensesRouter);
router.use(adminRouter);

export default router;
