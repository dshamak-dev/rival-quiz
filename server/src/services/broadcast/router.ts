import express from "express";

const router = express.Router();

router.use(express.json());

router.use(function (request, response, next:any) {
  next();
});

export default router;
