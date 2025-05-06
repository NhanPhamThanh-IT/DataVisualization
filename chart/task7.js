export function renderFamilyHistoryChart() {
    d3.csv("../project_heart_disease.csv").then(data => {
        // Define color variables here
        const yesColor = "#FFB2AB";
        const noColor = "#B2E0B1";

        const container = d3.select("#chart-family-history");
        container.selectAll("svg").remove();

        // Fade-in effect for the whole chart
        container.style("opacity", 0)
            .transition()
            .duration(1000)
            .style("opacity", 1);

        const chartData = (data) => {
            const resultMap = {};

            data.forEach((item) => {
                const familyHistory = item["Family Heart Disease"];
                const heartStatus = item["Heart Disease Status"];

                if (familyHistory === "") {
                    return;
                }

                if (!resultMap[familyHistory]) {
                    resultMap[familyHistory] = {
                        "Family Heart Disease": familyHistory,
                        yes: 0,
                        no: 0
                    };
                }

                if (heartStatus === "Yes") {
                    resultMap[familyHistory].yes += 1;
                } else if (heartStatus === "No") {
                    resultMap[familyHistory].no += 1;
                }
            });

            // Chuyển từ object về array
            return Object.values(resultMap);
        }

        const margin = { top: 40, right: 100, bottom: 60, left: 60 },
            width = 800 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        const chartDataResult = chartData(data);  // Call chartData here

        // Ensure 'ageGroup' is being used correctly in your data
        const x = d3.scaleBand()
            .domain(chartDataResult.map(d => d["Family Heart Disease"])) // Adjust to match correct property
            .range([0, width])
            .padding(0.2);

        const y = d3.scaleLinear()
            .domain([0, d3.max(chartDataResult, d => d.yes + d.no)])
            .nice()
            .range([height, 0]);

        const svg = container.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const color = d3.scaleOrdinal()
            .domain(["yes", "no"])
            .range([yesColor, noColor]);

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
            .data(chartDataResult)
            .enter()
            .append("g")
            .attr("transform", d => `translate(${x(d["Family Heart Disease"])},0)`);

        // Hiệu ứng khi xuất hiện cột
        bars.selectAll("rect")
            .data(d => [
                { key: "yes", value: d.yes, yOffset: 0, group: d["Family Heart Disease"] },
                { key: "no", value: d.no, yOffset: d.yes, group: d["Family Heart Disease"] }
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
                    .text(`Family history status: ${d.group}, ${d.key === "yes" ? "Heart Disease" : "No Disease"}: ${d.value}`)
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 10}px`);
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

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -margin.top / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .text("Family History of Heart Disease Patients");

        // Axes
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
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
            .text("Family history status");

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

// if (document.querySelector("#family-history").classList.contains("active")) {
//     renderAgeDistributionChart();
// }

// document.querySelector("[data-target='family-history']")
//     .addEventListener("click", renderAgeDistributionChart);

// renderClusteredStackedChart

export function renderClusteredStackedChart() {
    d3.csv("../project_heart_disease.csv").then(data => {
        const colorMap = {
            Yes: "#F4A261",  // Has heart disease
            No: "#2A9D8F"    // No heart disease
        };

        const container = d3.select("#chart-family-smoking");
        container.selectAll("svg").remove();
        container.style("opacity", 0)
            .transition()
            .duration(1000)
            .style("opacity", 1);

        // Tiền xử lý dữ liệu
        const nestedData = {};
        data.forEach(d => {
            const family = d["Family Heart Disease"];
            const smoking = d["Smoking"];
            const status = d["Heart Disease Status"];
            if (!family || !smoking || !status) return;

            const key = `${family}-${smoking}`;
            if (!nestedData[key]) nestedData[key] = { family, smoking, Yes: 0, No: 0 };
            nestedData[key][status]++;
        });

        const chartData = Object.values(nestedData);

        const margin = { top: 40, right: 120, bottom: 80, left: 60 },
            width = 800 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        const svg = container.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const groups = chartData.map(d => `${d.family}-${d.smoking}`);
        const x0 = d3.scaleBand()
            .domain(groups)
            .range([0, width])
            .padding(0.3);

        const x1 = d3.scaleBand()
            .domain(["Yes", "No"])
            .range([0, x0.bandwidth()])
            .padding(0.05);

        const y = d3.scaleLinear()
            .domain([0, d3.max(chartData, d => Math.max(d.Yes, d.No))])
            .nice()
            .range([height, 0]);

        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", "white")
            .style("padding", "8px")
            .style("border", "1px solid #ccc")
            .style("border-radius", "5px")
            .style("visibility", "hidden")
            .style("pointer-events", "none")
            .style("box-shadow", "0 2px 8px rgba(0,0,0,0.15)");

        svg.selectAll("g.bar-group")
            .data(chartData)
            .enter()
            .append("g")
            .attr("class", "bar-group")
            .attr("transform", d => `translate(${x0(`${d.family}-${d.smoking}`)}, 0)`)
            .selectAll("g")
            .data(d => ["Yes", "No"].map(status => ({
                status,
                value: d[status],
                family: d.family,
                smoking: d.smoking
            })))
            .enter()
            .append("g")
            .each(function (d) {
                const g = d3.select(this);
                g.append("rect")
                    .attr("x", x1(d.status))
                    .attr("y", y(d.value))
                    .attr("width", x1.bandwidth())
                    .attr("height", height - y(d.value))
                    .attr("fill", colorMap[d.status])
                    .on("mouseover", function (event, d) {
                        tooltip.html(`
                            <strong>Family:</strong> ${d.family}<br/>
                            <strong>Smoking:</strong> ${d.smoking}<br/>
                            <strong>Status:</strong> ${d.status}<br/>
                            <strong>Count:</strong> ${d.value}
                        `)
                            .style("visibility", "visible")
                            .style("left", `${event.pageX + 10}px`)
                            .style("top", `${event.pageY - 30}px`);
                        d3.select(this).style("opacity", 0.85);
                    })
                    .on("mousemove", event => {
                        tooltip.style("left", `${event.pageX + 10}px`)
                            .style("top", `${event.pageY - 30}px`);
                    })
                    .on("mouseout", function () {
                        tooltip.style("visibility", "hidden");
                        d3.select(this).style("opacity", 1);
                    });

                // Thêm label số ngay trên cột
                g.append("text")
                    .attr("x", x1(d.status) + x1.bandwidth() / 2)
                    .attr("y", y(d.value) - 5)
                    .attr("text-anchor", "middle")
                    .style("font-size", "12px")
                    .style("font-weight", "600")
                    .style("fill", "#333")
                    .text(d.value);
            });

        // Trục X
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x0).tickFormat(d => {
                const [family, smoking] = d.split("-");
                return `F:${family} | S:${smoking}`;
            }))
            .selectAll("text")
            .style("font-size", "13px")
            .style("font-weight", "500")
            .attr("transform", "rotate(-25)")
            .style("text-anchor", "end");

        // Trục Y
        svg.append("g")
            .call(d3.axisLeft(y));

        // Nhãn trục X
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 60)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .text("Family History | Smoking Status");

        // Nhãn trục Y
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -45)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .text("Number of Patients");

        // Tiêu đề
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .text("Heart Disease Distribution by Family History and Smoking");

        // Chú giải
        const legend = svg.append("g")
            .attr("transform", `translate(${width + 20}, 0)`);

        ["Yes", "No"].forEach((status, i) => {
            const row = legend.append("g")
                .attr("transform", `translate(0, ${i * 25})`);

            row.append("rect")
                .attr("width", 15)
                .attr("height", 15)
                .attr("fill", colorMap[status]);

            row.append("text")
                .attr("x", 20)
                .attr("y", 12)
                .style("font-size", "12px")
                .text(status === "Yes" ? "Has Heart Disease" : "No Heart Disease");
        });
    });
}
