/**
 * Utility for generating visual representations of hash values
 * Designed by Yasin Kiani (یاسین کیانی)
 */

// Generate grid-based visualization data from hash
exports.generateVisualHash = (hash) => {
  // Use the hash to generate a color matrix (8x8 grid)
  const gridSize = 8;
  const colors = [];

  // Process hash in chunks of 6 characters (for hex colors)
  for (let i = 0; i < Math.min(hash.length, gridSize * gridSize * 6); i += 6) {
    // Get 6 characters from hash or pad if needed
    const chunk = hash.substring(i, i + 6).padEnd(6, "0");
    // Create a color from these 6 hex characters
    colors.push("#" + chunk);

    if (colors.length >= gridSize * gridSize) {
      break;
    }
  }

  // Fill the rest with random colors if hash isn't long enough
  while (colors.length < gridSize * gridSize) {
    const randomColor =
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0");
    colors.push(randomColor);
  }

  return {
    gridSize,
    colors,
    hash,
  };
};

// Generate identicon-style hash visualization
exports.generateIdenticon = (hash) => {
  // Create a symmetric 5x5 pattern based on hash
  const size = 5;
  const grid = Array(size)
    .fill()
    .map(() => Array(size).fill(false));

  // Use first 15 characters of hash (representing 15 bits)
  for (let i = 0; i < Math.min(hash.length, 15); i++) {
    const value = parseInt(hash.charAt(i), 16) % 2 === 1;
    const row = Math.floor(i / 3);
    const col = i % 3;

    if (row < size && col < Math.ceil(size / 2)) {
      grid[row][col] = value;
      // Mirror to create symmetry
      grid[row][size - col - 1] = value;
    }
  }

  // Generate background color from hash
  const bgcolor = "#" + hash.substring(0, 6);

  return {
    grid,
    size,
    bgcolor,
    hash,
  };
};
