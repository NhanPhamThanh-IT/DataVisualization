function renderFamilyHistoryChart() {
  d3.csv("../project_heart_disease.csv").then(data => {
    const container = d3.select("#chart-family-history");
    container.selectAll("svg").remove();

    const cleanData = data.filter(d => 
        d["Family Heart Disease"] && 
        d["Heart Disease Status"] && 
        ["Yes", "No"].includes(d["Heart Disease Status"].trim())
      ).map(d => ({
        familyHistory: d["Family Heart Disease"].trim(),
        heartDisease: d["Heart Disease Status"].trim()
      }));
  
      // Aggregate data for stacked bars
      const grouped = d3.group(cleanData, d => d.familyHistory);
      

    const chartData = Array.from(grouped, ([history, group]) => {
        const total = group.length;
        const withDisease = group.filter(d => d.heartDisease === "Yes").length;
        return {
          familyHistory: history,
          withDisease: withDisease,
          withoutDisease: total - withDisease,
          percentage: (withDisease / total * 100).toFixed(1),
          total: total
        };
      }).filter(d => d.familyHistory !== "Unknown");

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
    const x = d3.scaleBand()
      .domain(chartData.map(d => d.familyHistory))
      .range([0, width])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => d.total)])
      .range([height, 0])
      .nice();

    const color = d3.scaleOrdinal()
      .domain(["withDisease", "withoutDisease"])
      .range(["#FF9999", "lightblue"]);

    // Add grid lines
    svg.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat("")
      )
      .style("stroke-dasharray", "2,2")
      .style("opacity", 0.1);

    // Create stacked data
    const stack = d3.stack()
      .keys(["withDisease", "withoutDisease"])
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

    const stackedData = stack(chartData.map(d => ({
      familyHistory: d.familyHistory,
      withDisease: d.withDisease,
      withoutDisease: d.withoutDisease
    })));

    // Add bars
    const barGroups = svg.selectAll("g.layer")
      .data(stackedData)
      .join("g")
      .attr("class", "layer")
      .attr("fill", d => color(d.key));

    const bars = barGroups.selectAll("rect")
      .data(d => d)
      .join("rect")
      .attr("x", d => x(d.data.familyHistory))
      .attr("y", height)
      .attr("width", x.bandwidth())
      .attr("height", 0)
      .transition()
      .duration(1000)
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]));

    // Add value labels
    barGroups.selectAll("text")
      .data(d => d)
      .join("text")
      .attr("x", d => x(d.data.familyHistory) + x.bandwidth()/2)
      .attr("y", d => y(d[1]) + (y(d[0]) - y(d[1]))/2)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("fill", "black")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text(d => d[1] - d[0]);

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "middle")
      .style("font-size", "12px");

    svg.append("g")
      .call(d3.axisLeft(y))
      .call(g => g.select(".domain").remove());

    // Add labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Family History");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 15)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Number of Patients");

    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Distribution of Heart Disease by Family History");

    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width + 10}, 0)`);

    ["With Disease", "Without Disease"].forEach((text, i) => {
      const g = legend.append("g")
        .attr("transform", `translate(0, ${i * 25})`);
      
      g.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill",  text == "With Disease" ? "#FF9999" : "lightblue")    ;

      g.append("text")
        .attr("x", 25)
        .attr("y", 14)
        .style("font-size", "12px")
        .text(text);
    });

    // Add tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "white")
      .style("padding", "10px")
      .style("border-radius", "5px")
      .style("box-shadow", "0 0 10px rgba(0,0,0,0.1)");

    // Add interactivity
    barGroups.selectAll("rect")
      .on("mouseover", function(event, d) {
        const type = d3.select(this.parentNode).datum().key === "withDisease" ? "Disease" : "No Disease";
        const value = type === "Disease" ? d.data.withDisease : d.data.withoutDisease;
        const percentage = type === "Disease" ? 
          d.data.percentage : 
          (100 - parseFloat(d.data.percentage)).toFixed(1);

        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 0.8);

        tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);

        tooltip.html(`
          <div style="font-weight: bold">${d.data.familyHistory}</div>
          <div>${type}: ${value} patients (${percentage}%)</div>
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 1);

        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });
  });
}

// Activate on load or when clicking tab
if (document.querySelector("#family-history").classList.contains("active")) {
  renderFamilyHistoryChart();
}
document.querySelector("[data-target='family-history']")
  .addEventListener("click", renderFamilyHistoryChart);