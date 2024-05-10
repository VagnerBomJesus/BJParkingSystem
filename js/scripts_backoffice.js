// Global variable to store all car data
let allCarData = [];

document
    .getElementById("export-json")
    .addEventListener("click", exportToJson);
document
    .getElementById("export-excel")
    .addEventListener("click", exportToExcel);

document.getElementById('jsonFileInput').addEventListener('change', handleFileSelect, false);


function applyFilters() {
    const date = document.getElementById("filter-date").value;
    const matricula = document
        .getElementById("filter-matricula")
        .value.toLowerCase();
    const paymentMethod = document.getElementById(
        "filter-payment-method"
    ).value;
    const filteredData = allCarData.filter((carro) => {
        const carDate = new Date(carro.entrada).toISOString().split("T")[0];
        const includeByDate = date ? carDate === date : true;
        const includeByMatricula = matricula
            ? carro.matricula.toLowerCase().includes(matricula)
            : true;
        const includeByPayment = paymentMethod
            ? carro.metodoPagamento === paymentMethod
            : true;
        return includeByDate && includeByMatricula && includeByPayment;
    });
    displayData(filteredData);
}

function filterData(period) {
    let filteredData = [];
    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in one day

    if (period === "daily") {
        filteredData = allCarData.filter((carro) => {
            const carDate = new Date(carro.entrada);
            return carDate.toDateString() === today.toDateString();
        });
    } else if (period === "monthly") {
        filteredData = allCarData.filter((carro) => {
            const carDate = new Date(carro.entrada);
            return (
                carDate.getMonth() === today.getMonth() &&
                carDate.getFullYear() === today.getFullYear()
            );
        });
    } else if (period === "yearly") {
        filteredData = allCarData.filter((carro) => {
            const carDate = new Date(carro.entrada);
            return carDate.getFullYear() === today.getFullYear();
        });
    }
    displayData(filteredData);
}

function displayData(data) {
    const tbody = document.getElementById("data-body");
    tbody.innerHTML = ""; // Clear existing data
    data.forEach((carro) => {
        const row = `
     <tr>
       <td>${carro.matricula}</td>
       <td>${carro.marca}</td>
       <td>${carro.vaga}</td>
       <td>${carro.entrada}</td>
       <td>${carro.saida || "-"}</td>
       <td>${calcularTempoEstacionado(carro.entrada, carro.saida)}</td>
       <td>${carro.valorPago || "-"}</td>
       <td>${carro.metodoPagamento || "-"}</td>
     </tr>`;
        tbody.innerHTML += row;
    });
}

function calcularTempoEstacionado(entrada, saida) {
    if (!saida) return "-";
    const diff = new Date(saida) - new Date(entrada);
    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    return `${hours}h ${minutes}m`;
}

function loadData() {
    allCarData = JSON.parse(
        localStorage.getItem("carrosEstacionados") || "[]"
    );
    displayData(allCarData);
}

function exportToJson() {
    const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(allCarData));
    const downloadAnchorNode = document.createElement("a");

    // Obter a data atual e formatá-la
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // Formata como "YYYY-MM-DD"

    // Concatenar a data formatada ao nome do arquivo
    const fileName = `dados_estacionamento_${formattedDate}.json`;

    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function exportToExcel() {
    const data = JSON.parse(
        localStorage.getItem("carrosEstacionados") || "[]"
    );
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    // Obter a data atual e formatá-la
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // Formata como "YYYY-MM-DD"

    // Concatenar a data formatada ao nome do arquivo
    const fileName = `dados_estacionamento_${formattedDate}.xlsx`;


    XLSX.utils.book_append_sheet(wb, ws, "DadosEstacionamento");

    XLSX.writeFile(wb, fileName);
}

document.getElementById('jsonFileInput').addEventListener('change', handleFileSelect, false);

