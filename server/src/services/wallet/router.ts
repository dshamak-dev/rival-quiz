import express from "express";
import { getRequestUser } from "../../user/user.action";
import { createWallet, getUserWallet, getWalletById } from "./actions";

const router = express.Router();

router.use(express.json());

router.get("/", async (req: any, res: any) => {
  const user = await getRequestUser(req);

  if (!user) {
    res.statusMessage = "User not found";
    return res.status(404).end();
  }

  const wallet = await getUserWallet(user.id).catch((err) => {
    console.log("Error getting wallet: ", err);
    return null;
  });

  res.status(200).json(wallet);
});

router.get("/:id", async (req: any, res: any) => {
  const walletId = req.params.id;

  if (!walletId) {
    res.statusMessage = "Invalid wallet ID";
    return res.status(400).end();
  }

  const user = await getRequestUser(req);

  if (!user) {
    res.statusMessage = "User not found";
    return res.status(404).end();
  }

  const wallet = await getWalletById(user.id).catch((err) => {
    console.log("Error getting wallet: ", err);
    return [];
  });

  if (user.id !== wallet.userId) {
    res.statusMessage = "Not authorized to view this wallet";
    return res.status(403).end();
  }

  res.status(200).json(wallet);
});

router.post("/", async (req: any, res: any) => {  
	const user = await getRequestUser(req);
  
	const userId = user?.id;
  
	if (!user || !userId) {
	  res.statusMessage = "Invalid user";
	  return res.status(401).end();
	}

	const payload = req.body;
  
	const wallet = await createWallet(userId, payload);
  
	res.status(201).json(wallet);
  });

router.use(function (request, response, next:any) {
  next();
});

export default router;
