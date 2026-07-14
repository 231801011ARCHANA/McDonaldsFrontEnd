import React from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Smartphone, 
  Car, 
  Monitor, 
  UserCheck 
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';

export default function Overview({ salesData, customerData, activeStore }) {
  // Separate historical from forecast
  const historical = salesData.filter(d => !d.isForecast);
  
  // Calculate aggregate metrics
  const totalRevenue = historical.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = historical.reduce((sum, d) => sum + d.ordersCount, 0);
  const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;
  const activeLoyaltyCustomers = customerData.length;

  // Calculate comparative growth (last 7 days vs preceding 7 days of historical)
  let revenueGrowth = 5.2; // default mock fallback
  let ordersGrowth = 3.8;
  
  if (historical.length >= 14) {
    const sorted = [...historical].sort((a, b) => new Date(a.date) - new Date(b.date));
    const mid = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, mid);
    const secondHalf = sorted.slice(mid);
    
    const rev1 = firstHalf.reduce((sum, d) => sum + d.revenue, 0);
    const rev2 = secondHalf.reduce((sum, d) => sum + d.revenue, 0);
    if (rev1 > 0) {
      revenueGrowth = parseFloat(((rev2 - rev1) / rev1 * 100).toFixed(1));
    }

    const ord1 = firstHalf.reduce((sum, d) => sum + d.ordersCount, 0);
    const ord2 = secondHalf.reduce((sum, d) => sum + d.ordersCount, 0);
    if (ord1 > 0) {
      ordersGrowth = parseFloat(((ord2 - ord1) / ord1 * 100).toFixed(1));
    }
  }

  // Aggregate channels distribution
  const channelsAgg = historical.reduce((acc, d) => {
    acc.delivery += d.channels.delivery || 0;
    acc.driveThru += d.channels.driveThru || 0;
    acc.kiosk += d.channels.kiosk || 0;
    acc.dineIn += d.channels.dineIn || 0;
    return acc;
  }, { delivery: 0, driveThru: 0, kiosk: 0, dineIn: 0 });

  const channelChartData = [
    { name: 'Delivery', value: channelsAgg.delivery, color: '#ffbc0d' },    // MCD Gold
    { name: 'Drive-Thru', value: channelsAgg.driveThru, color: '#db0007' },  // MCD Red
    { name: 'Kiosk', value: channelsAgg.kiosk, color: '#00e676' },          // Success Green
    { name: 'Dine-In', value: channelsAgg.dineIn, color: '#2979ff' }        // Accent Blue
  ];

  // Daily timeline charts data (compress to fit nicely)
  const dailyTimelineData = historical.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Revenue: d.revenue,
    Orders: d.ordersCount
  }));

  // Store performance rankings
  const storeMap = historical.reduce((acc, d) => {
    if (!acc[d.storeName]) {
      acc[d.storeName] = { name: d.storeName, region: d.region, revenue: 0, orders: 0 };
    }
    acc[d.storeName].revenue += d.revenue;
    acc[d.storeName].orders += d.ordersCount;
    return acc;
  }, {});

  const storeRankings = Object.values(storeMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="dashboard-viewport">
      {/* KPIs Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Gross Revenue</span>
            <div className="kpi-icon-wrapper">
              <DollarSign className="nav-icon" />
            </div>
          </div>
          <div className="kpi-value">${totalRevenue.toLocaleString()}</div>
          <div className="kpi-header" style={{ marginBottom: 0 }}>
            <span className={`kpi-change-indicator ${revenueGrowth >= 0 ? 'positive' : 'negative'}`}>
              {revenueGrowth >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {Math.abs(revenueGrowth)}%
            </span>
            <span className="kpi-subtitle">vs. previous period</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Orders</span>
            <div className="kpi-icon-wrapper">
              <ShoppingBag className="nav-icon" />
            </div>
          </div>
          <div className="kpi-value">{totalOrders.toLocaleString()}</div>
          <div className="kpi-header" style={{ marginBottom: 0 }}>
            <span className={`kpi-change-indicator ${ordersGrowth >= 0 ? 'positive' : 'negative'}`}>
              {ordersGrowth >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {Math.abs(ordersGrowth)}%
            </span>
            <span className="kpi-subtitle">vs. previous period</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Avg Order Ticket</span>
            <div className="kpi-icon-wrapper">
              <TrendingUp className="nav-icon" />
            </div>
          </div>
          <div className="kpi-value">${avgOrderValue.toFixed(2)}</div>
          <div className="kpi-header" style={{ marginBottom: 0 }}>
            <span className="kpi-change-indicator positive" style={{ color: 'var(--text-secondary)' }}>
              Standard order basket
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Active Loyalty Users</span>
            <div className="kpi-icon-wrapper">
              <Users className="nav-icon" />
            </div>
          </div>
          <div className="kpi-value">{activeLoyaltyCustomers.toLocaleString()}</div>
          <div className="kpi-header" style={{ marginBottom: 0 }}>
            <span className="kpi-change-indicator positive">
              <UserCheck size={16} /> Live Profiles
            </span>
            <span className="kpi-subtitle">in selected region</span>
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="analytics-grid">
        {/* Timeline Chart */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <div className="page-title-section">
              <h3 className="chart-title">Descriptive Sales & Transaction Volume</h3>
              <span className="page-subtitle">Daily trend analysis of revenue and order counts</span>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTimelineData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--mcd-gold)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--mcd-gold)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={11} />
                <YAxis yAxisId="left" stroke="var(--mcd-gold)" fontSize={11} />
                <YAxis yAxisId="right" orientation="right" stroke="var(--mcd-red)" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="Revenue" stroke="var(--mcd-gold)" strokeWidth={3} dot={{ r: 2 }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="Orders" stroke="var(--mcd-red)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channels Breakdown */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Order Channel Distribution</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            <div className="chart-container" style={{ height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {channelChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toLocaleString()} orders`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="channel-legend-container">
              {channelChartData.map((item, idx) => (
                <div key={idx} className="channel-legend-item">
                  <div className="channel-dot" style={{ backgroundColor: item.color }} />
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                    <strong style={{ display: 'block', fontSize: '14px', marginTop: '2px' }}>
                      {((item.value / totalOrders) * 100).toFixed(1)}%
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Store Leaderboard */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Top Performing Store Branches</h3>
          </div>
          <div className="table-wrapper" style={{ marginTop: '10px' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Store Address</th>
                  <th>Region</th>
                  <th style={{ textAlign: 'right' }}>Total Orders</th>
                  <th style={{ textAlign: 'right' }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {storeRankings.map((store, index) => (
                  <tr key={index}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--mcd-gold)', fontWeight: 'bold' }}>#{index + 1}</span>
                        <span>{store.name}</span>
                      </div>
                    </td>
                    <td>{store.region}</td>
                    <td style={{ textAlign: 'right' }}>{store.orders.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', color: 'var(--mcd-gold)', fontWeight: '600' }}>
                      ${store.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
