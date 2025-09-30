import { Router } from "express";
import {
  createCustomQuotation,
  getAllCustomQuotations,
  getCustomQuotationById,
  updateCustomQuotation,
  deleteCustomQuotation,
} from "../../controllers/quotation/customQuotation.controller.js";

const router = Router();

// CRUD
router.post("/", createCustomQuotation);
router.get("/", getAllCustomQuotations);
router.get("/:id", getCustomQuotationById);
router.put("/:id", updateCustomQuotation);
router.delete("/:id", deleteCustomQuotation);



export default router;
