const Product = require("../models/product");
const csv = require("csvtojson");
const fs = require("fs");
const { TryCatch, ErrorHandler } = require("../utils/error");
const { checkProductCsvValidity } = require("../utils/checkProductCsvValidity");
const BOMRawMaterial = require("../models/bom-raw-material");
const ProductionProcess = require("../models/productionProcess");
const BOM = require("../models/bom");
const { Parser } = require('json2csv');


exports.create = TryCatch(async (req, res) => {
  const productDetails = req.body;
  if (!productDetails) {
    throw new ErrorHandler("Please provide product details", 400);
  }

  const product = await Product.create({
    ...productDetails,
    approved: req.user.isSuper,
  });

  res.status(200).json({
    status: 200,
    success: true,
    message: "Product has been added successfully",
    product,
  });
});
exports.update = TryCatch(async (req, res) => {
  const productDetails = req.body;
  if (!productDetails) {
    throw new ErrorHandler("Please provide product details", 400);
  }

  const { _id } = productDetails;

  let product = await Product.findById(_id);
  if (!product) {
    throw new ErrorHandler("Product doesn't exist", 400);
  }

  product = await Product.findOneAndUpdate(
    { _id },
    {
      ...productDetails,
      approved: req.user.isSuper ? productDetails?.approved : false,
    },
    { new: true }
  );

  res.status(200).json({
    status: 200,
    success: true,
    message: "Product has been updated successfully",
    product,
  });
});
exports.remove = TryCatch(async (req, res) => {
  const { _id } = req.body;
  const product = await Product.findByIdAndDelete(_id);
  if (!product) {
    throw new ErrorHandler("Product doesn't exist", 400);
  }
  res.status(200).json({
    status: 200,
    success: true,
    message: "Product has been deleted successfully",
    product,
  });
});
exports.details = TryCatch(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id).populate("store");
  if (!product) {
    throw new ErrorHandler("Product doesn't exist", 400);
  }
  res.status(200).json({
    status: 200,
    success: true,
    product,
  });
});
exports.all = TryCatch(async (req, res) => {
  const { category } = req.query;
  let products;
  if (category) {
    products = await Product.find({
      approved: true,
      inventory_category: category,
    })
      .sort({ updatedAt: -1 })
      .populate("store");
  } else {
    products = await Product.find({ approved: true })
      .sort({ updatedAt: -1 })
      .populate("store");
  }

  res.status(200).json({
    status: 200,
    success: true,
    products,
  });
});

exports.categoryproduct = TryCatch(async (req, res) => {
  const { category } = req.query;
  let products;
  if (category) {
    products = await Product.find({
      approved: true,
      category: category,
    })
      .sort({ updatedAt: -1 })
      .populate("store");
  } else {
    products = await Product.find({ approved: true })
      .sort({ updatedAt: -1 })
      .populate("store");
  }

  res.status(200).json({
    status: 200,
    success: true,
    products,
  });
});



