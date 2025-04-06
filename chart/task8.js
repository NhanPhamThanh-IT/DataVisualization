// Task 8: Cholesterol Level by Gender - Box Plot
function renderCholesterolByGender() {
    d3.csv("../project_heart_disease.csv").then(function (data) {
      const container = d3.select("#cholesterol-gender");
      container.selectAll("svg").remove();
  
      const margin = { top: 30, right: 20, bottom: 60, left: 60 },
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;
  
      const svg = container
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
      const groups = d3.group(data, (d) => d.Gender);
      const stats = Array.from(groups.entries()).map(([key, values]) => {
        const nums = values.map((d) => +d["Cholesterol Level"]).sort(d3.ascending);
        const q1 = d3.quantile(nums, 0.25);
        const median = d3.quantile(nums, 0.5);
        const q3 = d3.quantile(nums, 0.75);
        const iqr = q3 - q1;
        const min = q1 - 1.5 * iqr;
        const max = q3 + 1.5 * iqr;
        return { key: key, q1, median, q3, min, max };
      });
  
      const x = d3.scaleBand().domain(stats.map((d) => d.key)).range([0, width]).padding(0.4);
      const y = d3.scaleLinear().domain([0, d3.max(stats, (d) => d.max)]).range([height, 0]);
  
      svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));
      svg.append("g").call(d3.axisLeft(y));
  
      svg
        .selectAll("boxes")
        .data(stats)
        .enter()
        .append("rect")
        .attr("x", (d) => x(d.key))
        .attr("y", (d) => y(d.q3))
        .attr("height", (d) => y(d.q1) - y(d.q3))
        .attr("width", x.bandwidth())
        .attr("stroke", "black")
        .style("fill", "#69b3a2");
  
      svg
        .selectAll("medianLines")
        .data(stats)
        .enter()
        .append("line")
        .attr("x1", (d) => x(d.key))
        .attr("x2", (d) => x(d.key) + x.bandwidth())
        .attr("y1", (d) => y(d.median))
        .attr("y2", (d) => y(d.median))
        .attr("stroke", "black");
    });
  }
  
  // Gọi khi tab được click
  if (document.querySelector("#cholesterol-gender").classList.contains("active")) {
    renderCholesterolByGender();
  }
  
  document.querySelector("[data-target='cholesterol-gender']").addEventListener("click", renderCholesterolByGender);
  