// task2.js
export function renderGenderPieChart(isDashboard = false) {
  const selector = isDashboard ? "#chart-gender-disease-dash" : "#chart-gender-disease";

  d3.csv("../project_heart_disease.csv").then(data => {
    const container = d3.select(selector);
    container.selectAll("svg").remove();

    // Fade-in effect
    container.style("opacity", 0)
      .transition()
      .duration(1250)
      .style("opacity", 1);

    // Clean data
    data.forEach(d => {
      d.Gender = d.Gender.trim().toLowerCase();
      d["Heart Disease Status"] = d["Heart Disease Status"].trim();
    });

    // Aggregate data
    const grouped = d3.rollup(
      data,
      v => v.length,
      d => d.Gender,
      d => d["Heart Disease Status"]
    );

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

    // Chart dimensions
    const margin = isDashboard 
      ? { top: 30, right: 40, bottom: 30, left: 40 }
      : { top: 50, right: 150, bottom: 50, left: 50 };
    
    const width = isDashboard ? 250 : 350;
    const height = isDashboard ? 250 : 350;
    const radius = Math.min(width, height) / 2 - 40;

    const svg = container
      .append("svg")
      .attr("width", width * 2 + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Add chart title
    svg.append("text")
      .attr("x", (width * 2) / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", isDashboard ? "16px" : "24px")
      .style("font-weight", "bold")
      .text("Heart Disease Distribution by Gender");

    const color = d3.scaleOrdinal()
      .domain(["Yes", "No"])
      .range(["#dd5182", "#ffa600"]);

    // Tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("visibility", "hidden")
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "solid 1px #aaa")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("font-size", "12px")
      .style("box-shadow", "0 2px 8px rgba(0,0,0,0.2)");

    result.forEach((group, i) => {
      const pie = d3.pie().value(d => d.count)(group.values);
      const arc = d3.arc().innerRadius(0).outerRadius(radius);
      const arcHover = d3.arc().innerRadius(0).outerRadius(radius + 10);

      const chartGroup = svg.append("g")
        .attr("transform", `translate(${i * (width + 50) + radius}, ${radius})`);

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
        .on("mousemove", function (event) {
          tooltip
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 10}px`);
        })
        .on("mouseout", function (event, d) {
          tooltip.style("visibility", "hidden");
          d3.select(this)
            .transition()
            .duration(200)
            .attr("d", arc);
        });

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
          return percent > 5 ? `${d.data.count} (${percent}%)` : "";
        });

      const titleFontSize = isDashboard ? "12px" : "16px";
      chartGroup.append("text")
        .attr("text-anchor", "middle")
        .attr("y", radius + 30)
        .style("font-weight", "bold")
        .style("font-size", titleFontSize)
        .text(group.gender);
    });

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

export function renderGenderDiseaseGroupBarChart(isDashboard = false) {
  const selector = isDashboard ? "#chart-gender-disease-dash" : "#chart-gender-disease-groupbar";
  d3.csv("../project_heart_disease.csv").then(data => {
    // Clean and preprocess data
    data.forEach(d => {
      d.Gender = d.Gender.trim();
      d["Heart Disease Status"] = d["Heart Disease Status"].trim();
      d.Age = +d.Age;
      d.Smoking = d.Smoking ? d.Smoking.trim() : "Unknown";
    });

    // Bin ages into groups
    const ageBins = d3.range(20, 90, 10);
    function getAgeGroup(age) {
      for (let i = 0; i < ageBins.length; i++) {
        if (age >= ageBins[i] && age < ageBins[i] + 10) return `${ageBins[i]}-${ageBins[i]+9}`;
      }
      return "Unknown";
    }

    // Prepare data for grouped bar chart
    let chartData = [];
    ["Male", "Female"].forEach(gender => {
      ["Yes", "No"].forEach(heartDisease => {
        ageBins.forEach(bin => {
          ["Yes", "No"].forEach(smoking => {
            const group = data.filter(d =>
              d.Gender.toLowerCase() === gender.toLowerCase() &&
              d["Heart Disease Status"] === heartDisease &&
              getAgeGroup(d.Age) === `${bin}-${bin+9}` &&
              d.Smoking === smoking
            );
            if (group.length > 0) {
              chartData.push({
                gender,
                heartDisease,
                ageGroup: `${bin}-${bin+9}`,
                smoking,
                count: group.length,
                ageAvg: (group.reduce((sum, d) => sum + d.Age, 0) / group.length).toFixed(1)
              });
            }
          });
        });
      });
    });

    let filteredData = chartData.filter(d => d.smoking === "Yes");
    let currentSmoking = "Yes";

    // SVG setup
    const margin = { top: 40, right: 30, bottom: 120, left: 60 }; // Increased bottom margin for labels
    const width = isDashboard ? 500 : 800; // Increased width for larger chart
    const height = isDashboard ? 300 : 500; // Increased height for larger chart
    const container = d3.select(selector);
    container.selectAll("svg").remove();
    container.selectAll(".filter-container").remove();

    // Add filter dropdown for smoking
    const filterDiv = container.append("div").attr("class", "filter-container").style("margin-bottom", "10px");
    filterDiv.append("label").text("Filter by Smoking: ").style("margin-right", "8px");
    const filter = filterDiv.append("select").attr("id", "smoking-filter");
    filter.selectAll("option")
      .data(["Yes", "No"])
      .enter().append("option")
      .attr("value", d => d)
      .text(d => d);

    const svg = container.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add chart title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", isDashboard ? "16px" : "20px")
      .style("font-weight", "bold")
      .text("Heart Disease by Gender, Age, and Smoking");

    // Scales
    const x0 = d3.scaleBand()
      .domain(["Male", "Female"])
      .range([0, width])
      .padding(0.1); // Reduced padding for wider bars
    const x1 = d3.scaleBand()
      .domain(["Yes", "No"])
      .range([0, x0.bandwidth()])
      .padding(0.03); // Reduced padding for wider bars
    const ageGroups = ageBins.map(bin => `${bin}-${bin+9}`);
    const x2 = d3.scaleBand()
      .domain(ageGroups)
      .range([0, x1.bandwidth()])
      .padding(0.02); // Reduced padding for wider bars
    const y = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => d.count) * 1.1])
      .range([height, 0]);
    const color = d3.scaleOrdinal()
      .domain(["Yes", "No"])
      .range(["#ff6b6b", "#ffd166"]);

    // Tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background", "#fff")
      .style("border", "1px solid #ccc")
      .style("padding", "8px");

    function update(filteredData) {
      svg.selectAll("g.bar-group").remove();
      const genderGroups = svg.selectAll("g.bar-group")
        .data(["Male", "Female"])
        .enter().append("g")
        .attr("class", "bar-group")
        .attr("transform", d => `translate(${x0(d)},0)`);

      genderGroups.each(function(gender) {
        const genderData = filteredData.filter(d => d.gender === gender);
        const heartGroups = d3.select(this).selectAll("g.heart-group")
          .data(["Yes", "No"])
          .enter().append("g")
          .attr("class", "heart-group")
          .attr("transform", d => `translate(${x1(d)},0)`);

        heartGroups.each(function(heartDisease) {
          const heartData = genderData.filter(d => d.heartDisease === heartDisease);
          const bars = d3.select(this).selectAll("rect")
            .data(heartData)
            .enter().append("rect")
            .attr("x", d => x2(d.ageGroup))
            .attr("y", d => y(d.count))
            .attr("width", x2.bandwidth()) // Wider bars due to reduced padding
            .attr("height", d => height - y(d.count))
            .attr("fill", d => color(d.heartDisease))
            .on("mouseover", (event, d) => {
              tooltip.transition().duration(200).style("opacity", 0.9);
              tooltip.html(
                `<b>${d.gender}</b> - ${d.heartDisease} - Age: <b>${d.ageGroup}</b><br/>` +
                `Count: ${d.count}<br>Avg Age: ${d.ageAvg}<br>Smoking: ${d.smoking}`
              )
              .style("left", (event.pageX + 5) + "px")
              .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => tooltip.transition().duration(500).style("opacity", 0));

          // Add age group labels above bars
          d3.select(this).selectAll("text.age-label")
            .data(heartData)
            .enter().append("text")
            .attr("class", "age-label")
            .attr("x", d => x2(d.ageGroup) + x2.bandwidth() / 2)
            .attr("y", d => y(d.count) - 5) // Just above the bar
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "#333")
            .text(d => d.ageGroup.split("-")[0]); // Show only the start of the range for brevity
        });
      });

      // X axis
      svg.selectAll("g.x-axis").remove();
      svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0))
        .selectAll("text")
        .style("font-size", "14px");

      // Y axis
      svg.selectAll("g.y-axis").remove();
      svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("font-size", "12px");

      // Y-axis label
      svg.selectAll("text.y-label").remove();
      svg.append("text")
        .attr("class", "y-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Count");

      // Age group labels (optional, below bars for reference)
      svg.selectAll("g.age-labels").remove();
      svg.append("g")
        .attr("class", "age-labels")
        .selectAll("text")
        .data(ageGroups)
        .enter().append("text")
        .attr("x", d => x0("Male") + x1("Yes") + x2(d) + x2.bandwidth() / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
        .attr("transform", d => `rotate(-45, ${x0("Male") + x1("Yes") + x2(d) + x2.bandwidth() / 2}, ${height + 40})`)
        .text(d => d);

      // Legend
      svg.selectAll("g.legend").remove();
      const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - 100}, 0)`);
      ["Yes", "No"].forEach((status, i) => {
        const g = legend.append("g")
          .attr("transform", `translate(0,${i * 20})`);
        g.append("rect")
          .attr("width", 15)
          .attr("height", 15)
          .attr("fill", color(status));
        g.append("text")
          .attr("x", 20)
          .attr("y", 12)
          .style("font-size", "12px")
          .text(status === "Yes" ? "Has Heart Disease" : "No Heart Disease");
      });
    }

    // Initial draw
    update(filteredData);

    // Filter interaction
    filter.on("change", function() {
      currentSmoking = this.value;
      filteredData = chartData.filter(d => d.smoking === currentSmoking);
      update(filteredData);
    });
  });
}