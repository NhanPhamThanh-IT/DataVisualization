function drawSimpleStackedBarChart() {
    // 1. Mock Data
    const data = [
        { category: "A", value1: 10, value2: 20, value3: 15 },
        { category: "B", value1: 15, value2: 25, value3: 10 },
        { category: "C", value1: 20, value2: 10, value3: 30 },
        { category: "D", value1: 12, value2: 18, value3: 22 },
    ];

    const keys = ["value1", "value2", "value3"]; // Keys for the stacks

    // 2. Setup SVG and Dimensions
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Check if an SVG already exists, remove it
    d3.select("#chart-family-history").select("svg").remove();

    const svg = d3.select("#chart-family-history") // Ensure you have a div with this ID in your HTML
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // 3. Scales
    const x = d3.scaleBand()
        .domain(data.map(d => d.category))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        // Calculate max Y value (sum of all values for each category)
        .domain([0, d3.max(data, d => d.value1 + d.value2 + d.value3)])
        .nice()
        .range([height, 0]);

    const color = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemeCategory10); // Or choose another color scheme

    // 4. Stack Data
    const stackedData = d3.stack()
        .keys(keys)(data);
    // stackedData structure: [ series1, series2, series3 ]
    // Each series: [ [y0, y1], [y0, y1], ... ] for each category
    // where y0 is the bottom and y1 is the top of the segment

    // 5. Draw Axes
    // X Axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    // Y Axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // 6. Draw Bars
    svg.append("g")
        .selectAll("g")
        // Bind the stacked data (one group per series/key)
        .data(stackedData)
        .join("g")
          .attr("fill", d => color(d.key)) // Color based on the key (value1, value2, etc.)
          .selectAll("rect")
          // Bind the data points within each series
          .data(d => d)
          .join("rect")
            .attr("x", d => x(d.data.category)) // Use the original data bound to the stack segment
            .attr("y", d => y(d[1])) // d[1] is the top y-coordinate
            .attr("height", d => y(d[0]) - y(d[1])) // Height is difference between bottom and top
            .attr("width", x.bandwidth());

    // Optional: Add a simple legend
    const legend = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(keys.slice().reverse()) // Reverse to match stack order visually
        .join("g")
          .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend.append("rect")
        .attr("x", width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", color);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(d => d);

}

// Example of how to call it (assuming you have a div with id="simple-stacked-bar-chart-container" in your HTML)
// Make sure this runs after the DOM is ready
// document.addEventListener('DOMContentLoaded', drawSimpleStackedBarChart);

// Or if using modules and called from main.js:
// export { drawSimpleStackedBarChart };
// Then in main.js: import { drawSimpleStackedBarChart } from './task7.js'; drawSimpleStackedBarChart();

// For standalone testing, you might add a container div and call the function directly
/*
// Add this to your HTML: <div id="simple-stacked-bar-chart-container"></div>
// Then uncomment this line:
drawSimpleStackedBarChart();
*/

if (document.querySelector("#family-history").classList.contains("active")) {
    renderBMIChart();
  }
  document.querySelector("[data-target='family-history']")
    .addEventListener("click", renderBMIChart);