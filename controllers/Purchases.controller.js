const { AssinedModel } = require("../models/Assined-to.model");
const { Purchase } = require("../models/Purchase");

class PurchaseController {
  async create(req, res) {
    try {
      const data = req.body;
    console.log(req.body)

      const newData = {
        ...data,
        user_id: req?.user._id,
      };

      await Purchase.create(newData);

      return res.status(201).json({ message: "Purchase Order Generated" });
    } catch (error) {
      console.error("Error creating purchase:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async getAll(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const data = await Purchase.aggregate([
      {
        $lookup: {
          from: "boms",
          localField: "_id",
          foreignField: "sale_id",
          as: "boms",
          pipeline: [
            {
              $lookup: {
                from: "production-processes",
                foreignField: "bom",
                localField: "_id",
                as: "production_processes",
                pipeline: [
                  {
                    $project: {
                      processes: 1,
                    },
                  },
                ],
              },
            },
            {
              $project: {
                is_production_started: 1,
                production_processes: 1,
                bom_name: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user_id",
          pipeline: [
            {
              $lookup: {
                from: "user-roles",
                foreignField: "_id",
                localField: "role",
                as: "role",
              },
            },
            {
              $project: {
                first_name: 1,
                role: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "customer_id",
          foreignField: "_id",
          as: "customer_id",
          pipeline: [
            {
              $project: {
                full_name: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "product_id",
          foreignField: "_id",
          as: "product_id",
          pipeline: [
            {
              $project: {
                name: 1,
                price: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "assineds",
          localField: "_id",
          foreignField: "sale_id",
          as: "assinedto",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "assined_to",
                foreignField: "_id",
                as: "assinedto",
                pipeline: [
                  {
                    $lookup: {
                      from: "user-roles",
                      localField: "role",
                      foreignField: "_id",
                      as: "role",
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    ])
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return res.status(200).json({ message: "all purchases order found", data });
  }

  async getOne(req, res) {
    const id = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const data = await Purchase.aggregate([
      { $match: { user_id: id } },
      {
        $lookup: {
          from: "boms",
          localField: "_id",
          foreignField: "sale_id",
          as: "boms",
          pipeline: [
            {
              $lookup: {
                from: "production-processes",
                foreignField: "bom",
                localField: "_id",
                as: "production_processes",
                pipeline: [
                  {
                    $project: {
                      processes: 1,
                    },
                  },
                ],
              },
            },
            {
              $project: {
                is_production_started: 1,
                production_processes: 1,
                bom_name: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user_id",
          pipeline: [
            {
              $lookup: {
                from: "user-roles",
                foreignField: "_id",
                localField: "role",
                as: "role",
              },
            },
            {
              $project: {
                first_name: 1,
                role: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "customer_id",
          foreignField: "_id",
          as: "customer_id",
          pipeline: [
            {
              $project: {
                full_name: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "product_id",
          foreignField: "_id",
          as: "product_id",
          pipeline: [
            {
              $project: {
                name: 1,
                price: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "assineds",
          localField: "_id",
          foreignField: "sale_id",
          as: "assinedto",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "assined_to",
                foreignField: "_id",
                as: "assinedto",
                pipeline: [
                  {
                    $lookup: {
                      from: "user-roles",
                      localField: "role",
                      foreignField: "_id",
                      as: "role",
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "assineds",
          localField: "_id",
          foreignField: "sale_id",
          as: "empprocess",
        },
      },
    ])
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
    return res.status(200).json({ message: "data found by id", data });
  }

  async CustomerGet(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const data = await Purchase.aggregate([
      {
        $match: {
          customer_id: req?.user?._id,
        },
      },
      {
        $lookup: {
          from: "products",
          foreignField: "_id",
          localField: "product_id",
          as: "product_id",
          pipeline: [
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "assineds",
          localField: "_id",
          foreignField: "sale_id",
          as: "empprocess",
        },
      },
      {
        $lookup: {
          from: "boms",
          localField: "_id",
          foreignField: "sale_id",
          as: "boms",
          pipeline: [
            {
              $lookup: {
                from: "production-processes",
                foreignField: "bom",
                localField: "_id",
                as: "production_processes",
                pipeline: [
                  {
                    $project: {
                      processes: 1,
                    },
                  },
                ],
              },
            },
            {
              $project: {
                is_production_started: 1,
                production_processes: 1,
                bom_name: 1,
              },
            },
          ],
        },
      },
    ])
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
    return res.status(200).json({ message: "customer data found", data });
  }

  async update(req, res) {
    const data = req.body;
    const { id } = req.params;
    const find = await Purchase.findById(id);
    if (!find) {
      return res.status(400).json({ message: "data not found" });
    }
    await Purchase.findByIdAndUpdate(id, data);
    return res.status(201).json({ message: "Purchase Order updated" });
  }

  async Delete(req, res) {
    const { id } = req.params;
    const find = await Purchase.findById(id);
    if (!find) {
      return res.status(400).json({ message: "data not found" });
    }
    await Purchase.findByIdAndDelete(id);
    return res.status(201).json({ message: "Purchase Order deleted" });
  }

  async Imagehandler(req, res) {
    const { assined_to, assinedto_comment, designFile } = req.body;
    const { id } = req.params;
    const find = await Purchase.findById(id);
    if (!find) {
      return res.status(404).json({
        message: "data not found try again",
      });
    }

    await Purchase.findByIdAndUpdate(id, { designFile });

    await AssinedModel.findByIdAndUpdate(assined_to, {
      isCompleted: "Completed",
      assinedto_comment,
    });
    return res.status(201).json({
      message: "file uploaded successful",
    });
  }

  async uploadinvoice(req, res) {
    try { 
      const { invoice_remark, invoice } = req.body;
      const { id } = req.params;
      const find = await Purchase.findById(id);
      if (!find) {
        return res.status(404).json({
          message: "data not found try again",
        });
      }


      await Purchase.findByIdAndUpdate(id, { invoice, invoice_remark: invoice_remark });

      // await AssinedModel.findByIdAndUpdate(assined_to, {
      //   isCompleted: "Completed",
      //   assinedto_comment,
      // });

      return res.status(201).json({
        message: "file uploaded successful",
      });
    } catch(err) {
      return res.status(500).json({
        message: err,
      });
    }
    
  }

  async update_performaInvoice(req, res) {
    try {
      const { id } = req.params;
      const { filename } = req.file;
      const find = await Purchase.findById(id);
      if (!find) {
        return res.status(404).json({
          message: "data not found try again",
        });
      }

      const path = `https://rtpasbackend.deepmart.shop/images/${filename}`;

      await Purchase.findByIdAndUpdate(id, { performaInvoice: path });

      return res.status(201).json({
        message: "file uploaded successful",
      });
    } catch (err) {
      return res.status(500).json({
        message: err,
      });
    }

  }
  
  async uploadsampleImage(req, res) {
    try {
      const { id } = req.params;
      const { sample_image } = req.body;
      const find = await Purchase.findById(id);
      if (!find) {
        return res.status(404).json({
          message: "data not found try again",
        });
      }
    console.log(sample_image)

      await Purchase.findByIdAndUpdate(id, { sample_image });

      return res.status(201).json({
        message: "file uploaded successful",
      });
    } catch (err) {
      return res.status(500).json({
        message: err,
      });
    }

  }

  async UpdateStatus(req, res) {
    const { Status } = req.body;
    const { id } = req.params;
    const find = await Purchase.findById(id);
    if (!find) {
      return res.status(404).json({
        message: "Data not found",
      });
    }
    await Purchase.findByIdAndUpdate(id, { Status });
    return res.status(201).json({
      message: "Status Approved Successful",
    });
  }

  async updateDesignStatus(req, res) {
    const { customer_approve, customer_design_comment, assined_to } = req.body;
    const { id } = req.params;
    if (!customer_approve) {
      return res.status(400).json({
        message: "customer is required",
      });
    }

    const find = await Purchase.findById(id);
    if (!find) {
      return res.status(404).json({
        message: "Data not found",
      });
    }
    await Purchase.findByIdAndUpdate(id, {
      customer_approve,
      customer_design_comment,
    });
    if (customer_approve !== "Approved") {
      await AssinedModel.findByIdAndUpdate(assined_to, {
        isCompleted: "Design Rejected",
      });
    }
    return res.status(201).json({
      message: "Status Approved Successful",
    });
  }

  async updateDeliveryStatus(req, res) {
    const { customer_approve, customer_design_comment } = req.body;
    const { id } = req.params;
    if (!customer_approve) {
      return res.status(400).json({
        message: "customer is required",
      });
    }

    const find = await Purchase.findById(id);
    if (!find) {
      return res.status(404).json({
        message: "Data not found",
      });
    }
    await Purchase.findByIdAndUpdate(id, {
      delivery_status_by_customer : customer_approve,
      delivery_status_comment_by_customer : customer_design_comment,
    });
    return res.status(201).json({
      message: "Status Change Successful",
    });
  }

  async updateInvoiceStatus(req, res) {
    const { customer_invoice_approve, customer_invoice_comment} = req.body;
    const { id } = req.params;
    if (!customer_invoice_approve) {
      return res.status(400).json({
        message: "customer is required",
      });
    }

    const find = await Purchase.findById(id);
    if (!find) {
      return res.status(404).json({
        message: "Data not found",
      });
    }
    await Purchase.findByIdAndUpdate(id, {
      customer_invoice_comment,
      customer_invoice_approve,
    });
    // if (customer_approve !== "Approve") {
    //   await AssinedModel.findByIdAndUpdate(assined_to, {
    //     isCompleted: "Design Rejected",
    //   });
    // }
    return res.status(201).json({
      message: "Status Approved Successful",
    });
  }

  async sales_design_status(req, res) {
    // const { sale_design_approve, sale_design_comment, assined_to } = req.body;
    const { sale_design_approve, sale_design_comment } = req.body;
    const { id } = req.params;
    if (!sale_design_approve) {
      return res.status(400).json({
        message: "customer is required",
      });
    }

    const find = await Purchase.findById(id);
    if (!find) {
      return res.status(404).json({
        message: "Data not found",
      });
    }
    await Purchase.findByIdAndUpdate(id, {
      sale_design_approve,
      sale_design_comment,
    });
    // if (sale_approve !== "Approve") {
    //   await AssinedModel.findByIdAndUpdate(assined_to, {
    //     isCompleted: "Design Rejected",
    //   });
    // }
    return res.status(201).json({
      message: "Status Approved Successful",
    });
  }

  async graphData(req, res) {
    try {
      const purchases = await Purchase.find(
        { payment_verify: true },
        "price product_qty GST createdAt"
      );

      // Aggregate sales data by month
      const monthlySales = {};

      purchases.forEach((purchase) => {
        const month = new Date(purchase.createdAt).toLocaleString("default", {
          month: "long",
        });

        const totalSale = purchase.price * purchase.product_qty;

        const totalGST =
          (purchase.GST.CGST || 0) +
          (purchase.GST.SGST || 0) +
          (purchase.GST.IGST || 0);

        const totalSaleWithGST = totalSale + totalGST;

        if (!monthlySales[month]) {
          monthlySales[month] = 0;
        }

        monthlySales[month] += totalSaleWithGST;
      });

      const response = {
        months: Object.keys(monthlySales),
        sales: Object.values(monthlySales),
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error calculating sales data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async All(req, res) {
    try {
      const totalSales = await Purchase.countDocuments({
        payment_verify: true,
      });

      res.status(200).json({
        success: true,
        total: totalSales,
      });
    } catch (error) {
      console.error("Error fetching total customers:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while fetching the total customers.",
      });
    }
  }

  async uploadPDF(req, res) {
    const { invoice } = req.body;
    const { id } = req.params; 

    const data = await Purchase.findById(id);
    if (!data) {
      return res.status(404).json({
        message: "data not found",
      });
    }
    await Purchase.findByIdAndUpdate(id, {
      invoice,
      paymet_status: "Pending",
    });
    return res.status(200).json({
      message: "file uploaded successful",
    });
  }

  async uploadPaymentSS(req, res) {
    const { id } = req.params;
    const { customer_pyement_ss } = req.bady;


    const data = await Purchase.findById(id);
    if (!data) {
      return res.status(404).json({
        message: "data not found",
      });
    }

    await Purchase.findByIdAndUpdate(id, {
      customer_pyement_ss,
      paymet_status: "Paied",
      payment_verify: false,
    });
    return res.status(200).json({
      message: "file uploaded successful",
    });
  }

  async VerifyPayement(req, res) {
    const { id } = req.params;
    const { payment_verify, assignId } = req.body;

    const data = await Purchase.findById(id);
    if (!data) {
      return res.status(404).json({
        message: "data not found",
      });
    }
    await Purchase.findByIdAndUpdate(id, { payment_verify });

    // Find the Assign document by its ID and update the isCompleted status
    const assign = await AssinedModel.findById(assignId);
    if (!assign) {
      return res.status(404).json({
        message: "Assign data not found",
      });
    }

    assign.isCompleted = "Complete";
    await assign.save();
    return res.status(200).json({
      message: "Payment verified Successful",
    });
  }

  async Dispatch(req, res) {
    const { id } = req.params;
    const { tracking_id, tracking_web } = req.body;

    if (!tracking_web?.trim() || !tracking_id?.trim()) {
      return res.status(404).json({
        message: "Tracking Id and Tracking Website is required",
      });
    }

    const data = await Purchase.findById(id);
    if (!data) {
      return res.status(404).json({
        message: "data not found",
      });
    }
    await Purchase.findByIdAndUpdate(id, {
      tracking_id,
      tracking_web,
      product_status: "Dispatch",
    });
    return res.status(200).json({
      message: "Product Dispatch",
    });
  }

  async Delivered(req, res) {
    const { dispatcher_order_ss } = req.body;
    const { id } = req.params;

   

    const data = await Purchase.findById(id);
      try {
        if (!data) {
          return res.status(404).json({
            message: "data not found",
          });
        }

        if (req.body.role = 'Dispatcher') {
          await Purchase.findByIdAndUpdate(id, {
            dispatcher_order_ss,
            product_status: "Delivered",
          });
        } else {
          await Purchase.findByIdAndUpdate(id, {
            customer_order_ss,  
            product_status: "Delivered",
          });
        }
        return res.status(200).json({
          message: "file uploaded successful",
        });

      } catch(err) {
        return res.status(500).json({
          message: err,
        });
      }
    
    }

  async AddToken(req, res) {
    const { id } = req.params;
    const { token_amt } = req.body;

    if (!token_amt) {
      return res.status(404).json({
        message: "token amount is required!",
      });
    }

    if (!id) {
      return res.status(404).json({
        message: "couldn't access the sale!",
      });
    }

    await Purchase.findByIdAndUpdate(id, {
      token_amt,
      token_status: false,
    });

    return res.status(200).json({
      message: "Token Amount added for sample :)",
    });
  }

  async uploadTokenSS(req, res) {
    const { token_ss } = req.body;
    const { id } = req.params;


    const data = await Purchase.findById(id);
    if (!data) {
      return res.status(404).json({
        message: "data not found",
      });
    }

    await Purchase.findByIdAndUpdate(id, {
      token_ss,
      token_status: true,
      isTokenVerify: false
    });
    return res.status(200).json({
      message: "file uploaded successful",
    });
  }

  async ApproveSample (req,res) {
    const {id}= req.params;
    if(!id){
      return res.status(404).json({message: "Failed to get the sale data :("})
    }

    await Purchase.findByIdAndUpdate(id, {isSampleApprove: true})                                                                                     
    return res.status(200).json({
      message: "Sample is Approved :)",
    });
  }

  async VerifyToken (req,res) {
    const {id} = req.params;
    const { assignId } = req.body;

    if(!id){
      return res.status(404).json({message: "Failed to get the sale data :("})
    }

    await Purchase.findByIdAndUpdate(id, { isTokenVerify: true});
    const assign = await AssinedModel.findByIdAndUpdate(assignId, {isCompleted: "Complete"});
    if (!assign) {
      return res.status(404).json({
        message: "Assign data not found",
      });
    }

    return res.status(200).json({
      message: "Token amount is verified :)",
    });
  }

  async updatesale(req, res) {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({ message: "Failed to get the sale data :(" })
    }

    await Purchase.findByIdAndUpdate(id,  req.body)
    return res.status(200).json({
      message: "Sample is Approved :)",
    });
  }

  async UploadHalfProfe(req,res){
    const data = req.body;
    console.log(data) 
    const {id} = req.params;
    await Purchase.findByIdAndUpdate(id,data)
    return res.status(200).json({
      message:"payment Proof Upload"
    })
  }

}



exports.purchaseController = new PurchaseController();
