// script.js
const API_URL = "https://mindicador.cl/api";
let chartInstance = null;

document.getElementById("convert-btn").addEventListener("click", async () => {
  const amount = parseFloat(document.getElementById("amount").value);
  const currency = document.getElementById("currency").value;

  if (isNaN(amount) || amount <= 0) {
    document.getElementById("result").innerText = "Por favor, ingresa un monto válido.";
    return;
  }

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Error al obtener los datos de la API");

    const data = await response.json();
    const selectedCurrency = data[currency];
    
    if (!selectedCurrency) {
      document.getElementById("result").innerText = "Moneda no disponible.";
      return;
    }

    const rate = selectedCurrency.valor;
    const result = amount / rate;

    document.getElementById("result").innerText = `El monto convertido es: ${result.toFixed(2)} ${selectedCurrency.nombre}`;

    const response_hist = await fetch(API_URL+`/${selectedCurrency.codigo}`)
    const data_hist = await response_hist.json()
    const historicalData = data_hist.serie?.slice(0, 10) || [];
    if (historicalData.length > 0) {
      const dates = historicalData.map(entry => new Date(entry.fecha).toLocaleDateString());
      const values = historicalData.map(entry => entry.valor);

      renderChart(dates, values, selectedCurrency.nombre);
    } else {
      document.getElementById("result").innerText += "\nNo hay datos históricos disponibles.";
    }
  } catch (error) {
    document.getElementById("result").innerText = `Error: ${error.message}`;
  }
});

function renderChart(labels, data, currencyName) {
  const ctx = document.getElementById("chart").getContext("2d");
// Destruye el gráfico existente si ya hay uno
if (chartInstance) {
  chartInstance.destroy();
}

// Crea una nueva instancia del gráfico
chartInstance = new Chart(ctx, {
  type: "line",
  data: {
    labels,
    datasets: [{
      label: `Historial últimos 10 días (${currencyName})`,
      data,
      borderColor: "cadetblue",
      fill: false,
    }],
  },
  options: {
    responsive: true,
    scales: {
      x: {
        title: { display: true, text: "Fecha" },
      },
      y: {
        title: { display: true, text: "Valor" },
      },
    },
  },
});
}