const renderFunctions = {
  "age-distribution": typeof renderAgeDistribution === "function" ? renderAgeDistribution : null,
  "gender-disease": typeof renderTask2 === "function" ? renderTask2 : null,
  "smoking-disease": typeof renderTask3 === "function" ? renderTask3 : null,
  "cholesterol-gender": typeof renderTask8 === "function" ? renderTask8 : null,
  "family-history": typeof renderFamilyHistoryChart === "function" ? renderFamilyHistoryChart : null,
  // Thêm các task khác nếu có
};

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", function () {
    // Reset trạng thái tab
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(tc => tc.classList.remove("active"));

    // Kích hoạt tab mới
    this.classList.add("active");
    const target = this.dataset.target;
    document.getElementById(target).classList.add("active");

    // Gọi hàm nếu có
    try {
      if (renderFunctions[target]) {
        renderFunctions[target]();
      }
    } catch (err) {
      console.warn(`Không thể vẽ biểu đồ cho ${target}:`, err);
    }
  });
});