/*function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const jsonData = JSON.parse(e.target.result);
            if (Array.isArray(jsonData)) { // Check if JSON data is an array of objects
                allCarData = jsonData;
                localStorage.setItem("carrosEstacionados", JSON.stringify(allCarData));
                displayData(allCarData);
                alert("Data loaded successfully!");
            } else {
                alert("Invalid file format");
            }
        } catch (ex) {
            alert("Error reading the file: " + ex.message);
        }
    };
    reader.readAsText(file);
}*/

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const newCarData = JSON.parse(e.target.result);
            if (Array.isArray(newCarData)) { // Check if JSON data is an array of objects
                // Retrieve existing data from local storage
                const existingCarData = JSON.parse(localStorage.getItem("carrosEstacionados") || '[]');
                // Merge new data with existing data
                const mergedCarData = existingCarData.concat(newCarData);
                localStorage.setItem("carrosEstacionados", JSON.stringify(mergedCarData));
                allCarData = mergedCarData;
                displayData(allCarData);
                alert("Data loaded and merged successfully!");
            } else {
                alert("Invalid file format");
            }
        } catch (ex) {
            alert("Error reading the file: " + ex.message);
        }
    };
    reader.readAsText(file);
}




function loadJSONData() {
    const input = document.getElementById('jsonFileInput');
    if (input.files.length === 0) {
        alert('Please select a file first!');
        return;
    }
    handleFileSelect({ target: { files: input.files } });
}

function generateRevenueByDateChart() {
    const data = JSON.parse(localStorage.getItem("carrosEstacionados") || '[]');
    const dailyRevenue = {};

    // Organize revenue by date and payment method
    data.forEach(carro => {
        const date = new Date(carro.entrada).toISOString().split('T')[0];
        if (!dailyRevenue[date]) {
            dailyRevenue[date] = {};
        }
        if (dailyRevenue[date][carro.metodoPagamento]) {
            dailyRevenue[date][carro.metodoPagamento] += parseFloat(carro.valorPago);
        } else {
            dailyRevenue[date][carro.metodoPagamento] = parseFloat(carro.valorPago);
        }
    });

    const dates = Object.keys(dailyRevenue).sort();
    const datasets = [];
    const paymentMethods = new Set();

    // Collect all payment methods
    dates.forEach(date => {
        Object.keys(dailyRevenue[date]).forEach(method => {
            paymentMethods.add(method);
        });
    });

    // Create datasets for each payment method
    paymentMethods.forEach(method => {
        const data = dates.map(date => dailyRevenue[date][method] || 0);
        datasets.push({
            label: method,
            data: data,
            fill: false,
            borderColor: randomColor(), // function to generate a random color
            tension: 0.1
        });
    });

    const ctx = document.getElementById('revenueChart').getContext('2d');
    const revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: datasets
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Helper function to generate a random color for each dataset
function randomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
}

function generateRevenueChart() {
    const data = JSON.parse(localStorage.getItem("carrosEstacionados") || '[]');
    const paymentMethods = {};

    // Calculate total revenue per payment method
    data.forEach(carro => {
        if (paymentMethods[carro.metodoPagamento]) {
            paymentMethods[carro.metodoPagamento] += parseFloat(carro.valorPago);
        } else {
            paymentMethods[carro.metodoPagamento] = parseFloat(carro.valorPago);
        }
    });

    const ctx = document.getElementById('parkingChart').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(paymentMethods),
            datasets: [{
                label: 'Total Revenue (€)',
                data: Object.values(paymentMethods),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}


// JavaScript code to toggle charts
function toggleCharts() {
    var chartContainer = document.getElementById('chartContainer');
    var chartContainer2 = document.getElementById('chartContainer2');
    
    if (chartContainer.style.display === 'none' || chartContainer2.style.display === 'none') {
        chartContainer.style.display = 'block';
        chartContainer2.style.display = 'block';
    } else {
        chartContainer.style.display = 'none';
        chartContainer2.style.display = 'none';
    }
}

//window.onload = loadData;
window.onload = function () {
    loadData();
    generateRevenueChart(); // Generate the chart after data is loaded
    generateRevenueByDateChart()


};
