const express = require("express");
const { isAuthenticated } = require("../middlewares/isAuthenticated");
const {
  create,
  details,
  update,
  remove,
  all,
  markDone,
  getAccountantData,
  accountantData,
  markStart,
} = require("../controllers/process");
const router = express.Router();

router.get("/accountant-data",isAuthenticated, getAccountantData);
router.get("/accountantdata",isAuthenticated, accountantData);
router.post("/", isAuthenticated, create);
router.get("/all", isAuthenticated, all);
router.get("/done/:_id", isAuthenticated, markDone);
// router.get("/undone/:_id", isAuthenticated, markUndone);

router
  .route("/:_id")
  .get(isAuthenticated, details)
  .put(isAuthenticated, update)
  .delete(isAuthenticated, remove);
  
module.exports = router;
