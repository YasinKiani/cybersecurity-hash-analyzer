const crypto = require("crypto");
const visualHash = require("../utils/visualHash");
const passwordCracker = require("../utils/passwordCracker");

// Generate hash for various algorithms
exports.generateHash = (req, res) => {
  try {
    const { text, algorithm } = req.body;

    if (!text || !algorithm) {
      return res.status(400).json({
        success: false,
        message: "Text and algorithm are required",
      });
    }

    // Validate algorithm to prevent security issues
    const validAlgorithms = ["md5", "sha1", "sha256", "sha512"];
    if (!validAlgorithms.includes(algorithm.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid algorithm. Supported algorithms are: ${validAlgorithms.join(
          ", "
        )}`,
      });
    }

    // Generate the hash
    const hash = crypto
      .createHash(algorithm.toLowerCase())
      .update(text)
      .digest("hex");

    return res.status(200).json({
      success: true,
      data: {
        originalText: text,
        algorithm,
        hash,
      },
    });
  } catch (error) {
    console.error("Error in generateHash:", error);
    return res.status(500).json({
      success: false,
      message: "Error generating hash",
      error: error.message,
    });
  }
};

// Generate visual representation of hash
exports.visualizeHash = (req, res) => {
  try {
    const { hash } = req.body;

    if (!hash) {
      return res.status(400).json({
        success: false,
        message: "Hash is required",
      });
    }

    const visualData = visualHash.generateVisualHash(hash);

    return res.status(200).json({
      success: true,
      data: visualData,
    });
  } catch (error) {
    console.error("Error in visualizeHash:", error);
    return res.status(500).json({
      success: false,
      message: "Error visualizing hash",
      error: error.message,
    });
  }
};

// Simulate password cracking
exports.crackPassword = (req, res) => {
  try {
    const { hash, algorithm, method } = req.body;

    if (!hash || !algorithm || !method) {
      return res.status(400).json({
        success: false,
        message: "Hash, algorithm, and method are required",
      });
    }

    const validMethods = [
      "dictionary",
      "bruteforce",
      "pattern",
      "hybrid",
      "rainbow",
    ];
    if (!validMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        message: `Invalid method. Supported methods are: ${validMethods.join(
          ", "
        )}`,
      });
    }

    const result = passwordCracker.crackPassword(hash, algorithm, method);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in crackPassword:", error);
    return res.status(500).json({
      success: false,
      message: "Error cracking password",
      error: error.message,
    });
  }
};

// Get time estimates for cracking passwords of different complexities
exports.getTimeEstimates = (req, res) => {
  try {
    const { algorithm } = req.body;

    if (!algorithm) {
      return res.status(400).json({
        success: false,
        message: "Algorithm is required",
      });
    }

    const complexities = ["low", "medium", "high", "very-high", "persian"];
    const estimates = {};

    for (const complexity of complexities) {
      estimates[complexity] = passwordCracker.getTimeEstimate(
        algorithm,
        complexity
      );
    }

    return res.status(200).json({
      success: true,
      data: estimates,
    });
  } catch (error) {
    console.error("خطا در محاسبه تخمین زمان:", error);
    return res.status(500).json({
      success: false,
      message: "Error calculating time estimates",
      error: error.message,
    });
  }
};

// Generate sample password
exports.generateSamplePassword = (req, res) => {
  try {
    const { complexity } = req.body;

    if (!complexity) {
      return res.status(400).json({
        success: false,
        message: "Complexity is required",
      });
    }

    const password = passwordCracker.generateSamplePassword(complexity);
    const hash = crypto.createHash("md5").update(password).digest("hex");

    return res.status(200).json({
      success: true,
      data: {
        password,
        hash,
        complexity,
      },
    });
  } catch (error) {
    console.error("خطا در تولید رمز عبور نمونه:", error);
    return res.status(500).json({
      success: false,
      message: "Error generating sample password",
      error: error.message,
    });
  }
};
