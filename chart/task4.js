export function renderExerciseChart() {
  d3.csv("../project_heart_disease.csv").then(data => {
    const container = d3.select("#chart-exercise-disease");
    container.selectAll("svg").remove();

    // Enhanced data preprocessing and validation
    const cleanData = data.filter(d => 
      d["Exercise Habits"] && 
      d["Heart Disease Status"] && 
      ["Yes", "No"].includes(d["Heart Disease Status"].trim())
    ).map(d => ({
      exerciseHabit: d["Exercise Habits"].trim(),
      heartDisease: d["Heart Disease Status"].trim()
    }));

    // Aggregate data for stacked bars
    const grouped = d3.group(cleanData, d => d.exerciseHabit);
    const chartData = Array.from(grouped, ([habit, group]) => {
      const total = group.length;
      const withDisease = group.filter(d => d.heartDisease === "Yes").length;
      return {
        habit,
        "Has Heart Disease": (withDisease / total) * 100,
        "No Heart Disease": ((total - withDisease) / total) * 100,
        total,
        absoluteYes: withDisease,
        absoluteNo: total - withDisease
      };
    }).sort((a, b) => b["Has Heart Disease"] - a["Has Heart Disease"]);

    // Prepare data for stacking
    const stackKeys = ["Has Heart Disease", "No Heart Disease"];
    const stack = d3.stack().keys(stackKeys);
    const stackedData = stack(chartData);

    // Enhanced chart dimensions
    const margin = { top: 40, right: 160, bottom: 80, left: 60 },
      width = 900 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    const svg = container.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleBand()
      .domain(chartData.map(d => d.habit))
      .range([0, width])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, 100])
      .nice()
      .range([height, 0]);

    // Color scale
    const color = d3.scaleOrdinal()
      .domain(stackKeys)
      .range(["#FF6B6B", "#4ECDC4"]);

    // Add stacked bars with transitions
    const layer = svg.selectAll(".layer")
      .data(stackedData)
      .join("g")
      .attr("class", "layer")
      .attr("fill", d => color(d.key));

    layer.selectAll("rect")
      .data(d => d)
      .join("rect")
      .attr("x", d => x(d.data.habit))
      .attr("y", height)
      .attr("width", x.bandwidth())
      .attr("height", 0)
      .transition()
      .duration(1000)
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]));

    // Add interactive elements
    layer.selectAll("rect")
      .on("mouseover", function(event, d) {
        const key = d3.select(this.parentNode).datum().key;
        const value = d[1] - d[0];
        const percent = (value / d.data.total * 100).toFixed(1);

        d3.select(this)
          .style("opacity", 0.8)
          .style("cursor", "pointer");

        tooltip.transition()
          .duration(200)
          .style("opacity", 1);
        
        tooltip.html(`
          <div style="font-weight: bold; margin-bottom: 8px;">${d.data.habit}</div>
          <div style="color: ${color(key)};">${key}: ${Math.round(value)}%</div>
          <div style="color: #666;">(${key === "Has Heart Disease" ? d.data.absoluteYes : d.data.absoluteNo} patients) </div>
          <div>Percentage: ${percent}%</div>
          <div style="margin-top: 5px;">Total Patients: ${d.data.total}</div>
        `)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`);
      })
      .on("mouseout", function() {
        d3.select(this)
          .style("opacity", 1);
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });

    // Add tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "rgba(255, 255, 255, 0.95)")
      .style("border", "1px solid #ddd")
      .style("border-radius", "8px")
      .style("padding", "12px")
      .style("font-size", "12px")
      .style("box-shadow", "0 4px 6px rgba(0,0,0,0.1)");

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    // Add value labels on bars
    layer.selectAll("text")
      .data(d => d)
      .join("text")
      .attr("x", d => x(d.data.habit) + x.bandwidth() / 2)
      .attr("y", d => y(d[1]) + (y(d[0]) - y(d[1])) / 2)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("fill", "white")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("pointer-events", "none")
      .text(d => {
        const value = d[1] - d[0];
        return value > 5 ? `${Math.round(value * 1000) / 1000
        }%` : "";
      });

    svg.append("g")
      .call(d3.axisLeft(y)
      .ticks(10)
      .tickFormat(d => d + "%"));

    // Add labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Exercise Habits");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 15)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Number of Patients");

      svg.append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", y(50))
      .attr("y2", y(50))
      .attr("stroke", "#666")
      .attr("stroke-dasharray", "4,4")
      .attr("opacity", 0.5);

    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width + 10}, 0)`);

    stackKeys.forEach((key, i) => {
      const g = legend.append("g")
        .attr("transform", `translate(0,${i * 20})`);
      
      g.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", color(key));

      g.append("text")
        .attr("x", 25)
        .attr("y", 14)
        .style("font-size", "12px")
        .text(key);
    });

    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Distribution of Heart Disease by Exercise Habits");
  });
}

// // Activation code remains the same
// if (document.querySelector("#exercise-disease").classList.contains("active")) {
//   renderExerciseChart();
// }
// document.querySelector("[data-target='exercise-disease']")
//   .addEventListener("click", renderExerciseChart);