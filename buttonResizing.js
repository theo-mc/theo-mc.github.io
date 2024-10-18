function updateGrid() {
  const container = document.querySelector(".button-container");
  const grid = document.getElementById("button-grid-container");
  const buttons = document.querySelectorAll(".square-button");

  // Get available space (accounting for padding)
  const availableWidth = container.clientWidth - 80;
  const availableHeight = container.clientHeight - 80;

  // Try different layouts and calculate resulting button sizes
  const layouts = [
    { cols: 3, rows: 1 }, // Three in a row
    { cols: 2, rows: 2 }, // Two on top, one bottom
    { cols: 1, rows: 3 }, // One per row
  ];

  let maxButtonSize = 0;
  let bestLayout = layouts[0];

  layouts.forEach((layout) => {
    const buttonWidthForLayout =
      (availableWidth - (layout.cols - 1) * 10) / layout.cols;
    const buttonHeightForLayout =
      (availableHeight - (layout.rows - 1) * 10) / layout.rows;
    const buttonSize = Math.min(buttonWidthForLayout, buttonHeightForLayout);

    if (buttonSize > maxButtonSize) {
      maxButtonSize = buttonSize;
      bestLayout = layout;
    }
  });

  // Apply the best layout
  if (bestLayout.cols === 2 && bestLayout.rows === 2) {
    // Special handling for 2x2 layout with centered bottom button
    grid.style.gridTemplateColumns = `repeat(2, ${maxButtonSize}px)`;
    grid.style.gridTemplateRows = `${maxButtonSize}px ${maxButtonSize}px`;
    grid.style.justifyContent = "center";
    grid.style.alignContent = "center";

    // Style for the third button to center it
    buttons[2].style.marginLeft = `${(maxButtonSize + 10) / 2}px`; // Half of button size plus half of gap
  } else {
    // Regular layout
    grid.style.gridTemplateColumns = `repeat(${bestLayout.cols}, ${maxButtonSize}px)`;
    grid.style.gridTemplateRows = `repeat(${bestLayout.rows}, ${maxButtonSize}px)`;
    grid.style.justifyContent = "center";
    grid.style.alignContent = "center";

    // Reset any special styling
    buttons[2].style.marginLeft = "";
  }
}

// Run on load and resize
updateGrid();
window.addEventListener("resize", updateGrid);
