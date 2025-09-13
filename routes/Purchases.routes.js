const { Router } = require("express");
const { purchaseController } = require("../controllers/Purchases.controller");
const { Validater } = require("../helper/checkvalidation");
const { PurchasesValidation } = require("../validations/purchase.validation");
const { isAuthenticated } = require("../middlewares/isAuthenticated");
const {
  isCustomerAuthenticated,
} = require("../middlewares/Customer.middleware");
const Imageupload = require("../utils/image.multer");

const route = Router();

route.post(
  "/create",
  isAuthenticated,
  purchaseController.create
);


route.get("/getAll", isAuthenticated, purchaseController.getAll);
route.get("/getOne", isAuthenticated, purchaseController.getOne);
route.get(
  "/customer-get",
  isCustomerAuthenticated,
  purchaseController.CustomerGet
);
route.put(
  "/update/:id",
  isAuthenticated,
  purchaseController.update
);
route.delete("/delete/:id", isAuthenticated, purchaseController.Delete);
route.patch(
  "/upload-image/:id",
  isAuthenticated,
  purchaseController.Imagehandler
);

// upload invoices 
route.patch(
  "/upload-invoice/:id",
  isAuthenticated,
  Imageupload.single("invoice"),
  purchaseController.uploadinvoice
);


route.patch(
  "/update_performaInvoice/:id",
  isAuthenticated,
  Imageupload.single("performaInvoice"),
  purchaseController.update_performaInvoice
);


route.patch(
  "/upload-sample-image/:id",
  isAuthenticated,
  purchaseController.uploadsampleImage
);

route.patch(
  "/approve-status/:id",
  isCustomerAuthenticated,
  purchaseController.UpdateStatus
);
route.patch(
  "/image-status/:id",
  isCustomerAuthenticated,
  purchaseController.updateDesignStatus
);

route.patch(
  "/delivery-status/:id",
  isCustomerAuthenticated,
  purchaseController.updateDeliveryStatus
);

route.patch(
  "/invoice-status/:id",
  isCustomerAuthenticated,
  purchaseController.updateInvoiceStatus
);

route.patch(
  "/sales_design_status/:id",
  purchaseController.sales_design_status
);

route.get("/sales-graph", isAuthenticated, purchaseController.graphData);
route.get("/all", isAuthenticated, purchaseController.All);
route.patch(
  "/upload-invoice/:id",
  isAuthenticated,
  Imageupload.single("invoice"),
  purchaseController.uploadPDF
);
route.patch(
  "/payement-image/:id",
  isCustomerAuthenticated,
  Imageupload.single("payment"),
  purchaseController.uploadPaymentSS
);
route.patch(
  "/verify-payement/:id",
  isAuthenticated,
  purchaseController.VerifyPayement
);
route.patch("/dispatch/:id", isAuthenticated, purchaseController.Dispatch);
route.patch(
  "/delivery/:id",
  Imageupload.single("delivery"),
  purchaseController.Delivered
);

route.patch("/addToken/:id", isAuthenticated, purchaseController.AddToken);

route.patch("/updatesales/:id", isAuthenticated, purchaseController.updatesale);

route.patch(
  "/tokenProof/:id",
  isCustomerAuthenticated,
  purchaseController.uploadTokenSS
);

route.patch("/verifyToken/:id", isAuthenticated, purchaseController.VerifyToken);

route.patch("/approveSample/:id", isAuthenticated, purchaseController.ApproveSample);
route.put("/half-payement/:id", Imageupload.single("halfPayment"),purchaseController.UploadHalfProfe)

module.exports = route;
