export function renderGenderPieChart() {
  d3.csv("../project_heart_disease.csv").then(data => {
    const container = d3.select("#chart-gender-disease");
    container.selectAll("svg").remove();

    // Làm sạch dữ liệu
    data.forEach(d => {
      d.Gender = d.Gender.trim().toLowerCase(); // chuẩn hoá về lowercase
      d["Heart Disease Status"] = d["Heart Disease Status"].trim();
    });

    // Tính tổng theo gender và heart disease
    const grouped = d3.rollup(
      data,
      v => v.length,
      d => d.Gender,
      d => d["Heart Disease Status"]
    );

    // Chỉ lấy đúng 2 nhóm giới tính cần: male và female
    const genders = ["male", "female"];
    const result = genders.map(gender => {
      const heartMap = grouped.get(gender) || new Map();
      return {
        gender: gender.charAt(0).toUpperCase() + gender.slice(1),
        values: ["Yes", "No"].map(status => ({
          status,
          count: heartMap.get(status) || 0
        }))
      };
    });

    // Vẽ biểu đồ
    const margin = { top: 50, right: 150, bottom: 50, left: 50 },
      width = 350,
      height = 350,
      radius = Math.min(width, height) / 2 - 40;

    const svg = container
      .append("svg")
      .attr("width", width * 2 + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const color = d3.scaleOrdinal()
      .domain(["Yes", "No"])
      .range(["#dd5182", "#ffa600"]);

    // Add tooltip div
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "solid 1px #aaa")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("font-size", "12px");

    result.forEach((group, i) => {
      const pie = d3.pie().value(d => d.count)(group.values);
      const arc = d3.arc().innerRadius(0).outerRadius(radius);
      const arcHover = d3.arc().innerRadius(0).outerRadius(radius + 10);

      const chartGroup = svg.append("g")
        .attr("transform", `translate(${i * (width + 50) + radius}, ${radius})`);

      // Calculate total for percentages
      const total = group.values.reduce((sum, d) => sum + d.count, 0);

      chartGroup.selectAll("path")
        .data(pie)
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.status))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("transition", "all 0.3s")
        .on("mouseover", function (event, d) {
          const percent = ((d.data.count / total) * 100).toFixed(1);
          tooltip.transition()
            .duration(200)
            .style("opacity", .9);
          tooltip.html(`${d.data.status === "Yes" ? "Has Heart Disease" : "No Heart Disease"}<br/>
                       Count: ${d.data.count}<br/>
                       Percentage: ${percent}%`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");

          d3.select(this)
            .transition()
            .duration(200)
            .attr("d", arcHover);
        })
        .on("mouseout", function (d) {
          tooltip.transition()
            .duration(500)
            .style("opacity", 0);

          d3.select(this)
            .transition()
            .duration(200)
            .attr("d", arc);
        });

      // Add percentage labels
      chartGroup.selectAll("text.percentage")
        .data(pie)
        .enter()
        .append("text")
        .attr("class", "percentage")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .style("fill", "white")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .text(d => {
          const percent = ((d.data.count / total) * 100).toFixed(1);
          return percent > 5 ? `${percent}%` : "";
        });

      chartGroup.append("text")
        .attr("text-anchor", "middle")
        .attr("y", radius + 30)
        .style("font-weight", "bold")
        .style("font-size", "16px")
        .text(group.gender);
    });

    // Legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width * 2 - 20}, ${height / 4})`);
    ["Yes", "No"].forEach((label, i) => {
      const g = legend.append("g").attr("transform", `translate(0, ${i * 25})`);
      g.append("rect").attr("width", 16).attr("height", 16).attr("fill", color(label));
      g.append("text")
        .attr("x", 22)
        .attr("y", 13)
        .style("font-size", "14px")
        .text(label === "Yes" ? "Has Heart Disease" : "No Heart Disease");
    });
  });
}
