function renderCholesterolGenderChart() {
  d3.csv("../project_heart_disease.csv").then(data => {
    const container = d3.select("#chart-cholesterol-gender");
    container.selectAll("svg").remove();

    // Data preprocessing and validation
    const cleanData = data.filter(d => 
      d["Cholesterol Level"] && 
      !isNaN(d["Cholesterol Level"]) &&
      d["Gender"]
    ).map(d => ({
      cholesterol: Math.round(+d["Cholesterol Level"]),
      gender: d["Gender"].trim()
    }));

    // Chart dimensions
    const margin = { top: 40, right: 30, bottom: 60, left: 60 },
      width = 900 - margin.left - margin.right,
      height = 410 - margin.top - margin.bottom;

    // Create SVG
    const svg = container.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X scale
    const x = d3.scaleLinear()
      .domain([150, 300])
      .range([0, width]);

    // Set up histogram parameters
    const histogram = d3.histogram()
      .value(d => d.cholesterol)
      .domain(x.domain())
      .thresholds(x.ticks(20));

    // Separate data by gender
    const maleData = histogram(cleanData.filter(d => d.gender === "Male"));
    const femaleData = histogram(cleanData.filter(d => d.gender === "Female"));

    // Y scale
    const y = d3.scaleLinear()
      .domain([0, d3.max([...maleData, ...femaleData], d => d.length)])
      .range([height, 0]);

    // Add X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .ticks(10)
        .tickFormat(d => d + " mg/dL"));

    // Add Y axis
    svg.append("g")
      .call(d3.axisLeft(y));

    // Add grid lines
    svg.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat(""))
      .style("stroke-dasharray", "2,2")
      .style("opacity", 0.1);

    // Add the bars for males
    svg.selectAll("rect.male")
      .data(maleData)
      .join("rect")
      .attr("class", "male")
      .attr("x", d => x(d.x0))
      .attr("y", d => y(d.length))
      .attr("width", d => x(d.x1) - x(d.x0) - 1)
      .attr("height", d => height - y(d.length))
      .style("fill", "#fcaf91")
      .style("opacity", 0.6);

    // Add the bars for females
    svg.selectAll("rect.female")
      .data(femaleData)
      .join("rect")
      .attr("class", "female")
      .attr("x", d => x(d.x0))
      .attr("y", d => y(d.length))
      .attr("width", d => x(d.x1) - x(d.x0) - 1)
      .attr("height", d => height - y(d.length))
      .style("fill", "#92bc9f")
      .style("opacity", 0.6);

    // Add X axis label
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Cholesterol Level (mg/dL)");

    // Add Y axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 15)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Count");

    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Distribution of Cholesterol Levels by Gender");

    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width + 20}, 20)`);

    ["Male", "Female"].forEach((gender, i) => {
      const g = legend.append("g")
        .attr("transform", `translate(0, ${i * 25})`);
      
      g.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", gender === "Male" ? "#fcaf91" : "#92bc9f")
        .style("opacity", 0.6);

      g.append("text")
        .attr("x", 25)
        .attr("y", 14)
        .style("font-size", "12px")
        .text(gender);
    });
  });
}

// Activate on load or when clicking tab
if (document.querySelector("#cholesterol-gender").classList.contains("active")) {
  renderCholesterolGenderChart();
}
document.querySelector("[data-target='cholesterol-gender']")
  .addEventListener("click", renderCholesterolGenderChart);