export const CSV_FILE_PATH = "../project_heart_disease.csv";

export const TASK_7 = {
    DATA_TARGET: 'family-history',
    ATTRIBUTES: {
        src: "Family Heart Disease",
        dest: "Heart Disease Status",
    },
    STATUS_VALUES: ["Yes", "No"],
    STACK_KEYS: ["withoutDisease", "withDisease"],
    COLOR_RANGE: ["lightblue", "#FF9999"],
    CHART_DIMENSIONS: {
        width: 900,
        height: 400,
        margin: { top: 40, right: 160, bottom: 60, left: 60 }
    },
    TITLES: {
        chartTitle: "Distribution of Heart Disease by Family History",
        yAxisTitle: "Number of Patients",
        xAxisTitle: "Family History of Heart Disease",
    }
};
