import React, { useState } from 'react';
import { ShoppingBag, TrendingUp, TrendingDown, Eye } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { PRODUCTS } from '../utils/mockData';

export default function ProductDemand({ salesData }) {
  const [selectedProductId, setSelectedProductId] = useState('p1'); // Default: Big Mac

  // Sort chronological
  const sortedData = [...salesData].sort((a, b) => new Date(a.date) - new Date(b.date));
  const historical = sortedData.filter(d => !d.isForecast);
  const forecast = sortedData.filter(d => d.isForecast);

  // Tomorrow's prediction (first forecast date in sorted order)
  const tomorrowData = forecast[0] || null;
  const tomorrowTopProducts = tomorrowData
    ? [...tomorrowData.productSales].sort((a, b) => b.quantity - a.quantity).slice(0, 5)
    : [];

  // Calculate product sales totals across historical data
  const productTotals = PRODUCTS.map(prod => {
    let quantity = 0;
    let revenue = 0;
    
    historical.forEach(day => {
      const match = day.productSales.find(ps => ps.productId === prod.id);
      if (match) {
        quantity += match.quantity;
        revenue += match.revenue;
      }
    });

    return {
      ...prod,
      quantity,
      revenue
    };
  }).sort((a, b) => b.quantity - a.quantity);

  // Category growth analysis: compare last 7 days vs preceding 7 days
  const categorySales = {};
  const last7Days = historical.slice(-7);
  const prev7Days = historical.slice(-14, -7);

  const getCategoryVolume = (days) => {
    const vols = { Burgers: 0, Sides: 0, Beverages: 0, Desserts: 0 };
    days.forEach(d => {
      d.productSales.forEach(ps => {
        if (vols[ps.category] !== undefined) {
          vols[ps.category] += ps.quantity;
        }
      });
    });
    return vols;
  };

  const currentVols = getCategoryVolume(last7Days);
  const pastVols = getCategoryVolume(prev7Days);

  const categoryTrends = Object.keys(currentVols).map(catName => {
    const cur = currentVols[catName];
    const past = pastVols[catName];
    let growth = 0;
    if (past > 0) {
      growth = parseFloat(((cur - past) / past * 100).toFixed(1));
    } else {
      growth = cur > 0 ? 5.0 : 0; // fallback mock
    }

    return {
      name: catName,
      volume: cur,
      growth,
      rising: growth >= 0
    };
  });

  // Selected Product Timeline Chart Data
  const productInspectorData = sortedData.map(d => {
    const match = d.productSales.find(ps => ps.productId === selectedProductId);
    const quantity = match ? match.quantity : 0;
    return {
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      Quantity: quantity,
      isForecast: d.isForecast
    };
  });

  const selectedProduct = PRODUCTS.find(p => p.id === selectedProductId);

  // Create chart data separation for Selected Product
  const inspectorChartData = [];
  const histInspector = productInspectorData.filter(d => !d.isForecast);
  const foreInspector = productInspectorData.filter(d => d.isForecast);
  const bridgePoint = histInspector[histInspector.length - 1];

  histInspector.forEach(d => {
    inspectorChartData.push({
      date: d.date,
      Historical: d.Quantity,
      Forecast: null
    });
  });

  if (bridgePoint) {
    inspectorChartData.push({
      date: bridgePoint.date,
      Historical: bridgePoint.Quantity,
      Forecast: bridgePoint.Quantity
    });
  }

  foreInspector.forEach(d => {
    inspectorChartData.push({
      date: d.date,
      Historical: null,
      Forecast: d.Quantity
    });
  });

  return (
    <div className="dashboard-viewport">
      {/* Product Grid Header */}
      <div className="analytics-grid">
        
        {/* Tomorrow's Demand Forecast Card */}
        <div className="chart-card">
          <div className="chart-header">
            <div className="page-title-section">
              <h3 className="chart-title">Demand Forecast for Tomorrow</h3>
              <span className="page-subtitle">Predicted top 5 selling items for {tomorrowData?.date || 'tomorrow'}</span>
            </div>
          </div>
          <div className="chart-container" style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={tomorrowTopProducts} 
                layout="vertical"
                margin={{ left: 20, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                <XAxis type="number" stroke="var(--text-secondary)" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" fontSize={11} width={80} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}
                  formatter={(value) => [`${value} units predicted`, 'Quantity']}
                />
                <Bar dataKey="quantity" fill="var(--mcd-gold)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Trends Card */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Category Demand Tracking</h3>
          </div>
          <div className="category-trend-list">
            {categoryTrends.map((cat, idx) => (
              <div key={idx} className="category-trend-item">
                <div className="category-details">
                  <span className="category-name">{cat.name}</span>
                  <span className="category-volume">{cat.volume.toLocaleString()} units sold (trailing 7 days)</span>
                </div>
                <div className={`category-trend-indicator ${cat.rising ? 'rising' : 'declining'}`}>
                  {cat.rising ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span>{cat.rising ? '+' : ''}{cat.growth}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Product Inspector (Full Width) */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <div className="page-title-section">
              <h3 className="chart-title">Single Product Demand Inspector</h3>
              <span className="page-subtitle">Analyze historical volume and predict future demand curves</span>
            </div>
            {/* Dropdown Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="filter-label" style={{ marginBottom: 0 }}>Select Item:</span>
              <select 
                className="filter-select"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
              >
                {PRODUCTS.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                ))}
              </select>
            </div>
          </div>
          
          {selectedProduct && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '24px', alignItems: 'center' }}>
              {/* Product Profile */}
              <div className="cluster-card" style={{ height: '100%', justifyContent: 'center' }}>
                <h4 style={{ color: 'var(--mcd-gold)', fontSize: '20px', fontWeight: '800' }}>{selectedProduct.name}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '-6px' }}>Category: {selectedProduct.category}</p>
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className="cluster-metric-row">
                    <span>Base Price</span>
                    <span>${selectedProduct.basePrice.toFixed(2)}</span>
                  </div>
                  <div className="cluster-metric-row">
                    <span>Prep Target Time</span>
                    <span>{selectedProduct.prepTime} seconds</span>
                  </div>
                  <div className="cluster-metric-row">
                    <span>Historical Share</span>
                    <span>
                      {((productTotals.find(p => p.id === selectedProductId)?.quantity || 0) / 
                       productTotals.reduce((sum, p) => sum + p.quantity, 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Inspector Timeline */}
              <div className="chart-container" style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={inspectorChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={11} />
                    <YAxis stroke="var(--text-secondary)" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }} />
                    <Legend />
                    <Line type="monotone" dataKey="Historical" stroke="var(--mcd-gold)" strokeWidth={3} dot={false} name="Historical Sales" />
                    <Line type="monotone" dataKey="Forecast" stroke="var(--mcd-red)" strokeWidth={3} strokeDasharray="4 4" dot={false} name="Forecast Demand" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
