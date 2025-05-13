# Heart Disease Data Visualization

## Project Overview

This project aims to explore and visualize a dataset related to heart disease. It uses various charts and graphs to represent different factors and their correlation with heart disease. The visualizations are interactive and built using web technologies, primarily D3.js.

## Dataset

The primary dataset used for this project is `project_heart_disease.csv`. This dataset contains various anonymized patient attributes, including age, gender, cholesterol levels, smoking habits, family history of heart disease, and whether they have heart disease.

The dataset can be found in:
- `problems-statement/dataset.csv` (original dataset for reference)
- `source/dataset.csv` (dataset used by the application)

## Features & Visualizations

The project includes a dashboard view and individual tabs for different visualizations:

1.  **Dashboard**: Provides an overview with multiple charts displayed simultaneously.
2.  **Age Distribution**: Visualizes the distribution of heart disease across different age groups. ([source/chart/task1.js](source/chart/task1.js))
3.  **Gender and Disease**: Shows the proportion of heart disease cases between genders. ([source/chart/task2.js](source/chart/task2.js))
4.  **Smoking and Disease**: Illustrates the relationship between smoking habits and heart disease. ([source/chart/task3.js](source/chart/task3.js))
5.  **Exercise and Disease**: Displays how exercise frequency relates to heart disease. ([source/chart/task4.js](source/chart/task4.js))
6.  **Cholesterol and Disease**: Visualizes the link between cholesterol levels and heart disease. ([source/chart/task5.js](source/chart/task5.js))
7.  **BMI and Disease**: Shows the correlation between Body Mass Index (BMI) and heart disease. ([source/chart/task6.js](source/chart/task6.js))
8.  **Family History and Disease**: Represents the impact of family history of heart disease. ([source/chart/task7.js](source/chart/task7.js))
9.  **Cholesterol by Gender**: Compares cholesterol levels between genders, potentially in relation to heart disease. ([source/chart/task8.js](source/chart/task8.js))

## Technologies Used

*   **HTML**: For the basic structure of the web page ([source/index.html](source/index.html)).
*   **CSS**: For styling the visual elements ([source/style.css](source/style.css)).
*   **JavaScript (ES6 Modules)**: For interactivity and data manipulation.
*   **D3.js**: The primary library used for creating dynamic and interactive data visualizations.

## Project Structure

```
.
├── .gitignore
├── LICENSE
├── README.md
├── problems-statement/
│   ├── dataset.csv         # Original dataset file
│   └── project.pdf         # Project description (if any)
└── source/
    ├── dataset.csv         # Dataset used by the application
    ├── index.html          # Main HTML file
    ├── style.css           # CSS styles
    ├── chart/              # JavaScript files for charts
    │   ├── main.js         # Main script to orchestrate chart rendering and tabs
    │   ├── task1.js        # Age Distribution Chart
    │   ├── task2.js        # Gender & Disease Chart
    │   ├── task3.js        # Smoking & Disease Chart
    │   ├── task4.js        # Exercise & Disease Chart
    │   ├── task5.js        # Cholesterol & Disease Chart
    │   ├── task6.js        # BMI & Disease Chart
    │   ├── task7.js        # Family History & Disease Chart / Clustered Stacked Chart
    │   └── task8.js        # Cholesterol by Gender Chart
    ├── constants/
    │   └── index.js        # (Potentially for constant values)
    └── utils/
        └── index.js        # (Potentially for utility functions)
```

## Setup and Usage

1.  Clone the repository or download the source code.
2.  Navigate to the `source/` directory.
3.  Open the `index.html` file in a modern web browser (e.g., Chrome, Firefox, Edge).

The visualizations will be loaded, and you can switch between different charts using the tabs or view the dashboard.

## Implemented Tasks

The `source/chart/` directory contains the JavaScript logic for each visualization:

*   **`task1.js`**: Implements [`renderAgeDistributionChart`](source/chart/task1.js) which shows a stacked bar chart of heart disease presence ('Yes'/'No') across different age groups. It supports rendering in both a detailed view and a compact dashboard view.
*   **`task2.js`**: Implements [`renderGenderPieChart`](source/chart/main.js) (imported in `main.js`) to display the distribution of heart disease by gender using a pie chart.
*   **`task3.js`**: Implements [`renderSmokingChart`](source/chart/main.js) (imported in `main.js`) to visualize the relationship between smoking status and heart disease.
*   **`task4.js`**: Implements [`renderExerciseChart`](source/chart/main.js) (imported in `main.js`) to show how exercise frequency correlates with heart disease.
*   **`task5.js`**: Implements [`renderCholesterolChart`](source/chart/main.js) (imported in `main.js`) to illustrate the connection between cholesterol levels and heart disease.
*   **`task6.js`**: Implements [`renderBMIChart`](source/chart/main.js) (imported in `main.js`) to display the relationship between BMI and heart disease.
*   **`task7.js`**: Implements [`renderFamilyHistoryChart`](source/chart/task7.js) for visualizing heart disease based on family history and [`renderClusteredStackedChart`](source/chart/task7.js) for a more complex view, possibly combining family history and smoking status.
*   **`task8.js`**: Implements [`renderCholesterolGenderChart`](source/chart/main.js) (imported in `main.js`) to compare cholesterol levels across genders.

The main orchestration logic, tab handling, and dashboard rendering are managed by `source/chart/main.js`.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.