export function renderBMIChart(isDashboard = false) {
  const selector = isDashboard ? "#chart-bmi-disease-dash" : "#chart-bmi-disease";
  d3.csv("../project_heart_disease.csv").then(data => {
    const container = d3.select(selector);
    container.selectAll("svg").remove();

    container.style("opacity", 0)
    .transition()
    .duration(1250)
    .style("opacity", 1);

    // Data preprocessing and cleaning
    const cleanData = data.filter(d => 
        d["BMI"] && 
        !isNaN(d["BMI"]) &&
        d["Heart Disease Status"]
      ).map(d => ({
        bmi: Math.round(+d["BMI"] * 10) / 10,
        status: d["Heart Disease Status"].trim()
      }));

    // Group by BMI and disease status to get counts
    const bmiRange = d3.range(16, 43, 0.5); // Create BMI ranges for binning
    const countsByBmiAndStatus = [];
    
    // Process data to count patients for each BMI value and disease status
    bmiRange.forEach(bmiValue => {
      // Count patients with heart disease
      const yesCount = cleanData.filter(d => 
        d.bmi >= bmiValue - 0.25 && d.bmi < bmiValue + 0.25 && d.status === "Yes"
      ).length;
      
      // Count patients without heart disease
      const noCount = cleanData.filter(d => 
        d.bmi >= bmiValue - 0.25 && d.bmi < bmiValue + 0.25 && d.status === "No"
      ).length;
      
      // Add to our data array if there are any patients in this range
      if (yesCount > 0) {
        countsByBmiAndStatus.push({
          bmi: bmiValue,
          status: "Yes",
          count: yesCount
        });
      }
      
      if (noCount > 0) {
        countsByBmiAndStatus.push({
          bmi: bmiValue,
          status: "No",
          count: noCount
        });
      }
    });
    
    // Chart dimensions
    const margin = isDashboard ? {top: 30, right: 100, bottom: 60, left: 40 }
     :{top: 40, right: 160, bottom: 60, left: 60 };

    const width = isDashboard ? 800 - margin.left - margin.right:900 - margin.left - margin.right,
      height = isDashboard ? 310 - margin.top - margin.bottom :400 - margin.top - margin.bottom;

    // Find maximum count for y-axis scale
    const maxCount = d3.max(countsByBmiAndStatus, d => d.count);

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
      .domain([0, maxCount + 2])  // Count range with some padding
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

    // Add scatter points representing counts
    svg.selectAll("circle")
      .data(countsByBmiAndStatus)
      .join("circle")
      .attr("cx", d => x(d.bmi))
      .attr("cy", d => y(d.count))  // Use actual patient count
      .attr("r", d => Math.max(3, Math.min(8, d.count * 0.8)))  // Size based on count
      .attr("fill", d => color(d.status))
      .attr("opacity", d => d.status === "No" ? 0.5 : 0.7);

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .ticks(10))
      .selectAll("text")
      .style("text-anchor", "middle");

    svg.append("g")
      .call(d3.axisLeft(y)
        .ticks(5)
        .tickFormat(d3.format("d"))); // Format as integers

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
      .text("Number of Patients");  // Changed label to patient count

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
      .text("Number of Patients by BMI and Heart Disease Status");

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
          .attr("r", Math.max(6, Math.min(12, d.count * 0.8)))
          .attr("opacity", 1);

        tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);
        
        tooltip.html(`
          <div style="font-weight: bold; margin-bottom: 8px;">
            BMI: ${d.bmi.toFixed(1)}
          </div>
          <div style="margin-bottom: 5px;">
            Patients: ${d.count}
          </div>
          <div style="color: ${color(d.status)}">
            Heart Disease: ${d.status}
          </div>
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", Math.max(3, Math.min(8, d.count * 0.8)))
          .attr("opacity", d => d.status === "No" ? 0.5 : 0.7);
        
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });
  });
}