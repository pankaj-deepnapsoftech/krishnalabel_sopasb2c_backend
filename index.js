const express = require("express");
const cors = require("cors");
const { globalErrorHandler } = require("./middlewares/error");
const { connectDB } = require("./utils/connectDB");
const path = require("path")

const authRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const storeRoutes = require("./routes/store");
const agentRoutes = require("./routes/agent");
const userRoleRoutes = require("./routes/userRole");
const bomRoutes = require("./routes/bom");
const dashboardRoutes = require("./routes/dashboard");
const proformaInvoiceRoutes = require("./routes/proformaInvoice");
const invoiceRoutes = require("./routes/invoice");
const productionProcessRoutes = require("./routes/productionProcess");
const paymentRoutes = require("./routes/payment");
const scrapRoutes = require("./routes/scrap");
const PurchaseRoute = require("./routes/Purchases.routes");
const TrackProcess = require("./routes/TrackProcess.routes");
const GardRoutes = require("./routes/Gard.routes");
const CustomerRoutes = require("./routes/Customer.routes");
const AssinedRoutes = require("./routes/Assined.routes");
const NotificationRoutes = require("./routes/notification-route");
const http = require("http");

const app = express();
const { Server } = require('socket.io');
const servers = http.createServer(app);
// require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })

// DEVELOPMENT ENVIRONMENT
// require("dotenv").config({ path: `.env.development` });

// PRODUCTION ENVIRONMENT
require('dotenv').config({ path: `.env.production` });

const allowedOrigins = [
  // "http://localhost:3000",
  // "http://localhost:3001",
  // "http://localhost:5173",     
  "https://inventory.deepmart.shop",
  "https://rtpas.deepmart.shop",
  "https://sopasb2c.deepmart.shop",
  "https://sopas.krishnalabelsinc.com"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Authorization,Content-Type",
  preflightContinue: false,
  optionsSuccessStatus: 204,
  exposedHeaders: ["Content-Disposition"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.options("*", cors(corsOptions)); // Handle preflight
app.use('/images', express.static(path.join(__dirname, 'tmp', 'uploads')));
app.use("/api/auth", authRoutes);
app.use("/api/product", productRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/role", userRoleRoutes);
app.use("/api/bom", bomRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/proforma-invoice", proformaInvoiceRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api/production-process", productionProcessRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/scrap", scrapRoutes);
app.use("/api/purchase", PurchaseRoute);
app.use("/api/track", TrackProcess);
app.use("/api/gard", GardRoutes);
app.use("/api/customer", CustomerRoutes);
app.use("/api/assined", AssinedRoutes);
app.use("/api/notification", NotificationRoutes);

app.use(globalErrorHandler);

// Socket.IO Setup
const io = new Server(servers, {
  cors: {
    // origin: 'http://localhost:3000', // Your React frontend
    origin: allowedOrigins, // Your React frontend 
    methods: ['GET', 'POST'],
    credentials: true
  }
}); 


// Handle socket events in a separate file
require('./socket/socketHandler')(io);

servers.listen(process.env.PORT, () => {
  console.log(`Server is listening on Port: ${process.env.PORT}`);
  connectDB();
});
