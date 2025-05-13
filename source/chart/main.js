import { renderAgeDistributionChart } from './task1.js';
import { renderGenderPieChart } from './task2.js';
import { renderSmokingChart } from './task3.js';
import { renderExerciseChart } from './task4.js';
import { renderCholesterolChart } from './task5.js';
import { renderBMIChart } from './task6.js';
import { renderFamilyHistoryChart } from './task7.js';
import { renderCholesterolGenderChart } from './task8.js';

const renderFunctions = {
  "age-distribution": typeof renderAgeDistributionChart === "function" ? renderAgeDistributionChart : null,
  "gender-disease": typeof renderGenderPieChart === "function" ? renderGenderPieChart : null,
  "smoking-disease": typeof renderSmokingChart === "function" ? renderSmokingChart : null,
  "exercise-disease": typeof renderExerciseChart === "function" ? renderExerciseChart : null,
  "cholesterol-disease": typeof renderCholesterolChart === "function" ? renderCholesterolChart : null,
  "bmi-disease": typeof renderBMIChart === "function" ? renderBMIChart : null,
  "family-history": typeof renderFamilyHistoryChart === "function" ? renderFamilyHistoryChart : null,
  "cholesterol-gender": typeof renderCholesterolGenderChart === "function" ? renderCholesterolGenderChart : null,
};

function renderDashboard() {
  console.log("Rendering Dashboard...");
  if (renderFunctions["age-distribution"]) {
    try {
      renderAgeDistributionChart(true);
    } catch (err) {
      console.warn(`Không thể vẽ biểu đồ Age Distribution trên Dashboard:`, err);
    }
  }
  if (renderFunctions["gender-disease"]) {
    try {
      renderGenderPieChart(true);
    } catch (err) {
      console.warn(`Không thể vẽ biểu đồ Gender & Disease trên Dashboard:`, err);
    }
  }
  if (renderFunctions["smoking-disease"]) {
    try {
      renderSmokingChart(true);
    } catch (err) {
      console.warn(`Không thể vẽ biểu đồ Smoking & Disease trên Dashboard:`, err);
    }
  }
  if (renderFunctions["exercise-disease"]) {
    try {
      renderExerciseChart(true);
    } catch (err) {
      console.warn(`Không thể vẽ biểu đồ Exercise & Disease trên Dashboard:`, err);
    }
  }
  if (renderFunctions["cholesterol-disease"]) {
    try {
      renderCholesterolChart(true);
    } catch (err) {
      console.warn(`Không thể vẽ biểu đồ Cholesterol & Disease trên Dashboard:`, err);
    }
  }
  if (renderFunctions["bmi-disease"]) {
    try {
      renderBMIChart(true);
    } catch (err) {
      console.warn(`Không thể vẽ biểu đồ BMI & Disease trên Dashboard:`, err);
    }
  }
  if (renderFunctions["family-history"]) {
    try {
      renderFamilyHistoryChart(true);
    } catch (err) {
      console.warn(`Không thể vẽ biểu đồ Family History trên Dashboard:`, err);
    }
  }
  if (renderFunctions["cholesterol-gender"]) {
    try {
      renderCholesterolGenderChart(true);
    } catch (err) {
      console.warn(`Không thể vẽ biểu đồ Cholesterol gender trên Dashboard:`, err);
    }
  }
}

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", function () {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(tc => tc.classList.remove("active"));

    this.classList.add("active");
    const target = this.dataset.target;
    const targetElement = document.getElementById(target);
    if (targetElement) {
      targetElement.classList.add("active");
    } else {
      console.error(`Không tìm thấy phần tử nội dung cho tab: ${target}`);
      return;
    }

    try {
      if (target === "dashboard") {
        renderDashboard();
      } else if (renderFunctions[target]) {
        if (target === "age-distribution") {
          renderAgeDistributionChart(false);
        } else if (target === "gender-disease") {
          renderGenderPieChart(false);
        } else if (target === "smoking-disease") {
          renderSmokingChart(false);
        } else if (target === "exercise-disease") {
          renderExerciseChart(false);
        } else if (target === "cholesterol-disease") {
          renderCholesterolChart(false);
        } else if (target === "bmi-disease") {
          renderBMIChart(false);
        } else if (target === "family-history") {
          renderFamilyHistoryChart(false);
        } else if (target === "cholesterol-gender") {
          renderCholesterolGenderChart(false);
        }
      } else {
        console.warn(`Không có hàm render nào được định nghĩa cho tab: ${target}`);
      }
    } catch (err) {
      console.warn(`Không thể vẽ biểu đồ cho ${target}:`, err);
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const activeTab = document.querySelector('.tab.active');
  if (activeTab) {
    const target = activeTab.dataset.target;
    if (target === "dashboard") {
      renderDashboard();
    } else if (renderFunctions[target]) {
      try {
        if (target === "age-distribution") {
          renderAgeDistributionChart(false);
        } else if (target === "gender-disease") {
          renderGenderPieChart(false);
        } else if (target === "smoking-disease") {
          renderSmokingChart(false);
        } else if (target === "exercise-disease") {
          renderExerciseChart(false);
        } else if (target === "cholesterol-disease") {
          renderCholesterolChart(false);
        } else if (target === "bmi-disease") {
          renderBMIChart(false);
        } else if (target === "family-history") {
          renderFamilyHistoryChart(false);
        } else if (target === "cholesterol-gender") {
          renderCholesterolGenderChart(false);
        }
      } catch (err) {
        console.warn(`Không thể vẽ biểu đồ ban đầu cho ${target}:`, err);
      }
    }
  } else {
    const dashboardTab = document.querySelector('[data-target="dashboard"]');
    if (dashboardTab) {
      dashboardTab.click();
    }
  }
});