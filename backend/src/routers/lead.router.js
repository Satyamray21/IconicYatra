import {Router} from "express";
import {createLead,viewAllLeads,updateLead,deleteLead} from "../controllers/lead.controller.js"


const router = Router();

router.route("/create").post(createLead);
router.route("/getAllLead").get(viewAllLeads);
router.route("/update-Lead/:leadId").put(updateLead);
router.route("/delete-Lead/:leadId").delete(deleteLead);
export default router;
