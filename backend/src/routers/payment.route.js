import express from "express";
import {
  createVoucher,
  getAllVouchers,
  getVoucherById,
  updateVoucher,
  deleteVoucher,
  getPaymentHistory,
  getPaymentSummary
} from "../controllers/payment.controller.js";

const router = express.Router();

// CREATE + GET ALL
router.route("/")
  .post(createVoucher)
  .get(getAllVouchers);

// GET | UPDATE | DELETE VOUCHER BY ID
router.route("/:id")
  .get(getVoucherById)
  .put(updateVoucher)
  .delete(deleteVoucher);

// 🔥 PAYMENT HISTORY ROUTE
// /payments/history/:type/:quotationId
router.get("/history/:type/:quotationId", getPaymentHistory);

// 🔥 PAYMENT SUMMARY ROUTE
// /payments/summary/:type/:quotationId
router.get("/summary/:type/:quotationId", getPaymentSummary);

export default router;
