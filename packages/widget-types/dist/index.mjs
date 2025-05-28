// src/index.js
var WIDGET_TYPES = {
  TEXT_WIDGET: {
    name: "Text widget",
    value: "text"
  },
  BAR_CHART: {
    name: "Bar Chart",
    value: "bar"
  },
  LINE_CHART: {
    name: "Line Chart",
    value: "line"
  },
  PIE_CHART: {
    name: "Pie Chart",
    value: "pie"
  },
  SCATTER_CHART: {
    name: "Scatter Chart",
    value: "scatter"
  },
  BUBBLE_CHART: {
    name: "Bubble Chart",
    value: "bubble"
  },
  RADAR_CHART: {
    name: "Radar Chart",
    value: "radar"
  },
  POLAR_AREA: {
    name: "Polar Area Chart",
    value: "polarArea"
  },
  TABLE_WIDGET: {
    name: "Table Widget",
    value: "table"
  }
};
var WIDGET_INITIAL_CONFIG = {
  text: {
    options: {
      backgroundColor: "rgba(255, 255, 255, 0)",
      color: "#666",
      plugins: {
        title: {
          display: false,
          text: "Chart Title",
          position: "top",
          font: { size: 16, color: "#333" }
        },
        legend: {
          display: false,
          position: "top",
          labels: { font: { size: 12, color: "#666" } }
        },
        tooltip: {
          enabled: false
        }
      }
    }
  },
  bar: {
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Bar Chart Example"
        },
        legend: {
          display: true,
          position: "top"
        },
        tooltip: {
          enabled: true
        }
      },
      scales: {
        x: {
          // Category axis
          beginAtZero: true
          // Example: Start the x-axis at zero
        },
        y: {
          // Linear axis
          beginAtZero: true
          // Example: Start the y-axis at zero
        }
      }
    }
  },
  line: {
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Line Chart Example"
        },
        legend: {
          display: true,
          position: "top"
        },
        tooltip: {
          enabled: true
        }
      },
      scales: {
        x: {
          // Often a category or time axis
          type: "category",
          // Or 'time'
          title: {
            display: true,
            text: "Category"
            // Or 'Date'
          }
        },
        y: {
          // Linear axis
          beginAtZero: true,
          title: {
            display: true,
            text: "Value"
          }
        }
      },
      elements: {
        line: {
          tension: 0.4
          // Example: Add some curve to the line
        },
        point: {
          radius: 3
          // Example: Set the radius of data points
        }
      }
    }
  },
  pie: {
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Pie Chart Example"
        },
        legend: {
          display: true,
          position: "right"
          // Example: Place legend on the right
        },
        tooltip: {
          enabled: true
        }
      }
    }
  },
  scatter: {
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Scatter Chart Example"
        },
        legend: {
          display: true,
          position: "top"
        },
        tooltip: {
          enabled: true
        }
      },
      scales: {
        x: {
          // Linear axis is common for scatter plots
          type: "linear",
          position: "bottom",
          title: {
            display: true,
            text: "X Value"
          }
        },
        y: {
          // Linear axis
          type: "linear",
          title: {
            display: true,
            text: "Y Value"
          }
        }
      }
    }
  },
  bubble: {
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Bubble Chart Example"
        },
        legend: {
          display: true,
          position: "top"
        },
        tooltip: {
          enabled: true
        }
      },
      scales: {
        x: {
          // Linear axis
          beginAtZero: true,
          title: {
            display: true,
            text: "X Value"
          }
        },
        y: {
          // Linear axis
          beginAtZero: true,
          title: {
            display: true,
            text: "Y Value"
          }
        }
      }
    }
  },
  radar: {
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Radar Chart Example"
        },
        legend: {
          display: true,
          position: "top"
        },
        tooltip: {
          enabled: true
        }
      },
      scales: {
        r: {
          // Radial axis
          beginAtZero: true,
          angleLines: {
            display: true
            // Example: Display lines radiating from the center
          },
          pointLabels: {
            display: true
            // Example: Display labels for each spoke
          },
          suggestedMin: 0,
          // Example: Set a suggested minimum value
          suggestedMax: 100
          // Example: Set a suggested maximum value
        }
      },
      elements: {
        line: {
          tension: 0
          // Example: Straight lines between points
        },
        point: {
          radius: 3
        }
      }
    }
  },
  polarArea: {
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Polar Area Chart Example"
        },
        legend: {
          display: true,
          position: "right"
        },
        tooltip: {
          enabled: true
        }
      },
      scales: {
        r: {
          // Radial axis
          beginAtZero: true,
          pointLabels: {
            display: true
            // Example: Display labels around the chart
          }
        }
      },
      elements: {
        arc: {
          borderColor: "#fff",
          // Example: White border between segments
          borderWidth: 2
        }
      }
    }
  },
  table: {
    options: {
      titleEnabled: false,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Table Example"
        },
        legend: {
          display: false
        },
        tooltip: {
          enabled: false
        }
      }
    }
  }
};
var WIDGET_ADVANCED_OPTIONS = [
  {
    name: "Title",
    key: "widgetConfig.title",
    type: "text",
    description: "Widget title",
    relevantWidgets: ["text", "table"],
  },
  {
    name: "Title enabled",
    key: "widgetConfig.titleEnabled",
    type: "boolean",
    description: "Enable or disable the widget title",
    relevantWidgets: ["text", "table"],
    defaultValue: true,
  },
  {
    name: "Title CSS Class",
    key: "widgetConfig.titleTailwindCss",
    type: "text",
    description: "Tailwind CSS classes for the title",
    relevantWidgets: ["text", "table"],
  },
  {
    name: "Container CSS Class",
    key: "widgetConfig.containerTailwindCss",
    type: "text",
    description: "Tailwind CSS classes for the container",
    relevantWidgets: ["text", "table"],
  },
  {
    name: "Widget CSS Class",
    key: "widgetConfig.widgetTailwindCss",
    type: "text",
    description: "Tailwind CSS classes for the widget",
    relevantWidgets: ["text", "table"],
  },
  {
    name: "Container Width",
    key: "widgetConfig.containerCss.width",
    type: "text",
    description: "Custom width for container (e.g., 100%, 200px)",
    relevantWidgets: ["text"],
  },
  {
    name: "Container Height",
    key: "widgetConfig.containerCss.height",
    type: "text",
    description: "Custom height for container (e.g., 100%, 200px)",
    relevantWidgets: ["text"],
  },
  {
    name: "Container Padding",
    key: "widgetConfig.containerCss.padding",
    type: "text",
    description: "Custom padding for container (e.g., 10px, 1rem)",
    relevantWidgets: ["text"],
  },
  {
    name: "Widget Width",
    key: "widgetConfig.widgetCss.width",
    type: "text",
    description: "Custom width for widget (e.g., 100%, 200px)",
    relevantWidgets: ["text"],
  },
  {
    name: "Widget Height",
    key: "widgetConfig.widgetCss.height",
    type: "text",
    description: "Custom height for widget (e.g., 100%, 200px)",
    relevantWidgets: ["text"],
  },
  {
    name: "Widget Padding",
    key: "widgetConfig.widgetCss.padding",
    type: "text",
    description: "Custom padding for widget (e.g., 10px, 1rem)",
    relevantWidgets: ["text"],
  },
  {
    name: "Font Family",
    key: "widgetConfig.widgetCss.fontFamily",
    type: "select",
    description: "Font family for the widget text",
    options: [
      "system-ui",
      "Arial",
      "Helvetica",
      "Times New Roman",
      "Georgia",
      "Courier New",
      "monospace",
      "sans-serif",
      "serif",
    ],
    relevantWidgets: ["text"],
  },
  {
    name: "Font Size",
    key: "widgetConfig.widgetCss.fontSize",
    type: "text",
    description: "Font size (e.g., 16px, 1.2rem)",
    relevantWidgets: ["text"],
  },
  {
    name: "Font Weight",
    key: "widgetConfig.widgetCss.fontWeight",
    type: "select",
    description: "Font weight for the text",
    options: [
      "normal",
      "bold",
      "100",
      "200",
      "300",
      "400",
      "500",
      "600",
      "700",
      "800",
      "900",
    ],
    relevantWidgets: ["text"],
  },
  {
    name: "Font Style",
    key: "widgetConfig.widgetCss.fontStyle",
    type: "select",
    description: "Font style for the text",
    options: ["normal", "italic", "oblique"],
    relevantWidgets: ["text"],
  },
  {
    name: "Text Decoration",
    key: "widgetConfig.widgetCss.textDecoration",
    type: "select",
    description: "Text decoration style",
    options: ["none", "underline", "overline", "line-through"],
    relevantWidgets: ["text"],
  },
  {
    name: "Text Transform",
    key: "widgetConfig.widgetCss.textTransform",
    type: "select",
    description: "Text transformation",
    options: ["none", "uppercase", "lowercase", "capitalize"],
    relevantWidgets: ["text"],
  },
  {
    name: "Letter Spacing",
    key: "widgetConfig.widgetCss.letterSpacing",
    type: "text",
    description: "Space between letters (e.g., 1px, 0.1em)",
    relevantWidgets: ["text"],
  },
  {
    name: "Word Spacing",
    key: "widgetConfig.widgetCss.wordSpacing",
    type: "text",
    description: "Space between words (e.g., 2px, 0.2em)",
    relevantWidgets: ["text"],
  },
  {
    name: "Line Height",
    key: "widgetConfig.widgetCss.lineHeight",
    type: "text",
    description: "Line height (e.g., 1.5, 24px)",
    relevantWidgets: ["text"],
  },
  {
    name: "Text Align",
    key: "widgetConfig.widgetCss.textAlign",
    type: "select",
    description: "Text alignment",
    options: ["left", "center", "right", "justify"],
    relevantWidgets: ["text"],
  },
  {
    name: "Text Color",
    key: "widgetConfig.widgetCss.color",
    type: "color",
    description: "Text color",
    relevantWidgets: ["text"],
  },
  {
    name: "Background Color",
    key: "widgetConfig.widgetCss.backgroundColor",
    type: "color",
    description: "Background color",
    relevantWidgets: ["text"],
  },
  {
    name: "Background Opacity",
    key: "widgetConfig.widgetCss.opacity",
    type: "text",
    description: "Background opacity (0-1)",
    relevantWidgets: ["text"],
  },
  {
    name: "Border Style",
    key: "widgetConfig.widgetCss.borderStyle",
    type: "select",
    description: "Border style",
    options: ["none", "solid", "dashed", "dotted", "double", "groove", "ridge"],
    relevantWidgets: ["text"],
  },
  {
    name: "Border Width",
    key: "widgetConfig.widgetCss.borderWidth",
    type: "text",
    description: "Border width (e.g., 1px, 2px)",
    relevantWidgets: ["text"],
  },
  {
    name: "Border Color",
    key: "widgetConfig.widgetCss.borderColor",
    type: "color",
    description: "Border color",
    relevantWidgets: ["text"],
  },
  {
    name: "Border Radius",
    key: "widgetConfig.widgetCss.borderRadius",
    type: "text",
    description: "Border radius (e.g., 4px, 0.5rem)",
    relevantWidgets: ["text"],
  },
  {
    name: "Box Shadow",
    key: "widgetConfig.widgetCss.boxShadow",
    type: "text",
    description: "Box shadow (e.g., 0 2px 4px rgba(0,0,0,0.1))",
    relevantWidgets: ["text"],
  },
  {
    name: "Text Shadow",
    key: "widgetConfig.widgetCss.textShadow",
    type: "text",
    description: "Text shadow (e.g., 1px 1px 2px rgba(0,0,0,0.5))",
    relevantWidgets: ["text"],
  },
  {
    name: "Backdrop Filter",
    key: "widgetConfig.widgetCss.backdropFilter",
    type: "text",
    description: "Backdrop filter (e.g., blur(5px))",
    relevantWidgets: ["text"],
  },
  {
    name: "Margin",
    key: "widgetConfig.widgetCss.margin",
    type: "text",
    description: "Outer spacing (e.g., 10px, 1rem)",
    relevantWidgets: ["text"],
  },
  {
    name: "Min Width",
    key: "widgetConfig.widgetCss.minWidth",
    type: "text",
    description: "Minimum width (e.g., 100px)",
    relevantWidgets: ["text"],
  },
  {
    name: "Max Width",
    key: "widgetConfig.widgetCss.maxWidth",
    type: "text",
    description: "Maximum width (e.g., 500px)",
    relevantWidgets: ["text"],
  },
  {
    name: "Min Height",
    key: "widgetConfig.widgetCss.minHeight",
    type: "text",
    description: "Minimum height (e.g., 50px)",
    relevantWidgets: ["text"],
  },
  {
    name: "Max Height",
    key: "widgetConfig.widgetCss.maxHeight",
    type: "text",
    description: "Maximum height (e.g., 300px)",
    relevantWidgets: ["text"],
  },
  {
    name: "Overflow",
    key: "widgetConfig.widgetCss.overflow",
    type: "select",
    description: "Content overflow behavior",
    options: ["visible", "hidden", "scroll", "auto"],
    relevantWidgets: ["text"],
  },
  {
    name: "Transform",
    key: "widgetConfig.widgetCss.transform",
    type: "text",
    description: "Transform (e.g., rotate(45deg), scale(1.1))",
    relevantWidgets: ["text"],
  },
  {
    name: "Transition",
    key: "widgetConfig.widgetCss.transition",
    type: "text",
    description: "Transition effects (e.g., all 0.3s ease)",
    relevantWidgets: ["text"],
  },
  {
    name: "Chart background color",
    key: "widgetConfig.chartBackgroundColor",
    type: "color",
    description: "Background color",
    relevantWidgets: [
      "bar",
      "line",
      "pie",
      "scatter",
      "bubble",
      "radar",
      "polarArea",
    ],
  },
];
var WIDGET_DATASET_ADVANCED_OPTIONS = [
  {
    name: "Hidden",
    key: "hidden",
    type: "boolean",
    description: "If true, the dataset is hidden",
    relevantWidgets: [
      "bar",
      "line",
      "pie",
      "scatter",
      "bubble",
      "radar",
      "polarArea"
    ]
  },
  {
    name: "Order",
    key: "order",
    type: "number",
    description: "The drawing order of this dataset",
    relevantWidgets: [
      "bar",
      "line",
      "pie",
      "scatter",
      "bubble",
      "radar",
      "polarArea"
    ]
  },
  {
    name: "Clip Elements",
    key: "clip",
    type: "boolean",
    description: "Clip dataset elements to the chart area",
    relevantWidgets: [
      "bar",
      "line",
      "pie",
      "scatter",
      "bubble",
      "radar",
      "polarArea"
    ]
  },
  // Element Configuration (Relevant to all standard charts)
  {
    name: "Background Color",
    key: "backgroundColor",
    type: "color",
    description: "The fill color of the element",
    relevantWidgets: [
      "bar",
      "line",
      "pie",
      "scatter",
      "bubble",
      "radar",
      "polarArea"
    ]
  },
  {
    name: "Border Color",
    key: "borderColor",
    type: "color",
    description: "The border color of the element",
    relevantWidgets: [
      "bar",
      "line",
      "pie",
      "scatter",
      "bubble",
      "radar",
      "polarArea"
    ]
  },
  {
    name: "Border Width",
    key: "borderWidth",
    type: "number",
    description: "The border width of the element",
    relevantWidgets: [
      "bar",
      "line",
      "pie",
      "scatter",
      "bubble",
      "radar",
      "polarArea"
    ]
  },
  {
    name: "Border Dash",
    key: "borderDash",
    type: "text",
    description: "The border dash pattern (comma-separated numbers)",
    relevantWidgets: [
      "bar",
      "line",
      "pie",
      "scatter",
      "bubble",
      "radar",
      "polarArea"
    ]
  },
  {
    name: "Border Dash Offset",
    key: "borderDashOffset",
    type: "number",
    description: "The border dash offset",
    relevantWidgets: [
      "bar",
      "line",
      "pie",
      "scatter",
      "bubble",
      "radar",
      "polarArea"
    ]
  },
  {
    name: "Border Radius",
    key: "borderRadius",
    type: "number",
    description: "The border radius of the element",
    relevantWidgets: [
      "bar",
      "line",
      "pie",
      "scatter",
      "bubble",
      "radar",
      "polarArea"
    ]
  },
  {
    name: "Hover Background Color",
    key: "hoverBackgroundColor",
    type: "color",
    description: "The background color of the element when hovered",
    relevantWidgets: [
      "bar",
      "line",
      "pie",
      "scatter",
      "bubble",
      "radar",
      "polarArea"
    ]
  },
  {
    name: "Hover Border Color",
    key: "hoverBorderColor",
    type: "color",
    description: "The border color of the element when hovered",
    relevantWidgets: [
      "bar",
      "line",
      "pie",
      "scatter",
      "bubble",
      "radar",
      "polarArea"
    ]
  },
  {
    name: "Hover Border Width",
    key: "hoverBorderWidth",
    type: "number",
    description: "The border width of the element when hovered",
    relevantWidgets: [
      "bar",
      "line",
      "pie",
      "scatter",
      "bubble",
      "radar",
      "polarArea"
    ]
  },
  // Line Chart Specific Configurations
  {
    name: "Line Tension",
    key: "line.tension",
    type: "number",
    description: "Bezier curve tension of the line (0 for straight lines)",
    relevantWidgets: ["line"]
  },
  {
    name: "Stepped Line",
    key: "line.stepped",
    type: "boolean",
    description: "Draws a stepped line",
    relevantWidgets: ["line"]
  },
  {
    name: "Point Radius",
    key: "line.pointRadius",
    type: "number",
    description: "Radius of points on the line",
    relevantWidgets: ["line"]
  },
  {
    name: "Point Style",
    key: "line.pointStyle",
    type: "select",
    description: "Style of points on the line",
    options: [
      "circle",
      "cross",
      "dash",
      "line",
      "rect",
      "rectRounded",
      "rectRot",
      "star",
      "triangle"
    ],
    relevantWidgets: ["line", "scatter", "bubble", "radar"]
    // Point style is relevant to several point-based charts
  },
  {
    name: "Point Background Color",
    key: "line.pointBackgroundColor",
    type: "color",
    description: "Background color of points on the line",
    relevantWidgets: ["line", "scatter", "bubble", "radar"]
  },
  {
    name: "Point Border Color",
    key: "line.pointBorderColor",
    type: "color",
    description: "Border color of points on the line",
    relevantWidgets: ["line", "scatter", "bubble", "radar"]
  },
  {
    name: "Point Border Width",
    key: "line.pointBorderWidth",
    type: "number",
    description: "Border width of points on the line",
    relevantWidgets: ["line", "scatter", "bubble", "radar"]
  },
  {
    name: "Point Hit Radius",
    key: "line.pointHitRadius",
    type: "number",
    description: "Increase/decrease point hit area",
    relevantWidgets: ["line", "scatter", "bubble", "radar"]
  },
  {
    name: "Point Hover Radius",
    key: "line.pointHoverRadius",
    type: "number",
    description: "Point radius on hover",
    relevantWidgets: ["line", "scatter", "bubble", "radar"]
  },
  {
    name: "Point Hover Background Color",
    key: "line.pointHoverBackgroundColor",
    type: "color",
    description: "Point background color on hover",
    relevantWidgets: ["line", "scatter", "bubble", "radar"]
  },
  {
    name: "Point Hover Border Color",
    key: "line.pointHoverBorderColor",
    type: "color",
    description: "Point border color on hover",
    relevantWidgets: ["line", "scatter", "bubble", "radar"]
  },
  {
    name: "Point Hover Border Width",
    key: "line.pointHoverBorderWidth",
    type: "number",
    description: "Point border width on hover",
    relevantWidgets: ["line", "scatter", "bubble", "radar"]
  },
  {
    name: "Fill Area",
    key: "line.fill",
    type: "boolean",
    // Assuming boolean fill for simplicity, Chart.js can use strings too
    description: "Fill the area below the line",
    relevantWidgets: ["line", "radar", "polarArea"]
    // Fill is also relevant for Radar and Polar Area
  },
  {
    name: "Point Rotation",
    key: "line.pointRotation",
    type: "number",
    description: "Rotation of points in degrees",
    relevantWidgets: ["line", "scatter", "bubble", "radar"]
  },
  {
    name: "Show Line",
    key: "line.showLine",
    type: "boolean",
    description: "Show the line for this dataset",
    relevantWidgets: ["line"]
  },
  {
    name: "Span Gaps",
    key: "line.spanGaps",
    type: "boolean",
    description: "Connect data points across null or undefined values",
    relevantWidgets: ["line", "radar"]
    // Span gaps might be relevant for Radar too
  },
  {
    name: "Border Cap Style",
    key: "line.borderCapStyle",
    type: "select",
    description: "Style of line endings",
    options: ["butt", "round", "square"],
    relevantWidgets: ["line", "radar"]
    // Line styles relevant for Radar
  },
  {
    name: "Border Join Style",
    key: "line.borderJoinStyle",
    type: "select",
    description: "Style of line joins",
    options: ["round", "bevel", "miter"],
    relevantWidgets: ["line", "radar"]
    // Line styles relevant for Radar
  },
  // Bar Chart Specific Configurations
  {
    name: "Base Value",
    key: "bar.base",
    type: "number",
    // Assuming number base for simplicity
    description: "The base value for the bars",
    relevantWidgets: ["bar"]
  },
  {
    name: "Bar Percentage",
    key: "bar.barPercentage",
    type: "number",
    description: "Percentage of the category that the bar will use",
    relevantWidgets: ["bar"]
  },
  {
    name: "Bar Thickness",
    key: "bar.barThickness",
    type: "number",
    description: "Fixed thickness of bars",
    relevantWidgets: ["bar"]
  },
  {
    name: "Max Bar Thickness",
    key: "bar.maxBarThickness",
    type: "number",
    description: "Maximum thickness of bars",
    relevantWidgets: ["bar"]
  },
  {
    name: "Border Skipped",
    key: "bar.borderSkipped",
    type: "boolean",
    // Assuming boolean skip for simplicity, Chart.js can use strings
    description: "Which borders to skip drawing ('start', 'end', 'left', 'right', 'top', 'bottom', or boolean)",
    relevantWidgets: ["bar"]
  },
  {
    name: "Category Percentage",
    key: "bar.categoryPercentage",
    type: "number",
    description: "Percentage of the available space the category uses",
    relevantWidgets: ["bar"]
  },
  {
    name: "Bar Border Radius",
    key: "bar.borderRadius",
    type: "number",
    description: "Border radius of bars",
    relevantWidgets: ["bar"]
  },
  {
    name: "Grouped Bars",
    key: "bar.grouped",
    type: "boolean",
    description: "Whether bars are grouped",
    relevantWidgets: ["bar"]
  },
  {
    name: "Bar Hover Border Radius",
    key: "bar.hoverBorderRadius",
    type: "number",
    description: "Border radius on hover for bars",
    relevantWidgets: ["bar"]
  },
  {
    name: "Index Axis",
    key: "bar.indexAxis",
    type: "select",
    description: "The axis for the index scale ('x' or 'y')",
    options: ["x", "y"],
    relevantWidgets: ["bar"]
  },
  {
    name: "Stack ID",
    key: "bar.stack",
    type: "text",
    description: "ID of the stack this dataset belongs to",
    relevantWidgets: ["bar"]
  },
  {
    name: "Minimum Bar Length",
    key: "bar.minBarLength",
    type: "number",
    description: "Minimum length of the bar in pixels",
    relevantWidgets: ["bar"]
  },
  // Pie Chart Specific Configurations (Also relevant for Doughnut, which is a variant)
  {
    name: "Pie Rotation",
    key: "pie.rotation",
    type: "number",
    description: "Starting angle for the first arc in degrees",
    relevantWidgets: ["pie", "doughnut"]
    // Assuming 'doughnut' is a value
  },
  {
    name: "Circumference",
    key: "pie.circumference",
    type: "number",
    description: "The sweep angle for the dataset in degrees",
    relevantWidgets: ["pie", "doughnut"]
  },
  {
    name: "Cutout",
    key: "pie.cutout",
    type: "number",
    // Assuming number or percentage string
    description: "The portion of the inner radius to cut out (e.g., 50 for 50%)",
    relevantWidgets: ["pie", "doughnut"]
  },
  {
    name: "Offset",
    key: "pie.offset",
    type: "number",
    description: "The offset of the arcs in pixels",
    relevantWidgets: ["pie", "doughnut"]
  },
  {
    name: "Spacing",
    key: "pie.spacing",
    type: "number",
    description: "The spacing between arcs in pixels",
    relevantWidgets: ["pie", "doughnut"]
  },
  {
    name: "Hover Offset",
    key: "pie.hoverOffset",
    type: "number",
    description: "The offset when hovering over an arc in pixels",
    relevantWidgets: ["pie", "doughnut"]
  },
  {
    name: "Weight",
    key: "pie.weight",
    type: "number",
    description: "Relative dataset weight",
    relevantWidgets: ["pie", "doughnut", "polarArea"]
    // Weight is also used in Polar Area
  },
  {
    name: "Border Align",
    key: "pie.borderAlign",
    type: "select",
    description: "Border alignment for arcs",
    options: ["center", "inner"],
    relevantWidgets: ["pie", "doughnut"]
  },
  {
    name: "Pie Border Width",
    key: "pie.borderWidth",
    type: "number",
    description: "Border width for arcs",
    relevantWidgets: ["pie", "doughnut", "polarArea"]
    // Border width relevant for Polar Area
  },
  {
    name: "Pie Hover Border Width",
    key: "pie.hoverBorderWidth",
    type: "number",
    description: "Border width on hover for arcs",
    relevantWidgets: ["pie", "doughnut", "polarArea"]
  },
  {
    name: "Pie Hover Border Color",
    key: "pie.hoverBorderColor",
    type: "color",
    description: "Border color on hover for arcs",
    relevantWidgets: ["pie", "doughnut", "polarArea"]
  },
  // Bubble Chart Specific Configurations
  {
    name: "Bubble Hit Radius",
    key: "bubble.hitRadius",
    type: "number",
    description: "Increase/decrease bubble hit area",
    relevantWidgets: ["bubble"]
  },
  {
    name: "Bubble Hover Radius",
    key: "bubble.hoverRadius",
    type: "number",
    description: "Bubble radius on hover",
    relevantWidgets: ["bubble"]
  },
  {
    name: "Bubble Radius",
    key: "bubble.radius",
    type: "number",
    description: "Radius of the bubbles",
    relevantWidgets: ["bubble"]
  },
  // PointStyle, Rotation, and BorderWidth are also in core/line configs but overridden here for clarity
  {
    name: "Bubble Style",
    key: "bubble.pointStyle",
    // Note: uses pointStyle property name
    type: "select",
    description: "Style of bubbles",
    options: [
      "circle",
      "cross",
      "dash",
      "line",
      "rect",
      "rectRounded",
      "rectRot",
      "star",
      "triangle"
    ],
    relevantWidgets: ["bubble"]
  },
  {
    name: "Bubble Rotation",
    key: "bubble.rotation",
    type: "number",
    description: "Rotation of bubbles in degrees",
    relevantWidgets: ["bubble"]
  },
  {
    name: "Bubble Border Width",
    key: "bubble.borderWidth",
    type: "number",
    description: "Border width of bubbles",
    relevantWidgets: ["bubble"]
  }
];
export {
  WIDGET_ADVANCED_OPTIONS,
  WIDGET_DATASET_ADVANCED_OPTIONS,
  WIDGET_INITIAL_CONFIG,
  WIDGET_TYPES
};
//# sourceMappingURL=index.mjs.map
