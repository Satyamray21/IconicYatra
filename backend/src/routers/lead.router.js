import {Router} from "express";
import {createLead,viewAllLeads,updateLead,deleteLead,viewAllLeadsReports,viewByLeadId, changeLeadStatus} from "../controllers/lead.controller.js"


const router = Router();

router.route("/create").post(createLead);
router.route("/getAllLead").get(viewAllLeads);
router.route("/get-Count").get(viewAllLeadsReports);
router.route("/viewLeadById/:leadId").get(viewByLeadId);
router.route("/update-Lead/:leadId").put(updateLead);
router.route("/delete-Lead/:leadId").delete(deleteLead);
router.route("/change-status/:leadId").patch(changeLeadStatus)

export default router;
