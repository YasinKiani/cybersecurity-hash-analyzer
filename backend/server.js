const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const hashRoutes = require("./routes/hashRoutes");
const path = require("path");
const fs = require("fs");
const http = require("http");
const net = require("net");

const app = express();
let PORT = process.env.PORT || 5000;
const MAX_PORT_ATTEMPTS = 10;

// Create directories if they don't exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    console.log(`Creating directory: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Ensure all required directories exist
ensureDirectoryExists(path.join(__dirname, "routes"));
ensureDirectoryExists(path.join(__dirname, "controllers"));
ensureDirectoryExists(path.join(__dirname, "utils"));

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/hash", hashRoutes);

app.get("/", (req, res) => {
  res.send("Hash Visualization API - Designed by Yasin Kiani (یاسین کیانی)");
});

// Function to check if a port is in use
const isPortInUse = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", (err) => {
      if (err.code === "EADDRINUSE") {
        resolve(true); // Port is in use
      } else {
        resolve(false); // Some other error
      }
    });

    server.once("listening", () => {
      // Close the server if it's listening
      server.close(() => {
        resolve(false); // Port is free
      });
    });

    server.listen(port);
  });
};

// Function to find an available port
const findAvailablePort = async (startPort, maxAttempts) => {
  let port = startPort;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const inUse = await isPortInUse(port);
    if (!inUse) {
      return port;
    }
    console.log(`Port ${port} is already in use, trying next port...`);
    port++;
    attempts++;
  }

  throw new Error(
    `Could not find an available port after ${maxAttempts} attempts`
  );
};

// Start the server
(async () => {
  try {
    PORT = await findAvailablePort(PORT, MAX_PORT_ATTEMPTS);

    app.listen(PORT, () => {
      console.log(`\n========================================`);
      console.log(`Server running on port ${PORT}`);
      console.log(`API base URL: http://localhost:${PORT}`);
      console.log(`========================================`);
      console.log(`API endpoints:`);
      console.log(`- GET / - Root endpoint`);
      console.log(`- POST /api/hash/generate - Generate hash`);
      console.log(`- POST /api/hash/visual - Visualize hash`);
      console.log(`- POST /api/hash/crack - Crack password`);
      console.log(
        `\nIMPORTANT: Update the frontend config.js file to use port ${PORT}`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
})();

// Export the PORT for other modules
module.exports = { app, PORT };
