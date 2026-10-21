// Neutral initial state shown until the Python API loads CSV-backed records.
export const emptyDashboard = {
  summary: { totalBags: 0, allTimeBags: 0, rate: 0, perMinute: 0 },
  hourlyProduction: [],
  yesterdayProduction: [],
  dailyProduction: [],
  allTimeProduction: [],
  godowns: [],
  belts: [],
  cameras: [],
  alerts: [],
  recentEvents: [],
  anomalies: [],
  peakHour: { hour: "No data", bags: 0 },
  downtime: { today: null, yesterday: null },
};
