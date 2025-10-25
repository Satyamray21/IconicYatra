import { Router } from "express";
import {
  createCustomQuotation,
  getAllCustomQuotations,
  getCustomQuotationById,
  updateCustomQuotation,
  deleteCustomQuotation,
  updateQuotationStep
} from "../../controllers/quotation/customQuotation.controller.js";
import { upload } from "../../middlewares/imageMulter.middleware.js";
const router = Router();

// CRUD
router.post("/", createCustomQuotation);
router.get("/", getAllCustomQuotations);
router.post("/update-step", upload.array('itineraryImages'), updateQuotationStep);
router.get("/:quotationId", getCustomQuotationById);
router.put("/:id", updateCustomQuotation);
router.delete("/:id", deleteCustomQuotation);



export default router;
