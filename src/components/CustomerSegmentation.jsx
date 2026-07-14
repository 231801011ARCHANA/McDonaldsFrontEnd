import React, { useState } from 'react';
import { Target, Users, Award, ShoppingBag } from 'lucide-react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  BarChart,
  Bar
} from 'recharts';

const CLUSTERS_INFO = {
  0: {
    name: 'Loyal Heavy Users',
    color: '#ffbc0d', // Gold
    description: 'High-frequency customers who spend heavily on premium items (e.g. Signature Burgers, Meals).',
    action: 'Target with loyalty point multipliers and early access to limited-time promotional products.'
  },
  1: {
    name: 'Breakfast Rushers',
    color: '#2979ff', // Blue
    description: 'Daily morning visitors focused on McCafé items, Egg McMuffins, and quick breakfasts.',
    action: 'Promote bundle upgrades (e.g., "Add hashbrown for $1") and push digital app ordering to save time.'
  },
  2: {
    name: 'Deal Seekers',
    color: '#db0007', // Red
    description: 'Budget-conscious consumers who order exclusively from the Value Menu and use digital coupons.',
    action: 'Offer lower-margin high-volume combo deals to maintain transaction counts and increase basket sizes.'
  },
  3: {
    name: 'Weekend Family Diners',
    color: '#00e676', // Green
    description: 'Lower frequency visitors who place high-value bulk orders during weekend family hours.',
    action: 'Target with Share Boxes, Happy Meal bundle discounts, and weekend loyalty point boosts.'
  }
};

