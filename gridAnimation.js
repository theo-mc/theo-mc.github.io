const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const UPDATE_CELLS_PERCENT = 0.075;
const UPDATE_INTERVAL = 200;
const CELL_LIFETIME = 1000;
const MIN_CELL_SIZE = 25;
const CELL_COOLDOWN = CELL_LIFETIME * 2; // Minimum time (in ms) between cell updates
let cellsArray, totalCells, cellsToUpdate;
let cellLastUpdated = new Map(); // Track when each cell was last updated

// Make CENTER_PERCENT_X responsive based on screen width
function getCenterPercentX() {
  const width = window.innerWidth;
  if (width <= 400) return 100;
  if (width <= 800) return 80;
  return 60;
}

let CENTER_PERCENT_X = getCenterPercentX();
const CENTER_PERCENT_Y = 60;

function createTable() {
  const container = document.getElementById("table-container");
  const totalWidth = container.clientWidth;
  const totalHeight = container.clientHeight;
  const columns = Math.floor(totalWidth / (MIN_CELL_SIZE * 0.75));
  const rows = Math.floor(totalHeight / MIN_CELL_SIZE);

  const table = document.createElement("table");
  const tbody = document.createElement("tbody");
  const fragment = document.createDocumentFragment();

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
  container.innerHTML = "";
  container.appendChild(table);

  // Update CENTER_PERCENT_X before merging cells
  CENTER_PERCENT_X = getCenterPercentX();
  mergeCenterCells(table, CENTER_PERCENT_X, CENTER_PERCENT_Y);

  cellsArray = Array.from(document.getElementsByClassName("cell"));
  totalCells = cellsArray.length;
  cellsToUpdate = Math.floor(totalCells * UPDATE_CELLS_PERCENT);

  // Reset the cellLastUpdated Map when creating a new table
  cellLastUpdated.clear();
}

function mergeCenterCells(table, percentX, percentY) {
  const rows = table.rows;
  const totalRows = rows.length;
  const totalCols = rows[0].cells.length;
  const mergeRows = Math.floor(totalRows * (percentY / 100));
  const mergeCols = Math.floor(totalCols * (percentX / 100));
  const startRow = Math.floor((totalRows - mergeRows) / 2);
  const startCol = Math.floor((totalCols - mergeCols) / 2);

  for (let i = startRow; i < startRow + mergeRows; i++) {
    for (
      let j = startCol + (i === startRow ? 1 : 0);
      j < startCol + mergeCols;
      j++
    ) {
      rows[i].deleteCell(startCol);
    }
  }

  const mergedCell = rows[startRow].cells[startCol];
  mergedCell.rowSpan = mergeRows;
  mergedCell.colSpan = mergeCols;
  mergedCell.classList.remove("cell");
  mergedCell.id = "center-cell";
  const contentToMerge = document.getElementById("container");
  mergedCell.innerHTML = contentToMerge.innerHTML;
}

function canUpdateCell(cell) {
  const lastUpdate = cellLastUpdated.get(cell);
  const currentTime = Date.now();
  return !lastUpdate || currentTime - lastUpdate >= CELL_COOLDOWN;
}

function animateGrid() {
  const updatedCells = new Set();
  let attempts = 0;
  const maxAttempts = totalCells; // Prevent infinite loop

  while (updatedCells.size < cellsToUpdate && attempts < maxAttempts) {
    const index = Math.floor(Math.random() * totalCells);
    const cell = cellsArray[index];

    if (canUpdateCell(cell) && !updatedCells.has(cell)) {
      cell.textContent = letters[Math.floor(Math.random() * letters.length)];
      cell.style.opacity = "1";
      updatedCells.add(cell);
      cellLastUpdated.set(cell, Date.now());
    }

    attempts++;
  }

  setTimeout(() => {
    updatedCells.forEach((cell) => {
      cell.style.opacity = "0";
    });
  }, CELL_LIFETIME);
}

createTable();

window.addEventListener("resize", () => {
  createTable();
});

setInterval(() => {
  animateGrid();
}, UPDATE_INTERVAL);
