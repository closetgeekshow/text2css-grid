/**
 * Parses layout and creates grid
 * @param {string} layout - ASCII layout string
 */
function createGrid(layout) {
  const lines = parseLayout(layout);
  const boxes = createBoxes(lines);
  renderGrid(boxes);
}

/**
 * Parses layout string into lines
 * @param {string} layout - ASCII layout string
 * @returns {Array} Parsed lines
 */
function parseLayout(layout) {
  return layout.split(/[\r\n]/)
    .map(line => parseLine(line))
    .filter(line => line.length);
}

/**
 * Parses a single line of the layout
 * @param {string} line - Single line of layout
 * @returns {Array} Parsed line data
 */
function parseLine(line) {
  return line.split('').map(char => {
    if (char === '+' || char === '-' || char === '|') return 0;
    return 1;
  });
}

/**
 * Creates box objects from parsed lines
 * @param {Array} lines - Parsed lines
 * @returns {Array} Box objects
 */
function createBoxes(lines) {
  const bgcolors = ["#f7a7a7", "#d0f7a7", "#f7d6a7", "#a7e2f7", "#e7bafb", "#fbbadc", "#def5d1", "#f7f1a7", "#b5fdd6", "#fb9387"];
  const boxes = [];
  let boxId = 1;

  for (let row = 0; row < lines.length; row++) {
    for (let col = 0; col < lines[row].length; col++) {
      if (lines[row][col] === 1 && !boxes.some(box => isInBox(box, row, col))) {
        const width = getWidth(lines, row, col);
        const height = getHeight(lines, row, col, width);
        boxes.push({
          row: row + 1,
          col: col + 1,
          wid: width,
          hgt: height,
          clr: bgcolors[(boxId - 1) % bgcolors.length]
        });
        boxId++;
      }
    }
  }

  return boxes;
}

function getWidth(lines, startRow, startCol) {
  let width = 0;
  while (startCol + width < lines[startRow].length && lines[startRow][startCol + width] === 1) {
    width++;
  }
  return width + 1; // Add 1 to include the border
}

function getHeight(lines, startRow, startCol, width) {
  let height = 0;
  while (startRow + height < lines.length &&
         lines[startRow + height].slice(startCol, startCol + width).every(cell => cell === 1)) {
    height++;
  }
  return height + 1; // Add 1 to include the border
}



/**
 * Checks if a point is inside an existing box
 * @param {Object} box - Box object
 * @param {number} row - Row to check
 * @param {number} col - Column to check
 * @returns {boolean} True if point is in box
 */
function isInBox(box, row, col) {
  return row + 1 >= box.row && row + 1 < box.row + box.hgt - 1 &&
         col + 1 >= box.col && col + 1 < box.col + box.wid - 1;
}

/**
 * Gets the width of a box
 * @param {Array} line - Line to check
 * @param {number} startCol - Starting column
 * @returns {number} Width of the box
 */
function getWidth(line, startCol) {
  let width = 0;
  while (startCol + width < line.length && line[startCol + width] === 1) {
    width++;
  }
  return width;
}

/**
 * Gets the height of a box
 * @param {Array} lines - All lines
 * @param {number} startRow - Starting row
 * @param {number} startCol - Starting column
 * @param {number} width - Width of the box
 * @returns {number} Height of the box
 */
function getHeight(lines, startRow, startCol, width) {
  let height = 0;
  while (startRow + height < lines.length &&
         lines[startRow + height].slice(startCol, startCol + width).every(cell => cell === 1)) {
    height++;
  }
  return height;
}

/**
 * Renders grid based on box objects
 * @param {Array} boxes - Box objects
 */
function renderGrid(boxes) {
  const nrows = Math.max(...boxes.map(b => b.row + b.hgt - 1));
  const ncols = Math.max(...boxes.map(b => b.col + b.wid - 1));
  const rows = `repeat(${nrows}, 1fr)`;
  const cols = `repeat(${ncols}, 1fr)`;

  document.documentElement.style.setProperty('--grid-rows', rows);
  document.documentElement.style.setProperty('--grid-cols', cols);
  document.documentElement.style.setProperty('--nrows', nrows);

  const css = generateCSS(boxes);
  applyCSS(css);

  boxes.forEach(function(b, i){
    $(`<div>${i + 1}</div>`)
      .attr('style', `--row: ${b.row}; --col: ${b.col}; --wid: ${b.wid}; --hgt: ${b.hgt}; --bg-color: ${b.clr};`)
      .appendTo('.grid');
  });  
}

/**
 * Generates CSS for boxes
 * @param {Array} boxes - Box objects
 * @returns {string} Generated CSS
 */
function generateCSS(boxes) {
  return boxes.map((box, i) => `
    .box-${i + 1} {
      grid-area: ${box.row} / ${box.col} / span ${box.hgt} / span ${box.wid};
      background-color: ${box.clr};
    }
  `).join('');
}

/**
 * Applies generated CSS to document
 * @param {string} css - Generated CSS
 */
function applyCSS(css) {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}

/**
 * Handles errors in grid creation process
 * @param {Error} error - Caught error
 */
function handleError(error) {
  console.error('Error creating grid:', error.message);
}

// Usage
const layout = `
+-----+-----+
|     A     |
+-----+-----+
|  B  |  C  |
+-----+-----+
`;

try {
  createGrid(layout);
} catch (error) {
  handleError(error);
}
