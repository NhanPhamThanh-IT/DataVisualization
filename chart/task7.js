import { CSV_FILE_PATH, TASK_7 } from "../constants/index.js";
import { addTooltip } from "../utils/index.js";

function loadData() {
  return d3.csv(CSV_FILE_PATH).then(data => {
    const cleanData = data.filter(d =>
      d[TASK_7.ATTRIBUTES.src] &&
      d[TASK_7.ATTRIBUTES.dest] &&
      TASK_7.STATUS_VALUES.includes(d[TASK_7.ATTRIBUTES.dest].trim())
    ).map(d => ({
      familyHistory: d[TASK_7.ATTRIBUTES.src].trim(),
      heartDisease: d[TASK_7.ATTRIBUTES.dest].trim()
    }));
    const grouped = d3.group(cleanData, d => d.familyHistory);
    return Array.from(grouped, ([history, group]) => {
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
  });
}

function createSVG(container, width, height, margin) {
  return container.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
}

function createScales(chartData, width, height) {
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

  return { x, y, color };
}

function drawBars(svg, stackedData, x, y, color) {
  const barGroups = svg.selectAll("g.layer")
    .data(stackedData)
    .join("g")
    .attr("class", "layer")
    .attr("fill", d => color(d.key));

  barGroups.selectAll("rect")
    .data(d => d)
    .join("rect")
    .attr("x", d => x(d.data.familyHistory))
    .attr("y", y(0))
    .attr("width", x.bandwidth())
    .attr("height", 0)
    .transition()
    .duration(1000)
    .attr("y", d => y(d[1]))
    .attr("height", d => y(d[0]) - y(d[1]));
}

function addValueLabels(barGroups, x, y) {
  barGroups.selectAll("text")
    .data(d => d)
    .join("text")
    .attr("x", d => x(d.data.familyHistory) + x.bandwidth() / 2)
    .attr("y", d => y(d[1]) + (y(d[0]) - y(d[1])) / 2)
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em")
    .style("fill", "black")
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .text(d => d[1] - d[0]);
}

function addAxes(svg, x, y, width, height) {
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("text-anchor", "middle")
    .style("font-size", "12px");

  svg.append("g")
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove());
}

function addTitles(svg, width, height, margin, chartTitles) {
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 10)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text(chartTitles.xAxisTitle);

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 15)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text(chartTitles.yAxisTitle);

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text(chartTitles.chartTitle);
}

function addLegend(svg, width) {
  const legend = svg.append("g")
    .attr("transform", `translate(${width + 10}, 0)`);

  ["With Disease", "Without Disease"].forEach((text, i) => {
    const g = legend.append("g")
      .attr("transform", `translate(0, ${i * 25})`);

    g.append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", text == "With Disease" ? "#FF9999" : "lightblue");

    g.append("text")
      .attr("x", 25)
      .attr("y", 14)
      .style("font-size", "12px")
      .text(text);
  });
}

function handleMouseEvents(barGroups, tooltip) {
  barGroups.selectAll("rect")
    .on("mouseover", function (event, d) {
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
    .on("mouseout", function () {
      d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", 1);

      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });
}

function renderFamilyHistoryChart() {
  loadData().then(chartData => {
    const container = d3.select("#chart-family-history");
    container.selectAll("svg").remove();
    const margin = { top: 40, right: 160, bottom: 60, left: 60 },
      width = 900 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;
    const svg = createSVG(container, width, height, margin);
    const { x, y, color } = createScales(chartData, width, height);
    svg.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat("")
      )
      .style("stroke-dasharray", "2,2")
      .style("opacity", 0.1);
    const stack = d3.stack()
      .keys(["withoutDisease", "withDisease"])
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);
    const stackedData = stack(chartData.map(d => ({
      familyHistory: d.familyHistory,
      withDisease: d.withDisease,
      withoutDisease: d.withoutDisease
    })));
    drawBars(svg, stackedData, x, y, color);
    addValueLabels(svg.selectAll("g.layer"), x, y);
    addAxes(svg, x, y, width, height);
    addTitles(svg, width, height, margin, TASK_7.TITLES);
    addLegend(svg, width);
    const tooltip = addTooltip();
    handleMouseEvents(svg.selectAll("g.layer"), tooltip);
  });
}

if (document.querySelector(`#${TASK_7.DATA_TARGET}`).classList.contains("active")) {
  renderFamilyHistoryChart();
}
document.querySelector(`[data-target=${TASK_7.DATA_TARGET}]`)
  .addEventListener("click", renderFamilyHistoryChart);