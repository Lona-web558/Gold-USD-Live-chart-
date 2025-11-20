//goldusd live chart javascript

//mock API configuration

const MOCK_API_CONFIG = {
	basePrice : 2650, 
	volatility : 5, 
	updateInterval : 2000
};


//chart data


const chartData = {
	labels: [], 
	datasets: [{
		label: 'Gold Price (USD)', 
		data: [], 
		borderColor: '#d4af37', 
		backgroundColor: 'rgba(212, 175, 55, 0.1)', 
		borderWidth: 2,
		tension: 0.4,
		fill: true, 
		pointRadius: 0,
		pointHoverRadius: 5
	}]
};

//chart configuration

const config = {
	type: 'line', 
	data: chartData, 
	options: {
		responsive: true, 
		maintainAspectRatio: false, 
		animation: {
			duration: 750
		}, 
		plugins: {
			legend: {
				display: true, 
				position: 'top', 
			}, 
			tooltip: {
				mode: 'index', 
				intersect: false, 
				callbacks: {
					label: function (context) {
						return 'Price: $' + context.parsed.y.toFixed(2);
					}
				}
			}
		}, 
		scales: {
			x: {
				display: true, 
				title: {
					display: true, 
					text: 'Time'
				}, 
				ticks: {
					maxTicksLimit:10
				}
			}, 
			y: {
				display: true, 
				title: {
					display: true, 
					text: 'Price (USD)' 
				}, 
				ticks: {
					callback: function(value) {
						return '$' + value.toFixed(2);
					}
				}
			}
		}, 
		interaction: {
			mode: 'nearest', 
			axis: 'x', 
			intersect: false
		}
	}
};

//initialize chart

const ctx = document.getElementById('goldChart').getContext('2d');
const chart = new Chart(ctx, config);


//State management 

let isRunning = true;
let updateTimer = null;
let previousPrice = MOCK_API_CONFIG.basePrice;
let currentPrice = MOCK_API_CONFIG.basePrice;

//Mock API - Simulates fetching Gold price 

function fetchGoldPrice() {
	return new Promise((resolve) => {
		setTimeout(() => {
			//generate realistic price movement
			const change = (Math.random() - 0.5) * MOCK_API_CONFIG.volatility * 2;
			const trend = (Math.random() - 0.48) * 0.5; // Slight upward bias 
			currentPrice = currentPrice + change + trend;
			
			//keep price between reasonable bounds 
			currentPrice = Math.max(2500, Math.min(2800, currentPrice));
			
			resolve({
				price: currentPrice, 
				timestamp: new Date().toLocaleTimeString()
			});
		}, 100);
	});
} 
	
	
//update chart with new data 
async function updateChart() {
	const data = await fetchGoldPrice();
	
	//Add new data point 
	chartData.labels.push(data.timestamp);
	chartData.datasets[0].data.push(data.price);
	
	//keep only last 20 data points 
	
	if (chartData.labels.length > 20) {
		chartData.labels.shift();
		chartData.datasets[0].data.shift();
	}
	
	//update chart
	chart.update('none');
	
	//update price display 
 
	updatePriceDisplay(data.price);
}

//update price display 


function updatePriceDisplay(price) {
	const priceElement = document.getElementById('currentPrice');
	const changeElement = document.getElementById('priceChange');
	
	priceElement.textContent = '$' + price.toFixed(2);
	
	const change = price - previousPrice;
	const changePercent = (change / previousPrice) * 100;
	
	if (change > 0) {
		changeElement.textContent = `+$${change.toFixed(2)} (+${changePercent.toFixed(2)}%)`;
		changeElement.className = 'price-change positive';
	} else if (change < 0) {
		changeElement.textContent = `-$${Math.abs(change).toFixed(2)} (${changePercent.toFixed(2)}%)`;
		changeElement.className = 'price-change negative';
	} else {
		changeElement.textContent = '$0.00 (0.00%)';
		changeElement.className = 'price-change';
	}
	
	previousPrice = price;
}

//start/stop updates

function toggleUpdates() {
	const btn = document.getElementById('toggleBtn');
	const status = document.getElementById('status');
	
	if (isRunning) {
		clearInterval(updateTimer);
		btn.textContent = 'Resume Updates';
		status.textContent = 'Paused';
		status.className = 'status paused';
		isRunning = false;
	} else {
		startUpdates();
		btn.textContent = 'Pause Updates';
		status.textContent = 'Live';
		status.className = 'status live';
		isRunning = true;
	}
}


//Reset chart

function resetChart() {
	chartData.labels = [];
	chartData.datasets[0].data = [];
	currentPrice = MOCK_API_CONFIG.basePrice;
	previousPrice = MOCK_API_CONFIG.basePrice;
	chart.update();
	document.getElementById('priceChange').textContent = '---';
}

//start periodic updates

function startUpdates() {
	updateTimer = setInterval(updateChart, MOCK_API_CONFIG.updateInterval);
}

//event listeners

document.getElementById('toggleBtn').addEventListener('click', toggleUpdates);
document.getElementById('resetBtn').addEventListener('click', resetChart);

//Initialize with some data

async function initialize() {
	for (let i = 0; i < 10; i++) {
		await updateChart();
	}
	startUpdates();
}
initialize();