import React from 'react';
import { TrendingUp, Calendar, Zap, RefreshCw } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function SalesForecasting({ salesData }) {
  // Sort data chronologically
  const sortedData = [...salesData].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Separate and align historical vs forecast
  const historical = sortedData.filter(d => !d.isForecast);
  const forecast = sortedData.filter(d => d.isForecast);
  
  // Find the last historical day to bridge the line chart smoothly
  const lastHistorical = historical[historical.length - 1];

  const chartData = [];
  
  // Push historical
  historical.forEach(d => {
    chartData.push({
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      Historical: d.revenue,
      Forecast: null
    });
  });

  // Push bridge point (last historical is the first forecast dot)
  if (lastHistorical) {
    chartData.push({
      date: new Date(lastHistorical.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      Historical: lastHistorical.revenue,
      Forecast: lastHistorical.revenue
    });
  }

  // Push forecast points
  forecast.forEach(d => {
    chartData.push({
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      Historical: null,
      Forecast: d.revenue
    });
  });

  // Compute stats for forecasting cards
  const totalForecastedRevenue = forecast.reduce((sum, d) => sum + d.revenue, 0);
  const avgForecastedRevenue = forecast.length > 0 ? totalForecastedRevenue / forecast.length : 0;
  const lastHistoricalAvg = historical.slice(-7).reduce((sum, d) => sum + d.revenue, 0) / 7;
  
  // growth percentage predicted
  const predictedGrowth = lastHistoricalAvg > 0 
    ? ((avgForecastedRevenue - lastHistoricalAvg) / lastHistoricalAvg * 100).toFixed(1)
    : 0;

  return (
    <div className="dashboard-viewport">
      {/* Forecasting KPI Row */}
      <div className="kpi-grid">
        <div className="kpi-card" style={{ gridColumn: 'span 2' }}>
          <div className="kpi-header">
            <span className="kpi-title">Next 7-Day Revenue Projection</span>
            <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--mcd-gold-glow)' }}>
              <TrendingUp className="nav-icon" style={{ color: 'var(--mcd-gold)' }} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: 'var(--mcd-gold)', fontSize: '32px' }}>
            ${totalForecastedRevenue.toLocaleString()}
          </div>
          <div className="kpi-header" style={{ marginBottom: 0 }}>
            <span className="kpi-change-indicator positive">
              {parseFloat(predictedGrowth) >= 0 ? '+' : ''}{predictedGrowth}%
            </span>
            <span className="kpi-subtitle">vs. trailing 7-day average</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Forecast Confidence Level</span>
            <div className="kpi-icon-wrapper" style={{ backgroundColor: 'rgba(0,230,118,0.1)' }}>
              <Zap className="nav-icon" style={{ color: 'var(--success)' }} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: 'var(--success)' }}>94.8%</div>
          <div className="kpi-header" style={{ marginBottom: 0 }}>
            <span className="kpi-subtitle">Model: SARIMA-Exponential Smoothing</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Projected Daily Average</span>
            <div className="kpi-icon-wrapper">
              <Calendar className="nav-icon" />
            </div>
          </div>
          <div className="kpi-value">${Math.round(avgForecastedRevenue).toLocaleString()}</div>
          <div className="kpi-header" style={{ marginBottom: 0 }}>
            <span className="kpi-subtitle">Expected peak days: Friday/Saturday</span>
          </div>
        </div>
      </div>

      {/* Primary Forecast Chart */}
      <div className="chart-card">
        <div className="chart-header">
          <div className="page-title-section">
            <h3 className="chart-title">Predictive Sales Timeline</h3>
            <span className="page-subtitle">30-day historical records transitioning into a 7-day machine-learning prediction boundary</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '12px' }}>
            <RefreshCw size={14} className="animate-spin" />
            <span>Updated hourly</span>
          </div>
        </div>
        <div className="chart-container" style={{ height: '360px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="historicalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--mcd-gold)" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="var(--mcd-gold)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--mcd-red)" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="var(--mcd-red)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={11} />
              <YAxis stroke="var(--text-secondary)" fontSize={11} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}
                formatter={(value) => [`$${value.toLocaleString()}`, null]}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="Historical" 
                stroke="var(--mcd-gold)" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#historicalGrad)"
              />
              <Area 
                type="monotone" 
                dataKey="Forecast" 
                stroke="var(--mcd-red)" 
                strokeWidth={3} 
                strokeDasharray="4 4"
                fillOpacity={1} 
                fill="url(#forecastGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Forecast Breakdown Table */}
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">7-Day Projected Sales Schedule</h3>
        </div>
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Projection Date</th>
                <th>Day of Week</th>
                <th style={{ textAlign: 'right' }}>Forecasted Revenue</th>
                <th style={{ textAlign: 'right' }}>Confidence Range (95% CI)</th>
                <th>Demand Level Indicator</th>
                <th>Key Order Channels</th>
              </tr>
            </thead>
            <tbody>
              {forecast.map((d, index) => {
                const dateObj = new Date(d.date);
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                const confidenceMin = Math.round(d.revenue * 0.94);
                const confidenceMax = Math.round(d.revenue * 1.06);
                
                let demandLevel = 'Normal';
                let demandColor = 'badge-none';
                if (d.revenue > avgForecastedRevenue * 1.1) {
                  demandLevel = 'Peak Sales';
                  demandColor = 'badge-high';
                } else if (d.revenue < avgForecastedRevenue * 0.95) {
                  demandLevel = 'Moderate';
                  demandColor = 'badge-low';
                }

                // Determine channel distribution preview
                const primaryChannel = Object.entries(d.channels)
                  .sort((a, b) => b[1] - a[1])[0][0];
                const channelLabel = primaryChannel === 'driveThru' ? 'Drive-Thru Focus' 
                                  : primaryChannel === 'delivery' ? 'Delivery Heavy' 
                                  : primaryChannel === 'kiosk' ? 'Self-Service Kiosks' : 'Dine-In Focus';

                return (
                  <tr key={index}>
                    <td style={{ fontWeight: 'bold' }}>{d.date}</td>
                    <td>{dayName}</td>
                    <td style={{ textAlign: 'right', color: 'var(--mcd-gold)', fontWeight: '600' }}>
                      ${d.revenue.toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                      ${confidenceMin.toLocaleString()} - ${confidenceMax.toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge ${demandColor}`}>{demandLevel}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{channelLabel}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
