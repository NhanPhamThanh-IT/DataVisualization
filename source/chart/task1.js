import { CSV_FILE_PATH } from '../constants/index.js';

export function renderAgeDistributionChart(isDashboard = false) {
  const selector = isDashboard ? "#chart-age-distribution-dash" : "#chart-age-distribution";
  const color = d3.scaleOrdinal()
    .domain(["yes", "no"])
    .range(["#FFB2AB", "#B2E0B1"]);
  d3.csv(CSV_FILE_PATH).then(data => {
    const container = d3.select(selector);
    if (container.empty()) {
      console.warn(`Không tìm thấy phần tử với selector: ${selector}`);
      return;
    }
    container.selectAll("svg").remove();
    container.style("opacity", 0)
      .transition()
      .duration(1250)
      .style("opacity", 1);
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

    // Điều chỉnh kích thước biểu đồ dựa vào loại hiển thị
    const margin = isDashboard
      ? { top: 30, right: 50, bottom: 40, left: 40 }
      : { top: 40, right: 100, bottom: 60, left: 60 };

    // Kích thước nhỏ hơn cho dashboard
    const width = isDashboard
      ? 400 - margin.left - margin.right
      : 800 - margin.left - margin.right;

    const height = isDashboard
      ? 300 - margin.top - margin.bottom
      : 400 - margin.top - margin.bottom;

    const x = d3.scaleBand()
      .domain(chartData.map(d => d.ageGroup))
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => d.yes + d.no)])
      .nice()
      .range([height, 0]);

    const svg = container.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

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

    const bars = svg.selectAll(".bar-group")
      .data(chartData)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${x(d.ageGroup)},0)`);

    // Hiệu ứng khi xuất hiện cột
    bars.selectAll("rect")
      .data(d => [
        { key: "yes", value: d.yes, yOffset: 0, group: d.ageGroup },
        { key: "no", value: d.no, yOffset: d.yes, group: d.ageGroup }
      ])
      .join("rect")
      .attr("x", 0)
      .attr("width", x.bandwidth())
      .attr("y", height) // bắt đầu từ đáy
      .attr("height", 0) // bắt đầu từ 0
      .attr("fill", d => color(d.key))
      .attr("stroke", "white")
      .on("mouseover", function (event, d) {
        d3.select(this)
          .style("opacity", 0.8)
          .style("cursor", "pointer");
        tooltip
          .style("visibility", "visible")
          .text(`Age Group: ${d.group}, ${d.key === "yes" ? "Heart Disease" : "No Disease"}: ${d.value}`)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`);
        tooltip.html(`
          <div style="margin-bottom: 8px;">
            <span style="font-weight: bold;">Age Group</span>: ${d.group}
          </div>
          <div style="margin-bottom: 8px;">
            <span style="font-weight: bold; margin-bottom: 8px;">${d.key === "yes" ? "Heart Disease" : "No Disease"}</span>: ${d.value}
          </div>
        `)
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`);
      })
      .on("mouseout", function () {
        d3.select(this).style("opacity", 1);
        tooltip.style("visibility", "hidden");
      })
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .ease(d3.easeCubicOut)
      .attr("y", d => y(d.yOffset + d.value))
      .attr("height", d => height - y(d.value));

    // Title font size nhỏ hơn cho dashboard
    const titleFontSize = isDashboard ? "14px" : "16px";

    // Title for the chart
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", titleFontSize)
      .style("font-weight", "bold")
      .text("Age Distribution of Heart Disease Patients");

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .style("font-size", isDashboard ? "10px" : "12px");

    svg.append("g")
      .call(d3.axisLeft(y))
      .style("font-size", isDashboard ? "10px" : "12px");

    // Bỏ qua labels nếu là dashboard
    if (!isDashboard) {
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
    }

    // Legend - đơn giản hóa cho dashboard
    const legend = svg.append("g")
      .attr("transform", isDashboard
        ? `translate(${width - 20}, 0)`
        : `translate(${width + 10}, 0)`);

    ["yes", "no"].forEach((status, i) => {
      const g = legend.append("g")
        .attr("transform", `translate(0,${i * 20})`);

      g.append("rect")
        .attr("width", isDashboard ? 10 : 15)
        .attr("height", isDashboard ? 10 : 15)
        .attr("fill", color(status));

      g.append("text")
        .attr("x", isDashboard ? 15 : 25)
        .attr("y", isDashboard ? 8 : 12)
        .style("font-size", isDashboard ? "10px" : "12px")
        .text(status === "yes" ? "Has Heart Disease" : "No Heart Disease");
    });
  });
}