  const { AssinedModel } = require("../models/Assined-to.model");
const { Notification } = require("../models/notification");
const { TryCatch } = require("../utils/error");

const assinedTask = TryCatch(async (req, res) => {
  const data = req.body;
  const find = await AssinedModel.findOne({
    sale_id: data.sale_id,
    assined_process: data.assined_process.toLowerCase().trim(),
  });
  if (find) {
    return res.status(400).json({
      message: "task is already assined",
    });
  }
  const value = await AssinedModel.create({
    ...data,
    assined_by: req?.user._id,
  });

  await Notification.create({
    reciever_id: value?.assined_to,
    message: `New task assigned -  ${value?.assined_process}.`,
  });

  return res.status(201).json({
    message: "Task assined Successful",
  });
});
const getAssinedTask = TryCatch(async (req, res) => {
  const { _id } = req.user;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  // Build match conditions for filtering
  let matchConditions = { assined_to: _id };

  // Add status filter
  if (req.query.status) {
    const statusMap = {
      pending: "Pending",
      underprocessing: "UnderProcessing",
      completed: "Completed",
    };
    matchConditions.isCompleted =
      statusMap[req.query.status.toLowerCase()] || req.query.status;
  }

  // Build aggregation pipeline for count
  let countPipeline = [
    {
      $match: matchConditions,
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "assined_by",
        as: "assined_by",
        pipeline: [
          {
            $lookup: {
              from: "user-roles",
              foreignField: "_id",
              localField: "role",
              as: "role",
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "purchases",
        localField: "sale_id",
        foreignField: "_id",
        as: "sale_id",
        pipeline: [
          {
            $lookup: {
              from: "products",
              localField: "product_id",
              foreignField: "_id",
              as: "product_id",
            },
          },
          {
            $lookup: {
              from: "boms",
              localField: "_id",
              foreignField: "sale_id",
              as: "bom",
            },
          },
          {
            $lookup: {
              from: "customers",
              localField: "customer_id",
              foreignField: "_id",
              as: "customer_id",
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
                  $project: {
                    first_name: 1,
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ];

  // Add search filter to count pipeline
  if (req.query.search) {
    countPipeline.push({
      $match: {
        $or: [
          {
            "sale_id.product_id.name": {
              $regex: req.query.search,
              $options: "i",
            },
          },
          {
            "assined_by.first_name": {
              $regex: req.query.search,
              $options: "i",
            },
          },
          {
            "sale_id.customer_id.full_name": {
              $regex: req.query.search,
              $options: "i",
            },
          },
          {
            "sale_id.customer_id.company_name": {
              $regex: req.query.search,
              $options: "i",
            },
          },
          { assined_process: { $regex: req.query.search, $options: "i" } },
          { assinedby_comment: { $regex: req.query.search, $options: "i" } },
          {
            "sale_id.user_id.first_name": {
              $regex: req.query.search,
              $options: "i",
            },
          },
        ],
      },
    });
  }

  // Add date filter to count pipeline
  if (req.query.date) {
    countPipeline.push({
      $match: {
        $expr: {
          $eq: [
            { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            req.query.date,
          ],
        },
      },
    });
  }

  // Build aggregation pipeline for data
  let dataPipeline = [...countPipeline];

  // Add sorting, skip, and limit to data pipeline
  dataPipeline.push({ $sort: { _id: -1 } }, { $skip: skip }, { $limit: limit });

  // Add count stage to count pipeline
  countPipeline.push({ $count: "total" });

  // Execute both pipelines
  const [data, countResult] = await Promise.all([
    AssinedModel.aggregate(dataPipeline).exec(),
    AssinedModel.aggregate(countPipeline).exec(),
  ]);

  const total = countResult.length > 0 ? countResult[0].total : 0;
  const totalPages = Math.ceil(total / limit);

  return res.status(200).json({
    message: "data found",
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  });
});

const updateAssinedTask = TryCatch(async (req, res) => {
  const { id } = req.params;
  const value = req.body;
  const data = await AssinedModel.findById(id);
  if (!data) {
    return res.status(404).json({
      message: "data not found",
    });
  }

  const updatedValue = {
    ...value,
    isCompleted: "Pending",
  };
  await AssinedModel.findByIdAndUpdate(id, updatedValue);

  await Notification.create({
    reciever_id: value?.assined_to,
    message: `Your ${value?.assined_process} task has been updated.`,
  });

  return res.status(201).json({
    message: "Task Assined Updated",
  });
});

const DeleteAssinedTask = TryCatch(async (req, res) => {
  const { id } = req.params;
  const data = await AssinedModel.findById(id);
  if (!data) {
    return res.status(404).json({
      message: "data not found",
    });
  }
  await AssinedModel.findByIdAndDelete(id);
  return res.status(201).json({
    message: "Task Deleted successful",
  });
});

const UpdateDesignStatus = TryCatch(async (req, res) => {
  const { id } = req.params;
  const { isCompleted } = req.body;

  const data = await AssinedModel.findById(id).exec();
  if (!data) {
    return res.status(400).json({
      message: "Wrong id",
    });
  }
  await AssinedModel.findByIdAndUpdate(id, { isCompleted });
  return res.status(200).json({
    message: "Status changed :)",
  });
});

const CountTotal = TryCatch(async (req, res) => {
  const { _id } = req.user;
  try {
    const count = await AssinedModel.aggregate([
      {
        $match: {
          $or: [{ assined_to: _id }, { assined_by: _id }],
        },
      },
      {
        $group: {
          _id: "$isCompleted",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
        },
      },
    ]);

    res.json(count);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = {
  assinedTask,
  getAssinedTask,
  updateAssinedTask,
  DeleteAssinedTask,
  UpdateDesignStatus,
  CountTotal,
};
