import {Router} from "express";
import {createLead,viewAllLeads} from "../controllers/lead.controller.js"


const router = Router();

router.route("/create").post(createLead);
router.route("/getAllLead").get(viewAllLeads);

export default router;
