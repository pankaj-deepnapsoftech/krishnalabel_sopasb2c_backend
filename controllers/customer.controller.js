const { CustomerModel } = require("../models/customer.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const OTP = require("../models/otp");
const { generateOTP } = require("../utils/generateOTP");
const { sendEmail } = require("../utils/sendEmail");

class CustomerController {
  async create(req, res) {
    const data = req.body;
    const find = await CustomerModel.findOne({ email: data.email });
    if (find) {
      return res.status(400).json({
        message: "user already exist",
      });
    }
    await CustomerModel.create(data);
    res.status(201).json({
      message: "Customer created successful",
    });
  }

  async login(req, res) {
    const { email, password } = req.body;
    const user = await CustomerModel.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        message: "User Not Exist",
      });
    }

    const isMatched =  bcrypt.compareSync(password, user.password);
    if (!isMatched) {
      return res.status(403).json({
        message: "Wrong Password",
      });
    }
    const token = jwt.sign(
      {
        email: user.email,
        iat: Math.floor(Date.now() / 1000) - 30,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    user.password = null;
    return res.status(200).json({ message: "Login Successful", user, token });
  }

  async createNewPassword(req, res) {
    const { oldPassword, newPassword } = req.body;
    const user = await CustomerModel.findById(req?.user?._id);
    if (!user) {
      return res.status(404).json({
        message: "Bad credintials",
      });
    }

    const isMatched = await bcrypt.compare(oldPassword, user.password);
    if (!isMatched) {
      return res.status(403).json({
        message: "Old Password is Not matched",
      });
    }

    await CustomerModel.findByIdAndUpdate(req?.user?._id, {
      password: newPassword,
    });
    return res.status(201).json({
      message: "New Password Created",
    });
  }

  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const skip = (page - 1) * limit;
  
      // Fetch data with pagination
      const data = await CustomerModel.find({})
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
  
      // Get total count for pagination
      const total = await CustomerModel.countDocuments();
  
      return res.status(200).json({
        message: "All customers data",
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (err) {
      return res.status(500).json({ message: "Server error", error: err.message });
    }
  }
  


  async getAllcustomer(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const data = await CustomerModel.find({})
      .sort({ _id: -1 })
      .exec();
    return res.status(200).json({
      message: "All customers data",
      data,
    });
  }

  async emailVerify(req, res) {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        message: "email is required",
      });
    }
    const user = await CustomerModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "email Not exist",
      });
    }
    let otp = generateOTP(4);
    const findOTP = await OTP.findOne({ email });
    if (!findOTP) {
      await OTP.create({ email, otp });
    } else {
      await OTP.findByIdAndUpdate(findOTP._id, otp);
    }

    sendEmail(
      "Account Verification",
      `
          <strong>Dear ${user.full_name}</strong>,
      
          <p>Thank you for registering with us! To complete your registration and verify your account, please use the following One-Time Password (OTP): <strong>${otp}</strong></p>
    
          <p>This OTP is valid for 5 minutes. Do not share your OTP with anyone.</p>
          `,
      user?.email
    );

    res.status(200).json({
      status: 200,
      success: true,
      message:
        "User has been created successfully. OTP has been successfully sent to your email id",
      user,
    });
  }

  async resetPassword(req, res) {
    const { email, otp, newPassword } = req.body;
    if (!(email || otp || newPassword)) {
      return res.status(400).json({
        message: "OTP or new Password is required",
      });
    }
    if (newPassword.length >= 5) {
      return res.status(400).json({
        message: "Password must be at last 6 character",
      });
    }
    const find = await OTP.findOne({ email });
    if (!find) {
      return res.status(404).json({
        message: "Bad Request",
      });
    }
    if (otp !== find.otp) {
      return res.status(404).json({
        message: "Incorrect OTP",
      });
    }
    await CustomerModel.findOneAndUpdate({ email }, { password: newPassword });
    return res.status(201).json({
      message: "New Password Created",
    });
  }

  async All(req, res) {
    try {
      const totalCustomers = await CustomerModel.countDocuments();

      res.status(200).json({
        success: true,
        total: totalCustomers,
      });
    } catch (error) {
      console.error("Error fetching total customers:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while fetching the total customers.",
      });
    }
  }

  async updateCustomer(req,res) {
    const {id} = req.params;
    const {full_name,email,phone,type,company_name,GST_NO} = req.body;
    
    const user = await CustomerModel.findById(id);
    if(!user){
      return res.status(404).json({
        message:"user not found"
      })
    }
    await CustomerModel.findByIdAndUpdate(id,{full_name,email,phone,type,company_name,GST_NO});
    return res.status(200).json({
      message:"Customer Update Successful"
    })
  }
  
}

module.exports = { CustomerController };
