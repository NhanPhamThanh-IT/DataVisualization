// Đảm bảo các hàm render có sẵn trong scope global hoặc được import nếu dùng module
import { renderAgeDistributionChart } from './task1.js';
import { renderGenderPieChart } from './task2.js';
import { renderSmokingChart } from './task3.js';
import { renderExerciseChart } from './task4.js';
import { renderCholesterolChart } from './task5.js';
import { renderBMIChart } from './task6.js';
import { renderFamilyHistoryChart } from './task7.js';
import { renderCholesterolGenderChart } from './task8.js'; // Giả sử tên hàm là renderTask8
// ... (import các hàm khác nếu cần)

// Ánh xạ ID tab tới hàm render tương ứng
const renderFunctions = {
  "age-distribution": typeof renderAgeDistributionChart === "function" ? renderAgeDistributionChart : null,
  "gender-disease": typeof renderGenderPieChart === "function" ? renderGenderPieChart : null,
  "smoking-disease": typeof renderSmokingChart === "function" ? renderSmokingChart : null, // Giả sử tên hàm là renderTask3
  "exercise-disease": typeof renderExerciseChart === "function" ? renderExerciseChart : null, // Giả sử tên hàm là renderTask4
  "cholesterol-disease": typeof renderCholesterolChart === "function" ? renderCholesterolChart : null, // Giả sử tên hàm là renderTask5
  "bmi-disease": typeof renderBMIChart === "function" ? renderBMIChart : null, // Giả sử tên hàm là renderTask6
  "family-history": typeof renderFamilyHistoryChart === "function" ? renderFamilyHistoryChart : null,
  "cholesterol-gender": typeof renderCholesterolGenderChart === "function" ? renderCholesterolGenderChart : null, // Giả sử tên hàm là renderTask8
  // Thêm các task khác nếu có
};

// Hàm gọi render cho Dashboard
function renderDashboard() {
  console.log("Rendering Dashboard...");
  if (renderFunctions["age-distribution"]) {
    try {
      renderFunctions["age-distribution"](); // Gọi hàm render của Task 1
    } catch (err) {
      console.warn(`Không thể vẽ biểu đồ Age Distribution trên Dashboard:`, err);
    }
  }
  if (renderFunctions["gender-disease"]) {
    try {
      renderFunctions["gender-disease"](); // Gọi hàm render của Task 2
    } catch (err) {
      console.warn(`Không thể vẽ biểu đồ Gender & Disease trên Dashboard:`, err);
    }
  }
  if (renderFunctions["smoking-disease"]) {
    try {
      renderFunctions["smoking-disease"](); // Gọi hàm render của Task 3
    } catch (err) {
      console.warn(`Không thể vẽ biểu đồ Smoking & Disease trên Dashboard:`, err);
    }
  }
  if (renderFunctions["exercise-disease"]) {
    try {
      renderFunctions["exercise-disease"](); // Gọi hàm render của Task 4
    } catch (err) {
      console.warn(`Không thể vẽ biểu đồ Exercise & Disease trên Dashboard:`, err);
    }
  }
  if (renderFunctions["cholesterol-disease"]) {
    try {
      renderFunctions["cholesterol-disease"](); // Gọi hàm render của Task 5
    } catch (err) {
      console.warn(`Không thể vẽ biểu đồ Cholesterol & Disease trên Dashboard:`, err);
    }
  }
  if (renderFunctions["bmi-disease"]) {
    try {
      renderFunctions["bmi-disease"](); // Gọi hàm render của Task 6
    } catch (err) {
      console.warn(`Không thể vẽ biểu đồ BMI & Disease trên Dashboard:`, err);
    }
  }
  if (renderFunctions["family-history"]) {
    try {
      renderFunctions["family-history"](); // Gọi hàm render của Task 7
    } catch (err) {
      console.warn(`Không thể vẽ biểu đồ Family History trên Dashboard:`, err);
    }
  }
  if (renderFunctions["cholesterol-gender"]) {

    try {
      renderFunctions["cholesterol-gender"]();
    } catch (err) {

      console.warn(`Không thể vẽ biểu đồ Cholesterol gender trên Dashboard:`, err);
    }
  }
}

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", function () {
    // Reset trạng thái tab
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(tc => tc.classList.remove("active"));

    // Kích hoạt tab mới
    this.classList.add("active");
    const target = this.dataset.target;
    const targetElement = document.getElementById(target);
    if (targetElement) {
      targetElement.classList.add("active");
    } else {
      console.error(`Không tìm thấy phần tử nội dung cho tab: ${target}`);
      return; // Dừng lại nếu không tìm thấy target
    }


    // Gọi hàm render tương ứng
    try {
      if (target === "dashboard") {
        renderDashboard(); // Gọi hàm render riêng cho dashboard
      } else if (renderFunctions[target]) {
        renderFunctions[target](); // Gọi hàm render cho các tab khác
      } else {
        console.warn(`Không có hàm render nào được định nghĩa cho tab: ${target}`);
      }
    } catch (err) {
      console.warn(`Không thể vẽ biểu đồ cho ${target}:`, err);
    }
  });
});

// Render tab active ban đầu khi tải trang
document.addEventListener('DOMContentLoaded', () => {
  const activeTab = document.querySelector('.tab.active');
  if (activeTab) {
    const target = activeTab.dataset.target;
    if (target === "dashboard") {
      renderDashboard();
    } else if (renderFunctions[target]) {
      try {
        renderFunctions[target]();
      } catch (err) {
        console.warn(`Không thể vẽ biểu đồ ban đầu cho ${target}:`, err);
      }
    }
  } else {
    // Mặc định render dashboard nếu không có tab nào active
    const dashboardTab = document.querySelector('[data-target="dashboard"]');
    if (dashboardTab) {
      dashboardTab.click(); // Giả lập click để kích hoạt và render
    }
  }
});