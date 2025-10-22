import express from "express";
import multer from "multer";
import {
  createOrResumeStep1,
  updateStep2,
  updateStep3,
  updateStep4,
  updateStep5,
  finalizeQuotation,
} from "../../controllers/quotation/fullQuotation.controller.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });
router.post(
  "/step1",
  upload.single("banner"), // handle banner file
  createOrResumeStep1
);
router.put("/step2/:quotationId", updateStep2);
router.put("/step3/:quotationId", updateStep3);
router.put("/step4/:quotationId", updateStep4);
router.put("/step5/:quotationId", updateStep5);
router.put("/finalize/:quotationId", finalizeQuotation);

export default router;
