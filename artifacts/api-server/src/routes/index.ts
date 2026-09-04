import { Router, type IRouter } from "express";
import healthRouter from "./health";
import pramaanxRouter from "./pramaanx";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use(pramaanxRouter);

export default router;
