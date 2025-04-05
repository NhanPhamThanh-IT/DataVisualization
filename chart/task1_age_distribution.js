
d3.csv("../project_heart_disease.csv").then(function (data) {
    const tooltip = d3.selectAll(".tooltip");

    function drawBarChartAge(filteredData) {
        const ageGroups = d3.rollup(filteredData, v => v.length, d => d.Age);
        const ageData = Array.from(ageGroups, ([age, count]) => ({ age, count }));
        const svg = d3.select("#chart-age svg");
        svg.selectAll("*").remove();
        const margin = { top: 20, right: 20, bottom: 100, left: 60 },
            width = 900 - margin.left - margin.right,
            height = 350 - margin.top - margin.bottom;
        const x = d3.scaleBand().domain(ageData.map(d => d.age)).range([0, width]).padding(0.3);
        const y = d3.scaleLinear().domain([0, d3.max(ageData, d => d.count)]).range([height, 0]);
        const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
        
        g.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");
        
        g.append("g").call(d3.axisLeft(y));
        
        g.append("text")
            .attr("x", width / 2)
            .attr("y", height + 50)
            .attr("text-anchor", "middle")
            .text("Age Groups");
        
        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -40)
            .attr("text-anchor", "middle")
            .text("Number of Patients");
        
        g.selectAll(".bar").data(ageData).enter().append("rect")
            .attr("x", d => x(d.age))
            .attr("y", d => y(d.count))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.count))
            .attr("fill", "steelblue")
            .on("mouseover", function (event, d) {
                tooltip.style("visibility", "visible").text(`Age: ${d.age}, Count: ${d.count}`);
            })
            .on("mousemove", function (event) {
                tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function () {
                tooltip.style("visibility", "hidden");
            });
    }

    function updateChart() {
        const selectedAgeGroup = document.getElementById("age-group").value;
        let filteredData = data;
        if (selectedAgeGroup === "under-40") {
            filteredData = data.filter(d => d.Age < 40);
        } else if (selectedAgeGroup === "40-60") {
            filteredData = data.filter(d => d.Age >= 40 && d.Age <= 60);
        } else if (selectedAgeGroup === "above-60") {
            filteredData = data.filter(d => d.Age > 60);
        }
        drawBarChartAge(filteredData);
    }


    document.getElementById("age-group").addEventListener("change", updateChart);
    updateChart();
});



