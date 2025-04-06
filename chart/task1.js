function renderAgeDistributionChart() {
    d3.csv("../project_heart_disease.csv").then(data => {
      const container = d3.select("#chart-age-distribution");
      container.selectAll("svg").remove();
  
      data.forEach(d => {
        d.Age = +d.Age;
        d["Heart Disease Status"] = d["Heart Disease Status"].trim();
      });
  
      const ageBins = d3.bin()
        .domain([20, 90])
        .thresholds(d3.range(20, 90, 10))
        .value(d => d.Age);
  
      const binned = ageBins(data);
      const chartData = binned.map(bin => {
        const yes = bin.filter(d => d["Heart Disease Status"] === "Yes").length;
        const no = bin.filter(d => d["Heart Disease Status"] === "No").length;
        return {
          ageGroup: `${Math.floor(bin.x0)}-${Math.floor(bin.x1)}`,
          yes,
          no
        };
      });
  
      const margin = { top: 40, right: 100, bottom: 60, left: 60 },
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;
  
      const x0 = d3.scaleBand()
        .domain(chartData.map(d => d.ageGroup))
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
  
      const svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
      const color = d3.scaleOrdinal()
        .domain(["yes", "no"])
        .range(["#e41a1c", "#377eb8"]);
  
      const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("visibility", "hidden")  // Changed from opacity to visibility
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid #ccc")
        .style("padding", "8px")
        .style("border-radius", "5px")
        .style("pointer-events", "none")
        .style("box-shadow", "0 2px 8px rgba(0,0,0,0.2)");
  
      const calculatePercentage = (value, group) => {
        const total = group.yes + group.no;
        return ((value / total) * 100).toFixed(1);
      };
  
      const bars = svg.append("g")
        .selectAll("g")
        .data(chartData)
        .join("g")
        .attr("transform", d => `translate(${x0(d.ageGroup)},0)`);
  
      bars.selectAll("rect")
        .data(d => [
          { key: "yes", value: d.yes, group: d.ageGroup, total: d },
          { key: "no", value: d.no, group: d.ageGroup, total: d }
        ])
        .join("rect")
        .attr("x", d => x1(d.key))
        .attr("y", d => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", d => color(d.key))
        .attr("stroke", "white")
        .on("mouseover", function(event, d) {
          d3.select(this)
            .style("opacity", 0.8)
            .style("cursor", "pointer");
          
          tooltip
            .style("visibility", "visible")
            .text(`Age Group: ${d.group}, Count: ${d.value}`)
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
  
      // Axes
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0))
        .style("font-size", "12px");
  
      svg.append("g")
        .call(d3.axisLeft(y))
        .style("font-size", "12px");
  
      // Labels
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Age Groups");
  
      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Number of Patients");
  
      // Legend
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
  if (document.querySelector("#age-distribution").classList.contains("active")) {
    renderAgeDistributionChart();
  }
  document.querySelector("[data-target='age-distribution']")
    .addEventListener("click", renderAgeDistributionChart);
  