export default function CustomerSegmentation({ customerData }) {
  const [selectedCluster, setSelectedCluster] = useState(0);

  // Group customer counts by membership tier
  const membershipCounts = customerData.reduce((acc, c) => {
    acc[c.membershipType] = (acc[c.membershipType] || 0) + 1;
    return acc;
  }, { Gold: 0, Silver: 0, Bronze: 0, None: 0 });

  const membershipChartData = Object.entries(membershipCounts).map(([tier, count]) => ({
    tier,
    Count: count
  }));

  // Calculate statistics for selected cluster
  const clusterCustomers = customerData.filter(c => c.clusterId === selectedCluster);
  const totalCount = customerData.length;
  const clusterSize = clusterCustomers.length;
  const clusterPercentage = totalCount > 0 ? (clusterSize / totalCount * 100).toFixed(1) : 0;
  
  const avgVisits = clusterCustomers.length > 0
    ? (clusterCustomers.reduce((sum, c) => sum + c.purchaseFrequency, 0) / clusterCustomers.length).toFixed(1)
    : 0;
    
  const avgSpend = clusterCustomers.length > 0
    ? (clusterCustomers.reduce((sum, c) => sum + c.spending, 0) / clusterCustomers.length).toFixed(2)
    : 0;

  // Favorite categories in this cluster
  const catCounts = clusterCustomers.reduce((acc, c) => {
    acc[c.favoriteCategory] = (acc[c.favoriteCategory] || 0) + 1;
    return acc;
  }, {});
  const topCategory = Object.keys(catCounts).length > 0
    ? Object.entries(catCounts).sort((a,b) => b[1] - a[1])[0][0]
    : 'N/A';

  // Format scatter points
  // Recharts Scatter Chart works well with direct coordinates
  const scatterPoints = customerData.map(c => ({
    x: c.spending,
    y: c.purchaseFrequency,
    z: 10,
    clusterId: c.clusterId,
    id: c.id,
    city: c.city,
    membership: c.membershipType
  }));

  return (
    <div className="dashboard-viewport">
      {/* Segment Aggregations Row */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Cluster Representation</span>
            <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--mcd-gold-glow)' }}>
              <Users className="nav-icon" style={{ color: 'var(--mcd-gold)' }} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: CLUSTERS_INFO[selectedCluster].color }}>
            {clusterPercentage}%
          </div>
          <div className="kpi-header" style={{ marginBottom: 0 }}>
            <span className="kpi-subtitle">{clusterSize} of {totalCount} local loyalty accounts</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Avg Visits / Month</span>
            <div className="kpi-icon-wrapper">
              <ShoppingBag className="nav-icon" />
            </div>
          </div>
          <div className="kpi-value">{avgVisits} visits</div>
          <div className="kpi-header" style={{ marginBottom: 0 }}>
            <span className="kpi-subtitle">Visit frequency of cluster</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Avg Monthly Spend</span>
            <div className="kpi-icon-wrapper">
              <Award className="nav-icon" />
            </div>
          </div>
          <div className="kpi-value">${avgSpend}</div>
          <div className="kpi-header" style={{ marginBottom: 0 }}>
            <span className="kpi-subtitle">Average customer lifetime value</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Primary Food Preference</span>
            <div className="kpi-icon-wrapper">
              <Target className="nav-icon" />
            </div>
          </div>
          <div className="kpi-value" style={{ fontSize: '20px', textTransform: 'uppercase', paddingTop: '8px' }}>
            {topCategory}
          </div>
          <div className="kpi-header" style={{ marginBottom: 0 }}>
            <span className="kpi-subtitle">Top ordered food category</span>
          </div>
        </div>
      </div>

      {/* Interactive Clustering Layout */}
      <div className="segmentation-panel">
        
        {/* K-Means Scatter plot */}
        <div className="chart-card">
          <div className="chart-header">
            <div className="page-title-section">
              <h3 className="chart-title">K-Means Customer Clustering Profile</h3>
              <span className="page-subtitle">Algorithmic segmentation of spending (X-axis) vs Visit Frequency (Y-axis)</span>
            </div>
          </div>
          <div className="chart-container" style={{ height: '340px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Monthly Spend" 
                  unit="$" 
                  stroke="var(--text-secondary)" 
                  fontSize={11}
                  label={{ value: 'Monthly Spend ($)', position: 'insideBottom', offset: -10, fill: 'var(--text-secondary)', fontSize: 11 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Monthly Visits" 
                  unit=" visits" 
                  stroke="var(--text-secondary)" 
                  fontSize={11}
                  label={{ value: 'Monthly Visits', angle: -90, position: 'insideLeft', fill: 'var(--text-secondary)', fontSize: 11 }}
                />
                <ZAxis type="number" dataKey="z" range={[60, 80]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}
                  formatter={(value, name) => [value, name]}
                />
                <Scatter name="Customers" data={scatterPoints}>
                  {scatterPoints.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CLUSTERS_INFO[entry.clusterId].color} 
                      opacity={entry.clusterId === selectedCluster ? 1.0 : 0.25}
                      stroke={entry.clusterId === selectedCluster ? '#fff' : 'none'}
                      strokeWidth={1}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          
          {/* Cluster Legend Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
            {Object.entries(CLUSTERS_INFO).map(([id, info]) => (
              <button
                key={id}
                className="filter-select"
                style={{ 
                  borderColor: selectedCluster === parseInt(id) ? info.color : 'var(--border-color)',
                  color: selectedCluster === parseInt(id) ? '#fff' : 'var(--text-secondary)',
                  backgroundColor: selectedCluster === parseInt(id) ? `${info.color}1e` : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onClick={() => setSelectedCluster(parseInt(id))}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: info.color }} />
                {info.name}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Segment Profile Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="chart-card" style={{ flexGrow: 1 }}>
            <div className="chart-header">
              <h3 className="chart-title" style={{ color: CLUSTERS_INFO[selectedCluster].color }}>
                {CLUSTERS_INFO[selectedCluster].name}
              </h3>
            </div>
            
            <div className="cluster-card" style={{ border: 'none', backgroundColor: 'transparent', padding: 0 }}>
              <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {CLUSTERS_INFO[selectedCluster].description}
              </p>
              
              <div style={{ margin: '12px 0' }}>
                <h4 style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Prescriptive Campaign Strategy
                </h4>
                <div className="cluster-action-box" style={{ borderLeftColor: CLUSTERS_INFO[selectedCluster].color }}>
                  {CLUSTERS_INFO[selectedCluster].action}
                </div>
              </div>
            </div>
          </div>

          {/* Membership Tier Distribution Card */}
          <div className="chart-card">
            <h4 className="chart-title">Membership Tiers</h4>
            <div className="chart-container" style={{ height: '140px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={membershipChartData}>
                  <XAxis dataKey="tier" stroke="var(--text-secondary)" fontSize={10} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }} />
                  <Bar dataKey="Count" fill="var(--mcd-gold)" radius={[4, 4, 0, 0]}>
                    {membershipChartData.map((entry, index) => {
                      let color = 'var(--text-muted)';
                      if (entry.tier === 'Gold') color = 'var(--mcd-gold)';
                      if (entry.tier === 'Silver') color = '#cbd5e1';
                      if (entry.tier === 'Bronze') color = '#db0007';
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
