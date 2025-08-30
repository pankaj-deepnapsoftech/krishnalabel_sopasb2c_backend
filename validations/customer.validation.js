const { object, string } = require("yup");
const bcrypt = require('bcrypt');

const CustomerValidation = object({
  full_name: string().min(2).required("Full Name is Required"),
  email: string().email().required("Email is Required"),
  phone: string().min(10).max(12).required("Phone No. is Required"),
  password: string().min(6).max(16).required("Password is Required"),
  type:string().required("Password is Required"),
  
  GST_NO: string()
    .matches(/^[0-9A-Z]{15}$/, "Invalid GST Number")
    .optional(),

  company_name: string()
    .min(2, "Company Name must be at least 2 characters")
    .optional(), 
});

const CustomerLoginValidate = object({
  email: string().email().required("Email is Required"),
  password:string().min(6).max(16).required("Password is Reqeuired")
})

const CustomerPasswordValidation = object({
  oldPassword:string().min(6).max(16).required("OLd Password is Reqeuired"),
  newPassword:string().min(6).max(16).required("New Password is Reqeuired")
})

module.exports = { CustomerValidation,CustomerLoginValidate ,CustomerPasswordValidation};
