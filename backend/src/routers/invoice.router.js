import express from "express";
import {
    createInvoice,
    getInvoices,
    getInvoiceById,
    updateInvoice,
    deleteInvoice,
} from "../controllers/invoice.controller.js";

const router = express.Router();
router.post('/create', createInvoice);
router.get('/get', getInvoices);


router.route("/:id")
    .get(getInvoiceById)
    .put(updateInvoice)
    .delete(deleteInvoice);

export default router;