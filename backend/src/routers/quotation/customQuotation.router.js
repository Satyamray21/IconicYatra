import { Router } from "express";
import {
  createCustomQuotation,
  getAllCustomQuotations,
  getCustomQuotationById,
  updateCustomQuotation,
  deleteCustomQuotation,
  updateQuotationStep
} from "../../controllers/quotation/customQuotation.controller.js";

const router = Router();

// CRUD
router.post("/", createCustomQuotation);
router.get("/", getAllCustomQuotations);
router.post("/update-step",updateQuotationStep);
router.get("/:quotationId", getCustomQuotationById);
router.put("/:id", updateCustomQuotation);
router.delete("/:id", deleteCustomQuotation);



export default router;