exports.unapproved = TryCatch(async (req, res) => {
  const unapprovedProducts = await Product.find({ approved: false }).sort({
    updatedAt: -1,
  });
  res.status(200).json({
    status: 200,
    success: true,
    unapproved: unapprovedProducts,
  });
});
exports.bulkUploadHandler = async (req, res) => {
  csv()
    .fromFile(req.file.path)
    .then(async (response) => {
      try {
        fs.unlink(req.file.path, () => { });

        await checkProductCsvValidity(response);
        const products = response;

        const updatedProducts = products.map(product => ({
          ...product,
          approved: req.user.isSuper,
        }));
        
        await Product.insertMany(updatedProducts);

        res.status(200).json({
          status: 200,
          success: true,
          message: "Products has been added successfully",
        });
      } catch (error) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: error?.message,
        });
      }
    });
};
exports.workInProgressProducts = TryCatch(async (req, res) => {
  const products = [];
  const processes = await ProductionProcess.find({
    status: "work in progress",
  })
  .sort({ createdAt: -1 })
    .populate({
      path: "raw_materials",
      populate: {
        path: "item",
      },
    })
    .populate({
      path: "bom",
      populate: {
        path: "finished_good",
        populate: {
          path: "item",
        },
      },
    })
    .populate({
      path: "scrap_materials",
      populate: {
        path: "item", // ✅ Fix: Populate `item` directly inside `scrap_materials`
      },
    });
  

  processes.forEach(p => {
    p.raw_materials.forEach(material => products.push({ ...material._doc, bom: p.bom, createdAt: p.createdAt, updatedAt: p.updatedAt }));
  });


  const transformData = processes.map(process => {
    const bom = process.bom;
    const createdAt = new Date(process?.createdAt);
    const updatedAt = new Date(process?.updatedAt);
  
    const formattedCreated = createdAt.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    const formattedUpdated = updatedAt.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  
    const fg = process.finished_good;
  
    const parent = {
      bom: bom?.bom_name || '',
      process: '',
      goods: bom?.finished_good?.item?.name || '',
      category: bom?.finished_good?.item?.category || '',
      sub_category: bom?.finished_good?.item?.sub_category || '',
      estimated_quantity: `${fg.estimated_quantity} ${bom?.finished_good?.item?.uom || ''}`,
      used_quantity: `${fg.produced_quantity} ${bom?.finished_good?.item?.uom || ''}`,
      uom: bom?.finished_good?.item?.uom || '',
      process_start: '',
      process_done: '',
      created: formattedCreated,
      modified: formattedUpdated,
      children: []
    };
  
    // 1. Create Process Steps Parent Node
    if (Array.isArray(process.processes) && process.processes.length > 0) {
      const processStepsNode = {
        bom: 'Process Steps',
        process: '',
        goods: '',
        category: '',
        sub_category: '',
        estimated_quantity: '',
        used_quantity: '',
        uom: '',
        process_start: '',
        process_done: '',
        created: '',
        modified: '',
        children: []
      };

      process.processes.forEach(p => {
        processStepsNode.children.push({
          bom: '',
          process: p.process,
          goods: '',
          category: '',
          sub_category: '',
          estimated_quantity: '',
          used_quantity: '',
          uom: '',
          process_start: p?.start || '',
          process_done: p?.done || '',
          created: '',
          modified: '',
          children: []
        });
      });

      parent.children.push(processStepsNode);
    }
  
    // 2. Create Raw Material Parent Node
    if (Array.isArray(process.raw_materials) && process.raw_materials.length > 0) {
      const rawMaterialNode = {
        bom: 'Raw Material',
        process: '',
        goods: '',
        category: '',
        sub_category: '',
        estimated_quantity: '',
        used_quantity: '',
        uom: '',
        process_start: '',
        process_done: '',
        created: '',
        modified: '',
        children: []
      };
  
      process.raw_materials.forEach(rm => {
        rawMaterialNode.children.push({
          bom: '',
          process: '',
          goods: rm.item?.name || '',
          category: rm.item?.category || '',
          sub_category: rm.item?.sub_category || '',
          estimated_quantity: `${rm.estimated_quantity} ${rm.item?.uom || ''}`,
          used_quantity: `${rm.used_quantity} ${rm.item?.uom || ''}`,
          uom: rm.item?.uom || '',
          process_start: '',
          process_done: '',
          created: '',
          modified: '',
          children: []
        });
      });
  
      parent.children.push(rawMaterialNode);
    }
  
    // 3. Create Scrap Material Parent Node
    if (Array.isArray(process.scrap_materials) && process.scrap_materials.length > 0) {
      const scrapMaterialNode = {
        bom: 'Scrap Material',
        process: '',
        goods: '',
        category: '',
        sub_category: '',
        estimated_quantity: '',
        used_quantity: '',
        uom: '',
        process_start: '',
        process_done: '',
        created: '',
        modified: '',
        children: []
      };
  
      process.scrap_materials.forEach(scrap => {
        scrapMaterialNode.children.push({
          bom: '',
          process: '',
          goods: scrap.item?.name || '',
          category: 'Scrap',
          sub_category: '',
          estimated_quantity: `${scrap.estimated_quantity} ${scrap.item?.uom || ''}`,
          used_quantity: `${scrap.produced_quantity} ${scrap.item?.uom || ''}`,
          uom: scrap.item?.uom || '',
          process_start: '',
          process_done: '',
          created: '',
          modified: '',
          children: []
        });
      });
  
      parent.children.push(scrapMaterialNode);
    }
  
    return parent;
  });
  

  res.status(200).json({
    status: 200,
    success: true,
    processes,
    transformData,
    products,
  });
});


exports.exportIndirectdata = TryCatch(async (req, res) => {
  try {
    const data = await Product.find({inventory_category: "indirect"}).lean(); // Fetch data
  
    const fields = ['inventory_category', 'name', 'color', 'code', 'product_id', 'uom', 'category', 'current_stock', 'min_stock', 'max_stock', 'price', 'hsn_code', 'item_type', 'product_or_service', 'sub_category', 'regular_buying_price', 'wholesale_buying_price', 'mrp', 'dealer_price', 'distributor_price']; // Adjust to your schema
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(data);
  
    res.header('Content-Type', 'text/csv');
    res.attachment('export.csv');
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

exports.exportdirectdata = TryCatch(async (req, res) => {
  try {
    const data = await Product.find({inventory_category: "direct"}).lean(); // Fetch data
  
    const fields = ['inventory_category', 'name', 'color', 'code', 'product_id', 'uom', 'category', 'current_stock', 'min_stock', 'max_stock', 'price', 'hsn_code', 'item_type', 'product_or_service', 'sub_category', 'regular_buying_price', 'wholesale_buying_price', 'mrp', 'dealer_price', 'distributor_price']; // Adjust to your schema
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(data);
  
    res.header('Content-Type', 'text/csv');
    res.attachment('export.csv');
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

exports.bulkremove  = TryCatch(async (req, res) => {
  const { ids } = req.body; // `ids` should be an array of MongoDB IDs
  
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new ErrorHandler("No product IDs provided", 400);
  }

  const result = await Product.deleteMany({ _id: { $in: ids } });

  if (result.deletedCount === 0) {
    throw new ErrorHandler("No matching products found", 400);
  }

  res.status(200).json({
    status: 200,
    success: true,
    message: `${result.deletedCount} product(s) have been deleted successfully`,
  });
});


