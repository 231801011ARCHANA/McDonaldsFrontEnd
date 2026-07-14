import React, { useState } from 'react';
import { Award, Clock, Star, MapPin } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { STORES } from '../utils/mockData';

export default function StorePerformance({ salesData }) {
  const [metricSelector, setMetricSelector] = useState('revenue'); // revenue, serviceTime, orders

  const historical = salesData.filter(d => !d.isForecast);

  // Aggregate metrics per store
  const storeMetrics = STORES.map(store => {
    const storeDaily = historical.filter(d => d.storeId === store.id);
    const revenue = storeDaily.reduce((sum, d) => sum + d.revenue, 0);
    const orders = storeDaily.reduce((sum, d) => sum + d.ordersCount, 0);
    const aov = orders > 0 ? revenue / orders : 0;
    
    return {
      ...store,
      revenue,
      orders,
      aov
    };
  }).filter(s => s.revenue > 0); // only show stores in active scope (if region filtered)

  // Sort store performance
  const sortedByRevenue = [...storeMetrics].sort((a, b) => b.revenue - a.revenue);
  const bestStore = sortedByRevenue[0] || null;
  
  const sortedByServiceTime = [...storeMetrics].sort((a, b) => b.avgServiceTime - a.avgServiceTime);
  const worstServiceStore = sortedByServiceTime[0] || null;

  // Chart Data preparation
  const chartData = storeMetrics.map(s => ({
    name: s.name.split(',')[0], // just the city/neighborhood
    Revenue: s.revenue,
    Orders: s.orders,
    'Avg Service Time (s)': s.avgServiceTime
  }));

  const getMetricLabel = () => {
    if (metricSelector === 'revenue') return 'Revenue ($)';
    if (metricSelector === 'orders') return 'Orders (Count)';
    return 'Avg Service Time (seconds)';
  };

  const getMetricDataKey = () => {
    if (metricSelector === 'revenue') return 'Revenue';
    if (metricSelector === 'orders') return 'Orders';
    return 'Avg Service Time (s)';
  };

  const getMetricColor = () => {
    if (metricSelector === 'revenue') return 'var(--mcd-gold)';
    if (metricSelector === 'orders') return '#2979ff';
    return 'var(--mcd-red)';
  };

  return (
    <div className="dashboard-viewport">
      {/* Store Diagnostic KPI cards */}
      <div className="kpi-grid">
        {bestStore && (
          <div className="kpi-card" style={{ gridColumn: 'span 2' }}>
            <div className="kpi-header">
              <span className="kpi-title">Highest Grossing Branch</span>
              <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--mcd-gold-glow)' }}>
                <Award className="nav-icon" style={{ color: 'var(--mcd-gold)' }} />
              </div>
            </div>
            <div className="kpi-value" style={{ fontSize: '24px' }}>{bestStore.name}</div>
            <div className="kpi-header" style={{ marginBottom: 0, marginTop: '8px' }}>
              <span className="kpi-change-indicator positive" style={{ color: 'var(--mcd-gold)' }}>
                ${bestStore.revenue.toLocaleString()}
              </span>
              <span className="kpi-subtitle">{bestStore.orders.toLocaleString()} total transactions</span>
            </div>
          </div>
        )}

        {worstServiceStore && (
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-title">Critical Service Bottleneck</span>
              <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--mcd-red-glow)' }}>
                <Clock className="nav-icon" style={{ color: 'var(--mcd-red)' }} />
              </div>
            </div>
            <div className="kpi-value" style={{ fontSize: '22px', color: 'var(--danger)' }}>
              {worstServiceStore.avgServiceTime} seconds
            </div>
            <div className="kpi-header" style={{ marginBottom: 0, marginTop: '10px' }}>
              <span className="kpi-subtitle" style={{ color: 'var(--text-secondary)' }}>
                Store ID #{worstServiceStore.id} ({worstServiceStore.name.split(',')[0]})
              </span>
            </div>
          </div>
        )}

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Target Service speed</span>
            <div className="kpi-icon-wrapper">
              <Clock className="nav-icon" />
            </div>
          </div>
          <div className="kpi-value">150s</div>
          <div className="kpi-header" style={{ marginBottom: 0 }}>
            <span className="kpi-subtitle">Global McDonald's standard speed</span>
          </div>
        </div>
      </div>

      {/* Interactive Stores Comparison Chart */}
      <div className="chart-card">
        <div className="chart-header">
          <div className="page-title-section">
            <h3 className="chart-title">Diagnostic Store Comparison Chart</h3>
            <span className="page-subtitle">Compare performance metrics across selected branches</span>
          </div>
          {/* Toggle Metrics selector */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="filter-select" 
              style={{ backgroundColor: metricSelector === 'revenue' ? 'var(--mcd-gold)' : '', color: metricSelector === 'revenue' ? '#000' : '' }}
              onClick={() => setMetricSelector('revenue')}
            >
              Revenue
            </button>
            <button 
              className="filter-select"
              style={{ backgroundColor: metricSelector === 'orders' ? 'var(--mcd-gold)' : '', color: metricSelector === 'orders' ? '#000' : '' }}
              onClick={() => setMetricSelector('orders')}
            >
              Orders
            </button>
            <button 
              className="filter-select"
              style={{ backgroundColor: metricSelector === 'serviceTime' ? 'var(--mcd-gold)' : '', color: metricSelector === 'serviceTime' ? '#000' : '' }}
              onClick={() => setMetricSelector('serviceTime')}
            >
              Service Time
            </button>
          </div>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
              <YAxis stroke="var(--text-secondary)" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }} />
              <Bar dataKey={getMetricDataKey()} fill={getMetricColor()} radius={[4, 4, 0, 0]} />
              {metricSelector === 'serviceTime' && (
                <ReferenceLine y={150} stroke="var(--warning)" strokeDasharray="3 3" label={{ value: 'Target: 150s', fill: 'var(--warning)', fontSize: 10, position: 'insideTopLeft' }} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Complete Operations Grid Table */}
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Branch Operations Table</h3>
        </div>
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Branch Name</th>
                <th>Region</th>
                <th style={{ textAlign: 'right' }}>Total Revenue</th>
                <th style={{ textAlign: 'right' }}>Total Transactions</th>
                <th style={{ textAlign: 'right' }}>Avg Order Ticket</th>
                <th style={{ textAlign: 'right' }}>Avg Service Speed</th>
                <th style={{ textAlign: 'center' }}>CSAT Rating</th>
              </tr>
            </thead>
            <tbody>
              {storeMetrics.map((store, index) => {
                const serviceColor = store.avgServiceTime > 180 ? 'var(--danger)' 
                                   : store.avgServiceTime > 150 ? 'var(--warning)' : 'var(--success)';
                
                return (
                  <tr key={index}>
                    <td style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>#{store.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={14} style={{ color: 'var(--mcd-gold)' }} />
                        <span>{store.name}</span>
                      </div>
                    </td>
                    <td>{store.region}</td>
                    <td style={{ textAlign: 'right', fontWeight: '600' }}>${store.revenue.toLocaleString()}</td>
                    <td style={{ textAlign: 'right' }}>{store.orders.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>${store.aov.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', color: serviceColor, fontWeight: 'bold' }}>
                      {store.avgServiceTime}s
                      {store.avgServiceTime > 180 && <span className="badge badge-high" style={{ marginLeft: '8px', padding: '2px 4px', fontSize: '9px' }}>Slow</span>}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <Star size={12} fill="var(--mcd-gold)" stroke="var(--mcd-gold)" />
                        <span style={{ fontWeight: '600' }}>{store.rating}</span>
                      </div>
                    </td>
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
