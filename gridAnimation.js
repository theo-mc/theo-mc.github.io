const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const UPDATE_CELLS_PERCENT = 0.1;
const UPDATE_INTERVAL = 100;
const CELL_LIFETIME = 500;
const MIN_CELL_SIZE = 25;
let cellsArray, totalCells, cellsToUpdate;

const CENTER_PERCENT_X = 50;
const CENTER_PERCENT_Y = 50;

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

  mergeCenterCells(table, CENTER_PERCENT_X, CENTER_PERCENT_Y);

  cellsArray = Array.from(document.getElementsByClassName("cell"));
  totalCells = cellsArray.length;
  cellsToUpdate = Math.floor(totalCells * UPDATE_CELLS_PERCENT);
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
  mergedCell.id = "center-content";
  const contentToMerge = document.getElementById("center-container");
  mergedCell.innerHTML = contentToMerge.innerHTML;
}

function animateGrid() {
  const updatedCells = new Set();
  for (let i = 0; i < cellsToUpdate; i++) {
    const index = Math.floor(Math.random() * totalCells);
    const cell = cellsArray[index];
    cell.textContent = letters[Math.floor(Math.random() * letters.length)];
    cell.style.opacity = "1";
    updatedCells.add(cell);
  }

  setTimeout(() => {
    updatedCells.forEach((cell) => {
      cell.style.opacity = "0";
    });
  }, CELL_LIFETIME);
}

createTable();

window.addEventListener("resize", () => {
  console.log("10");
  createTable();
});

setInterval(() => {
  animateGrid();
}, UPDATE_INTERVAL);
