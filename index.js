require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const { info } = require("./src/config/logging");
const routes = require("./src/api/index");
const {connectMongoDB, connectPostgres, syncDatabase} = require("./src/database/index");
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(cors());


// Routes
app.use("/api", routes);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  connectPostgres();
  await syncDatabase()
  info(`Server running on port ${PORT}`);
});
