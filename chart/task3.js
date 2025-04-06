function renderSmokingBarChart() {
    d3.csv("../project_heart_disease.csv").then((data) => {
      const container = d3.select("#smoking-disease");
      container.selectAll("svg").remove();
  
      const grouped = d3.rollup(
        data,
        v => v.length,
        d => d.Smoking,
        d => d["Heart Disease Status"]
      );
  
      const chartData = Array.from(grouped, ([smoke, val]) => {
        return {
          Smoking: smoke,
          Yes: val.get("Yes") || 0,
          No: val.get("No") || 0,
        };
      });
  
      const margin = { top: 30, right: 20, bottom: 60, left: 60 },
        width = 600 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;
  
      const svg = container
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
      const subgroups = ["Yes", "No"];
      const x = d3.scaleBand().domain(chartData.map(d => d.Smoking)).range([0, width]).padding(0.2);
      const xSubgroup = d3.scaleBand().domain(subgroups).range([0, x.bandwidth()]).padding(0.05);
      const y = d3.scaleLinear().domain([0, d3.max(chartData, d => Math.max(d.Yes, d.No))]).range([height, 0]);
      const color = d3.scaleOrdinal().domain(subgroups).range(["#e41a1c", "#377eb8"]);
  
      svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));
      svg.append("g").call(d3.axisLeft(y));
  
      svg.append("g")
        .selectAll("g")
        .data(chartData)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x(d.Smoking)},0)`)
        .selectAll("rect")
        .data(d => subgroups.map(key => ({ key, value: d[key] })))
        .enter()
        .append("rect")
        .attr("x", d => xSubgroup(d.key))
        .attr("y", d => y(d.value))
        .attr("width", xSubgroup.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", d => color(d.key));
    });
  }
  
  if (document.querySelector("#smoking-disease").classList.contains("active")) {
    renderSmokingBarChart();
  }
  
  document.querySelector("[data-target='smoking-disease']").addEventListener("click", renderSmokingBarChart);
  