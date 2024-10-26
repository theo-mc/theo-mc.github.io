/**
 * Configuration object for the grid animation system
 * Controls the behavior and appearance of the animated letter grid
 */
const CONFIG = {
  // Characters that can appear in the grid cells
  LETTERS: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  // Percentage of total cells to update in each animation frame
  UPDATE_CELLS_PERCENT: 0.075,
  // Time interval between animation updates in milliseconds
  UPDATE_INTERVAL_MS: 200,
  // Duration that each cell remains visible before fading out
  CELL_LIFETIME_MS: 1000,
  // Minimum size of each grid cell in pixels
  MIN_CELL_SIZE_PX: 25,
  // Vertical position of the center merged cell as percentage
  CENTER_PERCENT_Y: 60,
  // Percentage of cells that should be filled initially
  INITIAL_FILLED_PERCENT: 20,
  // Random multiplier range for cell lifetime variation
  LIFETIME_MULTIPLIER: {
    MIN: 0.8,
    MAX: 1.2,
  },
};

// Minimum time between updates for the same cell (prevents rapid flickering)
const CELL_COOLDOWN_MS = CONFIG.CELL_LIFETIME_MS * 2;

/**
 * Class to manage the state of the grid animation
 * Keeps track of cells, timeouts, and update history
 */
class GridState {
  constructor() {
    this.cells = []; // Array of all grid cells
    this.totalCells = 0; // Total number of cells in the grid
    this.cellsToUpdate = 0; // Number of cells to update per animation frame
    this.lastUpdated = new Map(); // Tracks when each cell was last updated
    this.activeTimeouts = new Map(); // Stores timeouts for cell fade-outs
  }

  /**
   * Resets the grid state with new cells and clears existing timeouts
   * Called when the grid is recreated (e.g., on window resize)
   */
  reset() {
    this.cells = Array.from(document.getElementsByClassName("cell"));
    this.totalCells = this.cells.length;
    this.cellsToUpdate = Math.floor(
      this.totalCells * CONFIG.UPDATE_CELLS_PERCENT,
    );
    // Clear all existing animation timeouts
    this.activeTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.activeTimeouts.clear();
    this.lastUpdated.clear();
  }
}

// Global state instance for the grid
const gridState = new GridState();

/**
 * Calculates the horizontal center percentage based on viewport width
 * Provides responsive behavior for different screen sizes
 * @returns {number} The percentage width for the center merged cell
 */
function calculateCenterPercentX() {
  const width = window.innerWidth;
  if (width <= 400) return 100; // Full width on mobile
  if (width <= 800) return 80; // 80% width on tablets
  return 60; // 60% width on desktop
}

/**
 * Creates the initial grid structure and sets up the animation
 * This is the main initialization function for the grid
 */
function createGrid() {
  const container = document.getElementById("table-container");
  const { columns, rows } = calculateGridDimensions(container);
  const table = buildGridTable(columns, rows);

  container.innerHTML = "";
  container.appendChild(table);

  mergeCenterCells(table, calculateCenterPercentX(), CONFIG.CENTER_PERCENT_Y);
  gridState.reset();
  populateInitialCells();
}

/**
 * Calculates the number of rows and columns based on container size
 * @param {HTMLElement} container - The container element for the grid
 * @returns {Object} Object containing the number of columns and rows
 */
function calculateGridDimensions(container) {
  return {
    columns: Math.floor(
      container.clientWidth / (CONFIG.MIN_CELL_SIZE_PX * 0.75),
    ),
    rows: Math.floor(container.clientHeight / CONFIG.MIN_CELL_SIZE_PX),
  };
}

/**
 * Builds the HTML table structure for the grid
 * @param {number} columns - Number of columns in the grid
 * @param {number} rows - Number of rows in the grid
 * @returns {HTMLTableElement} The constructed table element
 */
function buildGridTable(columns, rows) {
  const table = document.createElement("table");
  const tbody = document.createElement("tbody");
  const fragment = document.createDocumentFragment();

  // Create grid cells using document fragment for better performance
  for (let i = 0; i < rows; i++) {
    const row = document.createElement("tr");
    for (let j = 0; j < columns; j++) {
      const cell = document.createElement("td");
      cell.className = "cell";
      row.appendChild(cell);
    }
    fragment.appendChild(row);
  }

  tbody.appendChild(fragment);
  table.appendChild(tbody);
  return table;
}

/**
 * Creates a merged cell in the center of the grid
 * @param {HTMLTableElement} table - The grid table element
 * @param {number} percentX - Horizontal size as percentage of grid width
 * @param {number} percentY - Vertical size as percentage of grid height
 */
function mergeCenterCells(table, percentX, percentY) {
  const dimensions = calculateMergeDimensions(table, percentX, percentY);
  removeMergedCells(table, dimensions);
  configureMergedCell(
    table.rows[dimensions.startRow].cells[dimensions.startCol],
    dimensions,
  );
}

