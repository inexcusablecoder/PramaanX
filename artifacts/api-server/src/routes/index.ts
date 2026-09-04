import { Router, type IRouter } from "express";
import healthRouter from "./health";
import pramaanxRouter from "./pramaanx";

const router: IRouter = Router();

router.use(healthRouter);
router.use(pramaanxRouter);

export default router;
