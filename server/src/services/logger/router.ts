import express from "express";

const router = express.Router();

router.use(express.json());

// router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
//   console.error(`ERROR: ${err.message}`);

//   addLog({
//     source: req.url || "express",
//     message: err.message,
//     data: req.body,
//   });

//   res.status(500).json({
//     success: false,
//     message: "Internal Server Error",
//   });
// });

export default router;
