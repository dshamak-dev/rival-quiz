import express from "express";
import {
  createInvoice,
  getInvoiceById,
  getInvoices,
  updateInvoice,
} from "./api";
import { expandResponse } from "@shared/async/helpers";
import { getRequestUser } from "@/user/user.action";
import { createTransaction } from "../transaction/action";
import { calculateInvoicePoints } from "./helper";
import { InvoiceStatus } from "./type";
import { TransactionParty, TransactionPayload } from "../transaction/type";
import { TransactionTypeEnum } from "@shared/transaction/type";

const router = express.Router();

router.use(express.json());

router.get("/", async (req: any, res: any) => {
  const user = await getRequestUser(req);

  if (!user) {
    return res.status(403).end();
  }

  const isSupport = req.query.support === "true";

  const query = {};

  if (isSupport) {
    query["status"] = { $in: [InvoiceStatus.DRAFT] };
    query["senderType"] = { $in: ["system"] };
  } else {
    query["status"] = { $in: [InvoiceStatus.DRAFT] };
    query["senderType"] = { $in: ["user"] };
    query["senderId"] = user.id;
  }

  const [invoices, error] = await expandResponse(getInvoices(query));

  if (error) {
    const errorMessage = error?.message || "Failed to retrieve invoices";

    res.statusMessage = errorMessage;
    res.status(500).json({ error: { message: errorMessage } });
  } else {
    res.json(invoices);
  }
});

router.get("/self", async (req: any, res: any) => {
  const user = await getRequestUser(req);

  if (!user) {
    return res.status(403).end();
  }

  const query = {
    status: { $in: [InvoiceStatus.DRAFT] },
    senderType: { $in: ["user"] },
    senderId: user.id,
  };

  const [invoices, error] = await expandResponse(getInvoices(query));

  if (error) {
    const errorMessage = error?.message || "Failed to retrieve invoices";

    res.statusMessage = errorMessage;
    res.status(500).json({ error: { message: errorMessage } });
  } else {
    res.json(invoices);
  }
});

router.get("/:id", async (req: any, res: any) => {
  const id = req.params.id;

  if (!id) {
    res.statusMessage = "Invalid invoice ID";
    return res.status(400).end();
  }

  const [invoice, error] = await expandResponse(getInvoiceById(id));

  if (error || !invoice) {
    const errorMessage = error?.message || "Failed to retrieve invoice";

    res.statusMessage = errorMessage;
    res.status(500).json({ error: { message: errorMessage } });
  } else {
    res.json(invoice);
  }
});

router.post("/", async (req: any, res: any) => {
  const payload = req.body || null;

  const [invoice, error] = await expandResponse(createInvoice(payload));

  if (error || !invoice) {
    const errorMessage = error?.message || "Failed to create invoice";

    res.statusMessage = errorMessage;
    res.status(500).json({ error: { message: errorMessage } });
  } else {
    res.status(201).json(invoice);
  }
});

router.patch("/:id", async (req: any, res: any) => {
  const id = req.params.id;
  const payload = req.body || null;

  const [invoice, error] = await expandResponse(getInvoiceById(id));

  if (error || !invoice) {
    const errorMessage = error?.message || "Failed to find invoice";

    res.statusMessage = errorMessage;
    return res.status(400).json({ error: { message: errorMessage } });
  }

  if (Object.keys(payload).length === 0) {
    res.statusMessage = "No changes provided";
    return res.status(400).end();
  }

  const [updatedInvoice, updateError] = await expandResponse(
    updateInvoice(id, { ...invoice, ...payload })
  );

  if (updateError || !updatedInvoice) {
    const errorMessage = updateError?.message || "Failed to update invoice";

    res.statusMessage = errorMessage;
    return res.status(500).json({ error: { message: errorMessage } });
  }

  res.status(200).json(updatedInvoice);
});

router.post("/:id/complete", async (req: any, res: any) => {
  const id = req.params.id;
  const payload = req.body || null;

  const [invoice, error] = await expandResponse(getInvoiceById(id));

  if (error || !invoice) {
    const errorMessage = error?.message || "Failed to find invoice";

    res.statusMessage = errorMessage;
    res.status(400).json({ error: { message: errorMessage } });
    return;
  }

  if (invoice.status !== InvoiceStatus.DRAFT) {
    res.statusMessage =
      invoice.status === InvoiceStatus.PAID
        ? "Payment already made"
        : "Invoice is not payable";

    res.status(invoice.status === InvoiceStatus.PAID ? 200 : 400).json(invoice);
    return;
  }

  const points = calculateInvoicePoints(invoice);

  let sender: TransactionParty | null = null;
  let recipient: TransactionParty | null = null;
  let transactionPayload: TransactionPayload | null = null;

  switch (invoice.senderType) {
    case "user": {
      // Top-Up: Switch invoice recipient with sender to send points to one who paid
      sender = { type: invoice.recipientType, id: invoice.recipientId };
      recipient = { type: invoice.senderType, id: invoice.senderId };
      transactionPayload = {
        type: TransactionTypeEnum.TopUp,
        amount: points,
        details: `Payment for invoice ${invoice.id}`,
        data: payload,
        reference: invoice.id,
      };
      break;
    }
    case "system": {
      // Withdrawal
      sender = { type: invoice.senderType, id: invoice.senderId };
      recipient = { type: invoice.recipientType, id: invoice.recipientId };
      transactionPayload = {
        type: TransactionTypeEnum.Withdrawal,
        amount: points,
        details:
          invoice.metadata?.paymentDetails?.details ||
          `Withdrawal invoice ${invoice.id}`,
        data: payload,
        reference: invoice.id,
      };
      break;
    }
  }

  if (!sender || !recipient || !transactionPayload) {
    res.statusMessage = "Invalid invoice recipient or sender";
    res
      .status(400)
      .json({ error: { message: "Invalid invoice recipient or sender" } });
    return;
  }

  const [transaction, transactionError] = await expandResponse(
    createTransaction(sender, recipient, transactionPayload)
  );

  if (transactionError || !transaction) {
    const errorMessage =
      transactionError?.message || "Failed to create transaction";

    res.statusMessage = errorMessage;
    res.status(500).json({ error: { message: errorMessage } });
    return;
  }

  const nextMetadata = {
    ...invoice.metadata,
    ...payload.metadata,
    transaction: {
      transactionId: transaction.id,
    },
  };

  const [updatedInvoice, updateError] = await expandResponse(
    updateInvoice(id, {
      ...invoice,
      ...payload,
      metadata: nextMetadata,
      status: InvoiceStatus.PAID,
    })
  );

  if (updateError || !updatedInvoice) {
    const errorMessage = updateError?.message || "Failed to update invoice";

    res.statusMessage = errorMessage;
    return res.status(500).json({ error: { message: errorMessage } });
  }

  res.status(201).json(updatedInvoice);
});

export default router;
