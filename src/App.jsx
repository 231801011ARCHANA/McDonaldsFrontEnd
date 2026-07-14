import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Utensils, 
  MapPin, 
  Users, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

import { filterData, getPrescriptiveActions, STORES } from './utils/mockData';

// Import Views
import Overview from './components/Overview';
import SalesForecasting from './components/SalesForecasting';
import ProductDemand from './components/ProductDemand';
import StorePerformance from './components/StorePerformance';
import CustomerSegmentation from './components/CustomerSegmentation';
import PrescriptiveActions from './components/PrescriptiveActions';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Filter States
  const [region, setRegion] = useState('All');
  const [storeId, setStoreId] = useState('All');
  
  // Date ranges: default to trailing 30 days of history and 7 days forecast
  const defaultDates = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 30);
    const end = new Date(today);
    end.setDate(today.getDate() + 7);
    
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  }, []);
  
  const [dateRange, setDateRange] = useState(defaultDates);

  // Auto-align Store Selector when Region changes
  const availableStores = useMemo(() => {
    if (region === 'All') return STORES;
    return STORES.filter(s => s.region === region);
  }, [region]);

  useEffect(() => {
    // If selected store is not in the newly filtered region, reset to All
    if (storeId !== 'All') {
      const match = availableStores.find(s => s.id === storeId);
      if (!match) setStoreId('All');
    }
  }, [region, availableStores, storeId]);

  // Compute filtered data using the memoized data engine
  const filteredData = useMemo(() => {
    return filterData(region, storeId, dateRange);
  }, [region, storeId, dateRange]);

  // Handle actions state separately so execution is mutable in UI
  const [actions, setActions] = useState([]);
  
  useEffect(() => {
    const generated = getPrescriptiveActions(filteredData.sales, filteredData.customers, storeId);
    setActions(generated);
  }, [filteredData.sales, filteredData.customers, storeId]);

  const handleExecuteAction = (actionId) => {
    setActions(prev => prev.map(act => 
      act.id === actionId ? { ...act, executed: true } : act
    ));
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Executive Operations Overview';
      case 'sales': return 'Predictive Revenue Forecasting';
      case 'product': return 'Product Demand Predictor';
      case 'store': return 'Diagnostic Branch Operations';
      case 'customers': return 'K-Means Customer Segmentation';
      case 'actions': return 'Prescriptive Optimization Feed';
      default: return 'McDonald’s BI Dashboard';
    }
  };

  const getPageSubtitle = () => {
    switch (activeTab) {
      case 'overview': return 'Descriptive summary of sales trends and channel performance';
      case 'sales': return 'SARIMA-based future sales forecasts and projections';
      case 'product': return 'Inventory item demand analysis and growth indicators';
      case 'store': return 'Ranked comparison and efficiency analysis of restaurant stores';
      case 'customers': return 'K-Means clustering and membership program loyalty profiles';
      case 'actions': return 'Prescriptive recommendations based on current bottlenecks';
      default: return 'Operational business intelligence center';
    }
  };

  return (
    <div className="app-container">
      {/* Left Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand-section">
          <div className="brand-logo">M</div>
          <div>
            <h1 className="brand-title">McDonald's BI</h1>
            <div className="brand-subtitle">Operations Portal</div>
          </div>
        </div>

        <nav style={{ flexGrow: 1 }}>
          <ul className="nav-menu">
            <li 
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <LayoutDashboard className="nav-icon" />
              <span>Overview</span>
            </li>
            <li 
              className={`nav-item ${activeTab === 'sales' ? 'active' : ''}`}
              onClick={() => setActiveTab('sales')}
            >
              <TrendingUp className="nav-icon" />
              <span>Sales Forecasting</span>
            </li>
            <li 
              className={`nav-item ${activeTab === 'product' ? 'active' : ''}`}
              onClick={() => setActiveTab('product')}
            >
              <Utensils className="nav-icon" />
              <span>Product Demand</span>
            </li>
            <li 
              className={`nav-item ${activeTab === 'store' ? 'active' : ''}`}
              onClick={() => setActiveTab('store')}
            >
              <MapPin className="nav-icon" />
              <span>Store Performance</span>
            </li>
            <li 
              className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}
              onClick={() => setActiveTab('customers')}
            >
              <Users className="nav-icon" />
              <span>Customer Segments</span>
            </li>
            <li 
              className={`nav-item ${activeTab === 'actions' ? 'active' : ''}`}
              onClick={() => setActiveTab('actions')}
            >
              <Sparkles className="nav-icon" />
              <span>Prescriptive Actions</span>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-avatar">SJ</div>
          <div className="user-info">
            <span className="user-name">Sarah Jenkins</span>
            <span className="user-role">Operations Director</span>
          </div>
        </div>
      </aside>

      {/* Main Panel Viewport */}
      <main className="main-content">
        {/* Top Sticky Filter panel */}
        <header className="topbar">
          <div className="page-title-section">
            <h2 className="page-title">{getPageTitle()}</h2>
            <span className="page-subtitle">{getPageSubtitle()}</span>
          </div>

          <div className="filters-panel">
            {/* Region Dropdown */}
            <div className="filter-group">
              <span className="filter-label">Region</span>
              <select 
                className="filter-select"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                <option value="All">All Regions</option>
                <option value="East">East Region</option>
                <option value="West">West Region</option>
                <option value="South">South Region</option>
              </select>
            </div>

            {/* Store Dropdown */}
            <div className="filter-group">
              <span className="filter-label">Store Branch</span>
              <select 
                className="filter-select"
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
              >
                <option value="All">All Stores</option>
                {availableStores.map(store => (
                  <option key={store.id} value={store.id}>#{store.id} - {store.name.split(',')[0]}</option>
                ))}
              </select>
            </div>

            {/* Date Pickers */}
            <div className="filter-group">
              <span className="filter-label">Date Boundaries</span>
              <div className="date-range-container">
                <input 
                  type="date" 
                  className="filter-input"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
                <span className="date-separator"><ChevronRight size={14} /></span>
                <input 
                  type="date" 
                  className="filter-input"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </header>

        {/* View Router */}
        <div style={{ flexGrow: 1 }}>
          {activeTab === 'overview' && (
            <Overview 
              salesData={filteredData.sales} 
              customerData={filteredData.customers} 
              activeStore={storeId}
            />
          )}
          {activeTab === 'sales' && (
            <SalesForecasting 
              salesData={filteredData.sales} 
            />
          )}
          {activeTab === 'product' && (
            <ProductDemand 
              salesData={filteredData.sales} 
            />
          )}
          {activeTab === 'store' && (
            <StorePerformance 
              salesData={filteredData.sales} 
            />
          )}
          {activeTab === 'customers' && (
            <CustomerSegmentation 
              customerData={filteredData.customers} 
            />
          )}
          {activeTab === 'actions' && (
            <PrescriptiveActions 
              actions={actions} 
              onExecuteAction={handleExecuteAction}
            />
          )}
        </div>
      </main>
    </div>
  );
}