/**
 * Calculates the dimensions and position of the merged center cell
 * @param {HTMLTableElement} table - The grid table element
 * @param {number} percentX - Horizontal size as percentage
 * @param {number} percentY - Vertical size as percentage
 * @returns {Object} Dimensions and position of the merged cell
 */
function calculateMergeDimensions(table, percentX, percentY) {
  const totalRows = table.rows.length;
  const totalCols = table.rows[0].cells.length;
  const mergeRows = Math.floor(totalRows * (percentY / 100));
  const mergeCols = Math.floor(totalCols * (percentX / 100));

  return {
    mergeRows,
    mergeCols,
    startRow: Math.floor((totalRows - mergeRows) / 2),
    startCol: Math.floor((totalCols - mergeCols) / 2),
  };
}

/**
 * Removes cells that will be replaced by the merged cell
 * @param {HTMLTableElement} table - The grid table element
 * @param {Object} dimensions - Dimensions and position of the merged cell
 */
function removeMergedCells(
  table,
  { startRow, startCol, mergeRows, mergeCols },
) {
  for (let i = startRow; i < startRow + mergeRows; i++) {
    for (
      let j = startCol + (i === startRow ? 1 : 0);
      j < startCol + mergeCols;
      j++
    ) {
      table.rows[i].deleteCell(startCol);
    }
  }
}

/**
 * Configures the merged cell with appropriate attributes and content
 * @param {HTMLTableCellElement} cell - The cell to be configured as merged
 * @param {Object} dimensions - Dimensions for the merged cell
 */
function configureMergedCell(cell, { mergeRows, mergeCols }) {
  cell.rowSpan = mergeRows;
  cell.colSpan = mergeCols;
  cell.classList.remove("cell");
  cell.id = "center-cell";
  cell.innerHTML = document.getElementById("container").innerHTML;
}

/**
 * Randomly populates initial cells in the grid
 * Creates a staggered effect by randomizing initial update times
 */
function populateInitialCells() {
  const cellsToFill = Math.floor(
    gridState.totalCells * (CONFIG.INITIAL_FILLED_PERCENT / 100),
  );
  const availableCells = new Set(gridState.cells);
  const currentTime = Date.now();

  for (let i = 0; i < cellsToFill && availableCells.size > 0; i++) {
    const cellsArray = Array.from(availableCells);
    const selectedCell =
      cellsArray[Math.floor(Math.random() * cellsArray.length)];

    updateCellWithTimeout(selectedCell);
    // Stagger initial update times to prevent synchronized updates
    gridState.lastUpdated.set(
      selectedCell,
      currentTime - Math.random() * CELL_COOLDOWN_MS,
    );
    availableCells.delete(selectedCell);
  }
}

/**
 * Generates a random lifetime duration for a cell
 * Adds variety to the animation by varying how long cells remain visible
 * @returns {number} Random lifetime duration in milliseconds
 */
function getRandomLifetime() {
  const { MIN, MAX } = CONFIG.LIFETIME_MULTIPLIER;
  return CONFIG.CELL_LIFETIME_MS * (MIN + Math.random() * (MAX - MIN));
}

/**
 * Updates a cell with new content and sets up its fade-out animation
 * @param {HTMLTableCellElement} cell - The cell to update
 */
function updateCellWithTimeout(cell) {
  // Clear any existing timeout for this cell
  const existingTimeout = gridState.activeTimeouts.get(cell);
  if (existingTimeout) clearTimeout(existingTimeout);

  // Update cell content and visibility
  const randomIndex = Math.floor(Math.random() * CONFIG.LETTERS.length);
  cell.textContent = CONFIG.LETTERS[randomIndex];
  cell.style.opacity = "1";

  // Set fade-out timeout with random duration
  const timeout = setTimeout(() => {
    cell.style.opacity = "0";
    gridState.activeTimeouts.delete(cell);
  }, getRandomLifetime());

  gridState.activeTimeouts.set(cell, timeout);
}

/**
 * Main animation function that updates random cells in the grid
 * Runs at regular intervals to create the animation effect
 */
function animateGrid() {
  const updatedCells = new Set();
  let attempts = 0;

  // Try to update the target number of cells
  while (
    updatedCells.size < gridState.cellsToUpdate &&
    attempts < gridState.totalCells
  ) {
    const cell =
      gridState.cells[Math.floor(Math.random() * gridState.totalCells)];
    const lastUpdate = gridState.lastUpdated.get(cell);

    // Only update cells that haven't been updated recently
    if (
      (!lastUpdate || Date.now() - lastUpdate >= CELL_COOLDOWN_MS) &&
      !updatedCells.has(cell)
    ) {
      updateCellWithTimeout(cell);
      updatedCells.add(cell);
      gridState.lastUpdated.set(cell, Date.now());
    }

    attempts++;
  }
}

// Initialize the grid and set up event listeners
createGrid();
window.addEventListener("resize", createGrid);
setInterval(animateGrid, CONFIG.UPDATE_INTERVAL_MS);
