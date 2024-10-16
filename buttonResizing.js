// Layout configurations
const LAYOUTS = [
  { cols: 3, rows: 1, name: "horizontal" }, // Three in a row
  { cols: 2, rows: 2, name: "grid" }, // Two on top, one bottom
  { cols: 1, rows: 3, name: "vertical" }, // One per row
];

// Constants for spacing
const PADDING = 80;
const GAP = 10;

function getAvailableSpace(container) {
  return {
    width: container.clientWidth - PADDING,
    height: container.clientHeight - PADDING,
  };
}

function calculateButtonSizeForLayout(layout, availableSpace) {
  const { width, height } = availableSpace;

  const buttonWidth = (width - (layout.cols - 1) * GAP) / layout.cols;
  const buttonHeight = (height - (layout.rows - 1) * GAP) / layout.rows;

  return Math.min(buttonWidth, buttonHeight);
}

function findBestLayout(availableSpace) {
  return LAYOUTS.reduce(
    (best, layout) => {
      const buttonSize = calculateButtonSizeForLayout(layout, availableSpace);

      if (buttonSize > best.buttonSize) {
        return { layout, buttonSize };
      }
      return best;
    },
    { layout: LAYOUTS[0], buttonSize: 0 },
  );
}

function applyGridLayout(grid, buttons, buttonSize) {
  grid.style.gridTemplateColumns = `repeat(2, ${buttonSize}px)`;
  grid.style.gridTemplateRows = `${buttonSize}px ${buttonSize}px`;
  grid.style.justifyContent = "center";
  grid.style.alignContent = "center";
  grid.style.gap = `${GAP}px`;

  // Center the third button
  buttons[2].style.gridColumn = "1 / span 2";
  buttons[2].style.justifySelf = "center";
}

function applyRegularLayout(grid, layout, buttonSize) {
  grid.style.gridTemplateColumns = `repeat(${layout.cols}, ${buttonSize}px)`;
  grid.style.gridTemplateRows = `repeat(${layout.rows}, ${buttonSize}px)`;
  grid.style.justifyContent = "center";
  grid.style.alignContent = "center";
  grid.style.gap = `${GAP}px`;
}

function setButtonSizes(buttons, buttonSize) {
  buttons.forEach((button) => {
    button.style.width = `${buttonSize}px`;
    button.style.height = `${buttonSize}px`;
  });
}

function resetButtonStyles(buttons) {
  buttons[2].style.gridColumn = "";
  buttons[2].style.justifySelf = "";
}

function updateGrid() {
  // Get DOM elements
  const container = document.querySelector(".button-container");
  const grid = document.getElementById("button-grid-container");
  const buttons = document.querySelectorAll(".square-button");

  // Calculate available space and find best layout
  const availableSpace = getAvailableSpace(container);
  const { layout, buttonSize } = findBestLayout(availableSpace);

  // Set consistent button sizes
  setButtonSizes(buttons, buttonSize);

  // Apply appropriate layout
  if (layout.name === "grid") {
    applyGridLayout(grid, buttons, buttonSize);
  } else {
    applyRegularLayout(grid, layout, buttonSize);
    resetButtonStyles(buttons);
  }
}

// Initialize and set up event listeners
window.addEventListener("resize", updateGrid);
updateGrid();
