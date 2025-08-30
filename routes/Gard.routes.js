const { Router } = require("express");
const { gardController } = require("../controllers/Gard.controller");
const { Validater } = require("../helper/checkvalidation");
const { GardValidation } = require("../validations/purchase.validation");
const { isAuthenticated } = require("../middlewares/isAuthenticated");


const router = Router();

router.post("/create",isAuthenticated,Validater(GardValidation),gardController.create)
router.get("/get-all",isAuthenticated,gardController.getAll)
router.get("/get/:id",isAuthenticated,gardController.getOne)
router.put("/update/:id",isAuthenticated,Validater(GardValidation),gardController.update)
router.delete("/delete/:id",isAuthenticated,gardController.delete)

module.exports = router;

