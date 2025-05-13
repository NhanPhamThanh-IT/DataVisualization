import { CSV_FILE_PATH } from '../constants/index.js';

export function renderSmokingChart() {
  d3.csv(CSV_FILE_PATH).then(data => {
    const container = d3.select("#chart-smoking-disease");
    container.selectAll("svg").remove();

    // Clean and process data
    data.forEach(d => {
      d["Smoking"] = d["Smoking"].trim();
      d["Heart Disease Status"] = d["Heart Disease Status"].trim();
    });

    const cleanData = data.filter(d =>
      d["Smoking"] &&
      d["Heart Disease Status"] &&
      ["Yes", "No"].includes(d["Heart Disease Status"].trim()) &&
      d["Smoking"] !== "Unknown"
    ).map(d => ({
      smoking: d["Smoking"].trim(),
      heartDisease: d["Heart Disease Status"].trim()
    }));

    const groupedData = d3.group(cleanData, d => d.smoking);
    const chartData = Array.from(groupedData, ([status, group]) => {
      const yesCount = group.filter(d => d.heartDisease === "Yes").length;
      const noCount = group.filter(d => d.heartDisease === "No").length;
      const total = yesCount + noCount;
      return {
        smokingStatus: status,
        yes: yesCount,
        no: noCount,
        yesPercentage: total > 0 ? (yesCount / total) * 100 : 0,
        noPercentage: total > 0 ? (noCount / total) * 100 : 0
      };
    });

    // Chart dimensions
    const margin = { top: 80, right: 140, bottom: 100, left: 80 },
      width = 800 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    // Scales
    const x0 = d3.scaleBand()
      .domain(chartData.map(d => d.smokingStatus))
      .range([0, width])
      .padding(0.2);

    const x1 = d3.scaleBand()
      .domain(["yes", "no"])
      .range([0, x0.bandwidth()])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, 100]) // Percentage scale
      .nice()
      .range([height, 0]);

    // Create SVG
    const svg = container.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    svg.append("text")
      .attr("x", width / 2)
      .text("Relationship Between Smoking Status and Heart Disease")
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .attr("y", -30);

    // Color scale
    const color = d3.scaleOrdinal()
      .domain(["yes", "no"])
      .range(["#003f5c", "#58508d"]);

    // Tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("visibility", "hidden")
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "1px solid #ccc")
      .style("padding", "12px")
      .style("border-radius", "5px")
      .style("pointer-events", "none")
      .style("box-shadow", "0 4px 8px rgba(0,0,0,0.2)")
      .style("font-size", "14px");

    // Add bars
    const bars = svg.append("g")
      .selectAll("g")
      .data(chartData)
      .join("g")
      .attr("transform", d => `translate(${x0(d.smokingStatus)},0)`);

    bars.selectAll("rect")
      .data(d => [
        { key: "yes", value: d.yesPercentage, status: d.smokingStatus },
        { key: "no", value: d.noPercentage, status: d.smokingStatus }
      ])
      .join("rect")
      .attr("x", d => x1(d.key))
      .attr("y", d => y(d.value))
      .attr("width", x1.bandwidth())
      .attr("height", d => height - y(d.value))
      .attr("fill", d => color(d.key))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .on("mouseover", function (event, d) {
        d3.select(this).style("opacity", 0.8).style("cursor", "pointer");
        tooltip.style("visibility", "visible")
          .html(`
            <strong>Smoking Status:</strong> ${d.status}<br/>
            <strong>Status:</strong> ${d.key === "yes" ? "Has Heart Disease" : "No Heart Disease"}<br/>
            <strong>Percentage:</strong> ${d.value.toFixed(1)}%
          `)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`);
      })
      .on("mousemove", function (event) {
        tooltip.style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`);
      })
      .on("mouseout", function () {
        d3.select(this).style("opacity", 1);
        tooltip.style("visibility", "hidden");
      });

    // Add axes
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x0))
      .selectAll("text")
      .style("text-anchor", "middle")
      .attr("dy", "0.5em")
      .style("font-size", "14px")
      .style("fill", "#333");

    svg.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y).ticks(10).tickFormat(d => `${d}%`))
      .selectAll("text")
      .style("font-size", "14px")
      .style("fill", "#333");

    // Add labels
    svg.append("text")
      .attr("class", "x-label")
      .attr("x", width / 2)
      .attr("y", height + 70)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .text("Smoking Status");

    svg.append("text")
      .attr("class", "y-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .text("Percentage of Patients");

    // Add legend
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 10}, 10)`);

    ["yes", "no"].forEach((status, i) => {
      const g = legend.append("g")
        .attr("transform", `translate(0,${i * 30})`);
      g.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", color(status))
        .attr("stroke", "#666")
        .attr("stroke-width", 1);
      g.append("text")
        .attr("x", 30)
        .attr("y", 15)
        .style("font-size", "14px")
        .style("fill", "#333")
        .text(status === "yes" ? "Has Heart Disease" : "No Heart Disease");
    });
  });
}

export function renderSmokingGenderChart() {
  d3.csv(CSV_FILE_PATH).then(data => {
    const container = d3.select("#chart-smoking-gender");
    container.selectAll("svg").remove();

    // Clean and process data
    data.forEach(d => {
      d["Smoking"] = d["Smoking"].trim();
      d.Gender = d.Gender ? d.Gender.trim() : "Unknown";
    });

    const cleanData = data.filter(d =>
      d["Smoking"] &&
      d.Gender !== "Unknown" &&
      d["Smoking"] !== "Unknown"
    ).map(d => ({
      smoking: d["Smoking"].trim(),
      gender: d.Gender
    }));

    const groupedData = d3.group(cleanData, d => d.smoking, d => d.gender);
    const chartData = Array.from(groupedData, ([smoking, genderGroup]) => ({
      smokingStatus: smoking,
      genderData: Array.from(genderGroup, ([gender, group]) => ({
        gender: gender,
        count: group.length
      }))
    }));

    // Chart dimensions
    const margin = { top: 80, right: 140, bottom: 120, left: 80 },
      width = 800 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    // Scales
    const x0 = d3.scaleBand()
      .domain(chartData.map(d => d.smokingStatus))
      .range([0, width])
      .padding(0.2);

    const x1 = d3.scaleBand()
      .domain(["Male", "Female"])
      .range([0, x0.bandwidth()])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => d3.max(d.genderData, g => g.count))])
      .nice()
      .range([height, 0]);

    // Create SVG
    const svg = container.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -30)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .text("Smoking Status and Gender Distribution");

    // Color scale
    const color = d3.scaleOrdinal()
      .domain(["Male", "Female"])
      .range(["#003f5c", "#ffa600"]);

    // Tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("visibility", "hidden")
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "1px solid #ccc")
      .style("padding", "12px")
      .style("border-radius", "5px")
      .style("pointer-events", "none")
      .style("box-shadow", "0 4px 8px rgba(0,0,0,0.2)")
      .style("font-size", "14px");

    // Add bars
    const bars = svg.append("g")
      .selectAll("g")
      .data(chartData)
      .join("g")
      .attr("transform", d => `translate(${x0(d.smokingStatus)},0)`);

    bars.selectAll("rect")
      .data(d => d.genderData)
      .join("rect")
      .attr("x", d => x1(d.gender))
      .attr("y", d => y(d.count))
      .attr("width", x1.bandwidth())
      .attr("height", d => height - y(d.count))
      .attr("fill", d => color(d.gender))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .on("mouseover", function (event, d) {
        d3.select(this).style("opacity", 0.8).style("cursor", "pointer");
        tooltip.style("visibility", "visible")
          .html(`
            <strong>Gender:</strong> ${d.gender}<br/>
            <strong>Count:</strong> ${d.count}
          `)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`);
      })
      .on("mousemove", function (event) {
        tooltip.style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`);
      })
      .on("mouseout", function () {
        d3.select(this).style("opacity", 1);
        tooltip.style("visibility", "hidden");
      });

    // Add axes
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x0))
      .selectAll("text")
      .style("text-anchor", "middle")
      .attr("dy", "0.5em")
      .style("font-size", "14px")
      .style("fill", "#333");

    svg.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y).ticks(10))
      .selectAll("text")
      .style("font-size", "14px")
      .style("fill", "#333");

    // Add labels
    svg.append("text")
      .attr("class", "x-label")
      .attr("x", width / 2)
      .attr("y", height + 70)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .text("Smoking Status");

    svg.append("text")
      .attr("class", "y-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .text("Number of Patients");

    // Add legend
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 50}, 10)`);

    ["Male", "Female"].forEach((gender, i) => {
      const g = legend.append("g")
        .attr("transform", `translate(0,${i * 30})`);
      g.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", color(gender))
        .attr("stroke", "#666")
        .attr("stroke-width", 1);
      g.append("text")
        .attr("x", 30)
        .attr("y", 15)
        .style("font-size", "14px")
        .style("fill", "#333")
        .text(gender);
    });
  });
}
