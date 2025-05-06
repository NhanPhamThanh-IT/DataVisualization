export function renderCholesterolChart(isDashboard = false) {
  const selector = isDashboard ? "#chart-cholesterol-disease-dash" : "#chart-cholesterol-disease";
  d3.csv("../project_heart_disease.csv").then(data => {
    const container = d3.select(selector);
    container.selectAll("svg").remove();

    container.style("opacity", 0)
      .transition()
      .duration(1250)
      .style("opacity", 1);

    const cleanData = data.filter(d =>
      d["Cholesterol Level"] &&
      !isNaN(d["Cholesterol Level"]) &&
      d["Heart Disease Status"]
    ).map(d => ({
      cholesterol: +d["Cholesterol Level"],
      status: d["Heart Disease Status"].trim()
    }));

    const binWidth = 10;
    const bins = d3.range(150, 310, binWidth);

    const diseaseData = cleanData.filter(d => d.status === "Yes");
    const nonDiseaseData = cleanData.filter(d => d.status === "No");

    const histogram = d3.histogram()
      .value(d => d.cholesterol)
      .domain([150, 300])
      .thresholds(bins);

    const diseaseBins = histogram(diseaseData);
    const nonDiseaseBins = histogram(nonDiseaseData);

    const margin = isDashboard ? { top: 22, right: 130, bottom: 200, left: 60 } : { top: 40, right: 160, bottom: 120, left: 60 },
      width = 900 - margin.left - margin.right,
      height = 415 - margin.top - margin.bottom;

    const svg = container.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([150, 300]).range([0, width]);
    const y = d3.scaleLinear()
      .domain([0, d3.max([...diseaseBins, ...nonDiseaseBins], d => d.length)])
      .nice()
      .range([height, 0]);

    const color = d3.scaleOrdinal()
      .domain(["Disease", "No Disease"])
      .range(["purple", "lightblue"]);

    // Disease bars
    svg.selectAll(".bar-disease")
      .data(diseaseBins)
      .join("rect")
      .attr("class", "bar-disease")
      .attr("x", d => x(d.x0))
      .attr("y", d => y(d.length))
      .attr("width", d => x(d.x1) - x(d.x0) - 1)
      .attr("height", d => height - y(d.length))
      .attr("fill", color("Disease"))
      .attr("opacity", 0.7);

    // No disease bars
    svg.selectAll(".bar-no-disease")
      .data(nonDiseaseBins)
      .join("rect")
      .attr("class", "bar-no-disease")
      .attr("x", d => x(d.x0))
      .attr("y", d => y(d.length))
      .attr("width", d => x(d.x1) - x(d.x0) - 1)
      .attr("height", d => height - y(d.length))
      .attr("fill", color("No Disease"))
      .attr("opacity", 0.7);

    // Line paths
    const line = d3.line()
      .x(d => x((d.x0 + d.x1) / 2))
      .y(d => y(d.length))
      .curve(d3.curveCatmullRom.alpha(0.5));

    svg.append("path")
      .datum(diseaseBins)
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .attr("d", line);

    svg.append("path")
      .datum(nonDiseaseBins)
      .attr("fill", "none")
      .attr("stroke", "blue")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Tooltip
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

    svg.selectAll("rect")
      .on("mouseover", function (event, d) {
        const isDisease = d3.select(this).classed("bar-disease");

        // Show the tooltip with more information
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .style("visibility", "visible")
          .text(``)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`);
        tooltip.html(`
          <div style="margin-bottom: 8px;">
            <span style="font-weight: bold;">Cholesterol Range</span>: ${Math.round(d.x0)} - ${Math.round(d.x1)}
          </div>
          <div style="margin-bottom: 8px;">
            <span style="font-weight: bold;">${isDisease ? "With" : "Without"} Heart Disease</span>: ${d.length} patients
          </div>
          <div style="margin-bottom: 8px;">
            <span style="font-weight: bold;">Percentage</span>: ${((d.length / (diseaseData.length + nonDiseaseData.length)) * 100).toFixed(1)}%
          </div>
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function () {
        // Hide the tooltip
        tooltip.transition().duration(500).style("opacity", 0);
      });

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .attr("class", "x-axis")
      .call(d3.axisBottom(x).ticks(15))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-1.2em")
      .attr("dy", ".5em")
      .attr("transform", "rotate(-45)")
      .style("font-size", "12px");

    svg.append("g").call(d3.axisLeft(y));

    // Labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + 80)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Cholesterol Level (mg/dL)");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Number of Patients");

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Distribution of Cholesterol Levels by Heart Disease Status");

    // Legend
    const legend = svg.append("g").attr("transform", `translate(${width + 20}, 20)`);
    ["Disease", "No Disease"].forEach((key, i) => {
      const g = legend.append("g").attr("transform", `translate(0,${i * 20})`);
      g.append("rect")
        .attr("width", 14)
        .attr("height", 14)
        .attr("fill", color(key))
        .attr("opacity", 0.7);
      g.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .style("font-size", "12px")
        .text(key === "Disease" ? "With Heart Disease" : "Without Heart Disease");
    });
  });
}
