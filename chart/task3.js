function renderSmokingChart() {
  d3.csv("../project_heart_disease.csv").then(data => {
    const container = d3.select("#chart-smoking-disease");
    container.selectAll("svg").remove();

    // Clean and process data
    data.forEach(d => {
      d["Smoking Status"] = d["Smoking"].trim();
      d["Heart Disease Status"] = d["Heart Disease Status"].trim();
    });

    // Group data by smoking status and disease status
    const groupedData = d3.group(data, d => d["Smoking Status"]);
    const chartData = Array.from(groupedData, ([status, group]) => ({
      smokingStatus: status,
      yes: group.filter(d => d["Heart Disease Status"] === "Yes").length,
      no: group.filter(d => d["Heart Disease Status"] === "No").length
    }));

    // Chart dimensions
    const margin = { top: 40, right: 100, bottom: 60, left: 60 },
      width = 800 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    // Scales
    const x0 = d3.scaleBand()
      .domain(chartData.map(d => d.smokingStatus))
      .range([0, width])
      .padding(0.2);

    const x1 = d3.scaleBand()
      .domain(["yes", "no"])
      .range([0, x0.bandwidth()])
      .padding(0.05);

    const y = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => Math.max(d.yes, d.no))])
      .nice()
      .range([height, 0]);

    // Create SVG
    const svg = container.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Color scale
    const color = d3.scaleOrdinal()
      .domain(["yes", "no"])
      .range(["#e41a1c", "#377eb8"]);

    // Tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("visibility", "hidden")
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "1px solid #ccc")
      .style("padding", "8px")
      .style("border-radius", "5px")
      .style("pointer-events", "none")
      .style("box-shadow", "0 2px 8px rgba(0,0,0,0.2)");

    // Calculate percentage helper
    const calculatePercentage = (value, group) => {
      const total = group.yes + group.no;
      return ((value / total) * 100).toFixed(1);
    };

    // Add bars
    const bars = svg.append("g")
      .selectAll("g")
      .data(chartData)
      .join("g")
      .attr("transform", d => `translate(${x0(d.smokingStatus)},0)`);

    bars.selectAll("rect")
      .data(d => [
        { key: "yes", value: d.yes, status: d.smokingStatus, total: d },
        { key: "no", value: d.no, status: d.smokingStatus, total: d }
      ])
      .join("rect")
      .attr("x", d => x1(d.key))
      .attr("y", d => y(d.value))
      .attr("width", x1.bandwidth())
      .attr("height", d => height - y(d.value))
      .attr("fill", d => color(d.key))
      .attr("stroke", "white")
      .on("mouseover", function(event, d) {
        const percent = calculatePercentage(d.value, d.total);
        d3.select(this)
          .style("opacity", 0.8)
          .style("cursor", "pointer");
        
        tooltip
          .style("visibility", "visible")
          .html(`
            <strong>Smoking Status:</strong> ${d.status}<br/>
            <strong>Status:</strong> ${d.key === "yes" ? "Has Heart Disease" : "No Heart Disease"}<br/>
            <strong>Count:</strong> ${d.value}<br/>
            <strong>Percentage:</strong> ${percent}%
          `)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`);
      })
      .on("mousemove", function(event) {
        tooltip
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`);
      })
      .on("mouseout", function() {
        d3.select(this)
          .style("opacity", 1);
        tooltip.style("visibility", "hidden");
      });

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x0))
      .style("font-size", "12px");

    svg.append("g")
      .call(d3.axisLeft(y))
      .style("font-size", "12px");

    // Add labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Smoking Status");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 15)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Number of Patients");

    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width + 10}, 0)`);

    ["yes", "no"].forEach((status, i) => {
      const g = legend.append("g")
        .attr("transform", `translate(0,${i * 20})`);
      
      g.append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", color(status));

      g.append("text")
        .attr("x", 25)
        .attr("y", 12)
        .style("font-size", "12px")
        .text(status === "yes" ? "Has Heart Disease" : "No Heart Disease");
    });
  });
}

// Activate on load or when clicking tab
if (document.querySelector("#smoking-disease").classList.contains("active")) {
  renderSmokingChart();
}
document.querySelector("[data-target='smoking-disease']")
  .addEventListener("click", renderSmokingChart);
  