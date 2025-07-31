// const fileInput = document.getElementById('fileInput');
// const plotDiv = document.getElementById('plot');

// // Store all points after user upload
// let dataPoints = [];
// let groups = [];

// fileInput.addEventListener('change', handleFileUpload);

// function handleFileUpload(event) {
//   const file = event.target.files[0];
//   if (!file) return;

//   const reader = new FileReader();
//   reader.onload = (e) => {
//     const content = e.target.result;
//     dataPoints = parseCSV(content);

//     // Get unique groups
//     groups = [...new Set(dataPoints.map(d => d.group))];

//     // Build violin traces
//     const traces = groups.map(group => ({
//       type: 'violin',
//       y: dataPoints.filter(d => d.group === group).map(d => d.value),
//       name: group,
//       box: { visible: true },
//       line: { color: 'blue' },
//       points: 'all', // show all points
//       jitter: 0.5,
//       scalemode: 'count'
//     }));

//     const layout = {
//       title: 'Interactive Violin Plot with Zoom Crop Detection',
//       yaxis: { zeroline: false },
//       dragmode: 'zoom',
//     };

//     Plotly.newPlot(plotDiv, traces, layout);
//   };
//   reader.readAsText(file);
// }

// // Simple CSV parser: expects headers `group,value`
// function parseCSV(csvText) {
//   const lines = csvText.trim().split(/\r?\n/);
//   const data = [];
//   const header = lines[0].split(',').map(h => h.trim().toLowerCase());

//   const groupIdx = header.indexOf('group');
//   const valueIdx = header.indexOf('value');

//   for (let i = 1; i < lines.length; i++) {
//     const cols = lines[i].split(',');
//     if (cols.length < 2) continue;

//     const group = cols[groupIdx].trim();
//     const value = parseFloat(cols[valueIdx]);
//     if (!isNaN(value)) {
//       data.push({ group, value });
//     }
//   }
//   return data;
// }

// // Function to get visible (cropped) data as CSV
// function getVisibleDataAsCSV() {
//   if (!dataPoints.length) return '';

//   const yRange = plotDiv.layout.yaxis.range || [
//     Math.min(...dataPoints.map(d => d.value)),
//     Math.max(...dataPoints.map(d => d.value))
//   ];
//   const [yMin, yMax] = yRange;

//   const xRange = plotDiv.layout.xaxis.range;

//   const visiblePoints = dataPoints.filter(d => {
//     const withinY = d.value >= yMin && d.value <= yMax;
//     let withinX = true;
//     if (xRange) {
//       // For categorical x-axis, use index mapping
//       const xIndex = groups.indexOf(d.group);
//       withinX = xIndex >= xRange[0] && xIndex <= xRange[1];
//     }
//     return withinY && withinX;
//   });

//   // Convert visible points to CSV string
//   const csvHeader = 'group,value\n';
//   const csvRows = visiblePoints.map(d => `${d.group},${d.value}`).join('\n');
//   return csvHeader + csvRows;
// }

// // Listen to relayout event to detect crop changes
// plotDiv.on('plotly_relayout', () => {
//   const csv = getVisibleDataAsCSV();
//   console.log('Cropped CSV:\n' + csv); // <-- You can handle it externally
// });
