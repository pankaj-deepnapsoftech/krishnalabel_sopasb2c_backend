const { Router } = require("express");
const { CustomerController } = require("../controllers/customer.controller");
const { Validater } = require("../helper/checkvalidation");
const { CustomerValidation, CustomerLoginValidate, CustomerPasswordValidation } = require("../validations/customer.validation");
const { isCustomerAuthenticated } = require("../middlewares/Customer.middleware");
const { isAuthenticated } = require("../middlewares/isAuthenticated");


const routes = Router();

routes.post("/create",Validater(CustomerValidation), CustomerController.prototype.create)
routes.post("/login",Validater(CustomerLoginValidate), CustomerController.prototype.login)
routes.post("/change-password",isCustomerAuthenticated,Validater(CustomerPasswordValidation), CustomerController.prototype.createNewPassword)
routes.get("/get-all", isAuthenticated, CustomerController.prototype.getAll)
routes.get("/getall", isAuthenticated, CustomerController.prototype.getAllcustomer)

routes.post("/verify-email",CustomerController.prototype.emailVerify)
routes.post("/reset-password",CustomerController.prototype.resetPassword)
routes.get("/all", isAuthenticated, CustomerController.prototype.All)
routes.patch("/update/:id", isAuthenticated, CustomerController.prototype.updateCustomer)


module.exports = routes;