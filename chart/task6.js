export function renderBMIChart() {
  d3.csv("../project_heart_disease.csv").then(data => {
    const container = d3.select("#chart-bmi-disease");
    container.selectAll("svg").remove();

    // Data preprocessing and cleaning
    const cleanData = data.filter(d => 
        d["BMI"] && 
        !isNaN(d["BMI"]) &&
        d["Heart Disease Status"]
      ).map(d => ({
        bmi: Math.round(+d["BMI"] * 10) / 10,
        status: d["Heart Disease Status"].trim()
      }));

    const sampleData = cleanData.filter((_, i) => i % 2 === 0);
    
    // Chart dimensions
    const margin = { top: 40, right: 160, bottom: 60, left: 60 },
      width = 900 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    // Create SVG
    const svg = container.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleLinear()
      .domain([16, 42])  // BMI range
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, 50])  // Distribution range
      .range([height, 0]);

    // Color scale
    const color = d3.scaleOrdinal()
      .domain(["Yes", "No"])
      .range(["#FF7F7F", "#7FB3D5"]);

    // Add grid lines
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .tickSize(-height)
        .tickFormat(""))
      .style("stroke-dasharray", "2,2")
      .style("opacity", 0.1);

    svg.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat(""))
      .style("stroke-dasharray", "2,2")
      .style("opacity", 0.1);

    // Add scatter points with transition
    svg.selectAll("circle")
      .data(sampleData)
      .join("circle")
      .attr("cx", d => x(d.bmi))
      .attr("cy", d => {
        // Calculate position based on disease status
        if (d.status === "Yes") {
          return y(Math.random() * 15 + 5); // Lower range for disease cases
        } else {
          return y(Math.random() * 15 + 30); // Upper range for non-disease cases
        }
      })
      .attr("r", d => d.status === "No" ? 2 : 3)  // Smaller points for no disease
      .attr("fill", d => color(d.status))
      .attr("opacity", d => d.status === "No" ? 0.4 : 0.7);

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .ticks(10))
      .selectAll("text")
      .style("text-anchor", "middle");

    svg.append("g")
      .call(d3.axisLeft(y));

    // Add labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("BMI");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 15)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Count of BMI");

    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width + 10}, 0)`);

    ["Yes", "No"].forEach((key, i) => {
      const g = legend.append("g")
        .attr("transform", `translate(0,${i * 20})`);
      
      g.append("circle")
        .attr("r", 6)
        .attr("fill", color(key))
        .attr("opacity", 0.6);

      g.append("text")
        .attr("x", 15)
        .attr("y", 4)
        .style("font-size", "12px")
        .text(key === "Yes" ? "With Heart Disease" : "Without Heart Disease");
    });

    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Distribution of BMI by Heart Disease Status");

    // Add tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "1px solid #ddd")
      .style("border-radius", "8px")
      .style("padding", "12px")
      .style("font-size", "12px")
      .style("box-shadow", "0 4px 6px rgba(0,0,0,0.1)");

    // Add interactivity
    svg.selectAll("circle")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 6)
          .attr("opacity", 1);

        tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);
        
        tooltip.html(`
          <div style="font-weight: bold; margin-bottom: 8px;">
            BMI: ${d.bmi.toFixed(1)}
          </div>
          <div style="color: ${color(d.status)}">
            Heart Disease: ${d.status}
          </div>
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 4)
          .attr("opacity", 0.6);
        
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });
  });
}

// // Activate on load or when clicking tab
// if (document.querySelector("#bmi-disease").classList.contains("active")) {
//   renderBMIChart();
// }
// document.querySelector("[data-target='bmi-disease']")
//   .addEventListener("click", renderBMIChart);