// McDonald's Business Intelligence Data Engine
// Generates and filters realistic mock data for descriptive, diagnostic, predictive, and prescriptive analytics.

export const STORES = [
  { id: '101', name: 'Times Square, NY', region: 'East', address: '1560 Broadway', avgServiceTime: 142, rating: 4.2 },
  { id: '102', name: 'Downtown Boston, MA', region: 'East', address: '140 Tremont St', avgServiceTime: 195, rating: 3.8 }, // bottleneck
  { id: '103', name: 'Center City, Philadelphia', region: 'East', address: '1801 Market St', avgServiceTime: 155, rating: 4.1 },
  { id: '104', name: 'Sunset Blvd, Los Angeles', region: 'West', address: '6930 Sunset Blvd', avgServiceTime: 130, rating: 4.5 },
  { id: '105', name: 'Union Square, SF', region: 'West', address: '441 Sutter St', avgServiceTime: 210, rating: 3.6 }, // bottleneck
  { id: '106', name: 'Pike Place, Seattle', region: 'West', address: '1530 3rd Ave', avgServiceTime: 165, rating: 4.0 },
  { id: '107', name: 'South Beach, Miami', region: 'South', address: '1201 Washington Ave', avgServiceTime: 135, rating: 4.6 },
  { id: '108', name: 'Midtown Atlanta, GA', region: 'South', address: '1105 Peachtree St', avgServiceTime: 160, rating: 4.2 },
  { id: '109', name: 'Galleria, Houston', region: 'South', address: '5015 Westheimer Rd', avgServiceTime: 178, rating: 3.9 },
  { id: '110', name: 'Downtown Dallas, TX', region: 'South', address: '800 Commerce St', avgServiceTime: 150, rating: 4.3 }
];

export const PRODUCTS = [
  { id: 'p1', name: 'Big Mac', category: 'Burgers', basePrice: 5.79, prepTime: 90 },
  { id: 'p2', name: 'Quarter Pounder', category: 'Burgers', basePrice: 6.29, prepTime: 110 },
  { id: 'p3', name: 'McChicken', category: 'Burgers', basePrice: 3.49, prepTime: 70 },
  { id: 'p4', name: 'Double Cheeseburger', category: 'Burgers', basePrice: 3.29, prepTime: 60 },
  { id: 'p5', name: 'French Fries', category: 'Sides', basePrice: 3.89, prepTime: 45 },
  { id: 'p6', name: 'Chicken McNuggets (10pc)', category: 'Sides', basePrice: 5.49, prepTime: 120 },
  { id: 'p7', name: 'Apple Pie', category: 'Sides', basePrice: 1.89, prepTime: 30 },
  { id: 'p8', name: 'Mozzarella Dippers', category: 'Sides', basePrice: 3.29, prepTime: 80 },
  { id: 'p9', name: 'Coca-Cola', category: 'Beverages', basePrice: 2.49, prepTime: 20 },
  { id: 'p10', name: 'McCafé Latte', category: 'Beverages', basePrice: 3.89, prepTime: 90 },
  { id: 'p11', name: 'Oreo McFlurry', category: 'Desserts', basePrice: 4.39, prepTime: 40 },
  { id: 'p12', name: 'Hot Fudge Sundae', category: 'Desserts', basePrice: 3.29, prepTime: 30 }
];

// Helper to generate seed-based random numbers for stability
function sfc32(a, b, c, d) {
  return function() {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    var t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  }
}

// Generate deterministic mock data
export const generateData = () => {
  const rand = sfc32(0x9e3779b9, 0x243f6a88, 0xb7e15162, 12);
  const data = [];
  const today = new Date();
  
  // Create 30 days of historical data + 7 days of forecast data
  for (let i = -30; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    const isForecast = i > 0;
    
    // For each store, generate sales metrics
    STORES.forEach(store => {
      // Base revenue varies by store size and region
      let baseRevenue = 4000;
      if (store.id === '101') baseRevenue = 8500; // Times Square
      else if (store.id === '104') baseRevenue = 7200; // Sunset Blvd
      else if (store.id === '107') baseRevenue = 6500; // South Beach
      
      // Weekly seasonality (weekends have +30% revenue)
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const seasonalMultiplier = isWeekend ? 1.3 : 0.95;
      
      // Noise/Randomness
      const noise = 0.85 + rand() * 0.3; // ±15%
      
      // Apply trend for forecasting (e.g. +2% general weekly growth)
      const trendMultiplier = 1 + (i + 30) * 0.001; 
      
      let revenue = Math.round(baseRevenue * seasonalMultiplier * trendMultiplier * noise);
      
      // Forecasting adjustments
      if (isForecast) {
        // Forecasts are smoother but follow seasonality and trend
        const forecastNoise = 0.95 + rand() * 0.1; // ±5%
        revenue = Math.round(baseRevenue * seasonalMultiplier * trendMultiplier * forecastNoise);
      }
      
      const avgTicket = 12.5 + rand() * 3.5;
      const ordersCount = Math.round(revenue / avgTicket);
      
      // Channels distribution (varies slightly by store style)
      // e.g. Times Square (101) has high Kiosk and Dine-In, South Beach (107) has high Delivery
      let deliveryShare = 0.25;
      let driveThruShare = 0.40;
      let kioskShare = 0.20;
      let dineInShare = 0.15;
      
      if (store.id === '101' || store.id === '105') { // Heavy urban
        driveThruShare = 0.05;
        kioskShare = 0.45;
        dineInShare = 0.30;
        deliveryShare = 0.20;
      } else if (store.id === '107' || store.id === '102') { // Beach / Heavy tourist
        deliveryShare = 0.35;
        driveThruShare = 0.25;
        kioskShare = 0.20;
        dineInShare = 0.20;
      }
      
      const delivery = Math.round(ordersCount * deliveryShare);
      const driveThru = Math.round(ordersCount * driveThruShare);
      const kiosk = Math.round(ordersCount * kioskShare);
      const dineIn = ordersCount - (delivery + driveThru + kiosk);
      
      // Product demand details for this store-day
      const productSales = PRODUCTS.map(prod => {
        let weight = 1.0;
        if (prod.category === 'Burgers') weight = 1.8;
        if (prod.category === 'Sides') weight = 1.5;
        if (prod.category === 'Beverages') weight = 1.2;
        
        // Product specific popularity modifiers
        if (prod.id === 'p1') weight *= 1.3; // Big Mac super popular
        if (prod.id === 'p5') weight *= 1.5; // Fries ordered with almost everything
        
        // Time seasonality (latte sells more in breakfast stores on weekdays)
        if (prod.id === 'p10' && dayOfWeek >= 1 && dayOfWeek <= 5) weight *= 1.4;
        
        const count = Math.round((ordersCount * weight * (0.15 + rand() * 0.15)));
        const itemRevenue = count * prod.basePrice;
        
        return {
          productId: prod.id,
          name: prod.name,
          category: prod.category,
          quantity: count,
          revenue: Math.round(itemRevenue)
        };
      });
      
      data.push({
        date: dateString,
        storeId: store.id,
        storeName: store.name,
        region: store.region,
        revenue,
        ordersCount,
        channels: { delivery, driveThru, kiosk, dineIn },
        productSales,
        isForecast
      });
    });
  }
  
  // Generate Customer Segments (200 customers)
  const customers = [];
  const cities = ['New York', 'Boston', 'Philadelphia', 'Los Angeles', 'San Francisco', 'Seattle', 'Miami', 'Atlanta', 'Houston', 'Dallas'];
  const membershipTiers = ['Bronze', 'Silver', 'Gold', 'None'];
  
  // Cluster styles:
  // Cluster 0: "Loyal Heavy Users" (High spend, high visits)
  // Cluster 1: "Breakfast Rushers" (Med spend, high visits, mostly morning/beverages)
  // Cluster 2: "Deal Seekers" (Low spend, low visits, app deals)
  // Cluster 3: "Weekend Family Diners" (High spend, low visits, multiple items)
  for (let c = 0; c < 200; c++) {
    const clusterId = c % 4;
    let purchaseFrequency = 0; // Visits per month
    let spending = 0; // Avg monthly spend
    let tier = 'None';
    
    if (clusterId === 0) { // Loyal Heavy Users
      purchaseFrequency = Math.round(12 + rand() * 15);
      spending = Math.round(150 + rand() * 150);
      tier = rand() > 0.4 ? 'Gold' : 'Silver';
    } else if (clusterId === 1) { // Breakfast Rushers
      purchaseFrequency = Math.round(10 + rand() * 10);
      spending = Math.round(50 + rand() * 50);
      tier = rand() > 0.5 ? 'Silver' : 'Bronze';
    } else if (clusterId === 2) { // Deal Seekers
      purchaseFrequency = Math.round(2 + rand() * 5);
      spending = Math.round(15 + rand() * 25);
      tier = rand() > 0.8 ? 'Bronze' : 'None';
    } else { // Weekend Family Diners
      purchaseFrequency = Math.round(3 + rand() * 5);
      spending = Math.round(80 + rand() * 120);
      tier = rand() > 0.5 ? 'Silver' : 'Gold';
    }
    
    customers.push({
      id: `CUST-${1000 + c}`,
      city: cities[c % cities.length],
      membershipType: tier,
      purchaseFrequency,
      spending,
      clusterId,
      favoriteCategory: clusterId === 1 ? 'Beverages' : (clusterId === 3 ? 'Sides' : 'Burgers')
    });
  }
  
  return { storeDailyData: data, customers };
};

// Raw generated database
const database = generateData();

// Central Filter function
export const filterData = (region, storeId, dateRange) => {
  const { storeDailyData, customers } = database;
  
  // Filter sales data
  let filteredSales = storeDailyData;
  
  if (region !== 'All') {
    filteredSales = filteredSales.filter(d => d.region === region);
  }
  
  if (storeId !== 'All') {
    filteredSales = filteredSales.filter(d => d.storeId === storeId);
  }
  
  if (dateRange && dateRange.start && dateRange.end) {
    filteredSales = filteredSales.filter(d => d.date >= dateRange.start && d.date <= dateRange.end);
  }
  
  // Filter customer dataset by region matching city locations roughly
  let filteredCustomers = customers;
  if (region !== 'All') {
    // Map region to cities for mock consistency
    const regionCities = {
      'East': ['New York', 'Boston', 'Philadelphia'],
      'West': ['Los Angeles', 'San Francisco', 'Seattle'],
      'South': ['Miami', 'Atlanta', 'Houston', 'Dallas']
    };
    filteredCustomers = customers.filter(c => regionCities[region].includes(c.city));
  }
  
  return {
    sales: filteredSales,
    customers: filteredCustomers,
    rawDatabase: database // expose raw for global insights
  };
};

// Diagnostics & Insights generator (Prescriptive Analytics)
export const getPrescriptiveActions = (filteredSales, filteredCustomers, storeId) => {
  const actions = [];
  
  // Rule 1: High Service Time alert (Diagnostic -> Prescriptive)
  const storesToAnalyze = storeId === 'All' ? STORES : STORES.filter(s => s.id === storeId);
  storesToAnalyze.forEach(store => {
    if (store.avgServiceTime > 180) {
      actions.push({
        id: `act-staff-${store.id}`,
        title: `Optimize Staffing at Store #${store.id} (${store.name})`,
        type: 'Staffing',
        impact: 'High',
        storeId: store.id,
        metric: `Avg Service Time is ${store.avgServiceTime}s (Target: <150s)`,
        recommendation: `Allocate 2 additional crew members to the Drive-Thru and kitchen assembly line during peak hours (11:30 AM - 1:30 PM) to reduce bottlenecking.`,
        executed: false
      });
    }
  });
  
  // Rule 2: Low-Performing Store marketing promo
  // Find store with lowest total revenue in selected set
  const storeRevenues = {};
  filteredSales.filter(d => !d.isForecast).forEach(d => {
    storeRevenues[d.storeId] = (storeRevenues[d.storeId] || 0) + d.revenue;
  });
  
  const sortedStoreIds = Object.keys(storeRevenues).sort((a, b) => storeRevenues[a] - storeRevenues[b]);
  if (sortedStoreIds.length > 0) {
    const worstStoreId = sortedStoreIds[0];
    const worstStore = STORES.find(s => s.id === worstStoreId);
    if (worstStore) {
      actions.push({
        id: `act-promo-${worstStoreId}`,
        title: `Geo-Targeted Loyalty Campaign: Store #${worstStoreId}`,
        type: 'Marketing',
        impact: 'Medium',
        storeId: worstStoreId,
        metric: `Monthly revenue is $${Math.round(storeRevenues[worstStoreId]).toLocaleString()} (Bottom performer in scope)`,
        recommendation: `Launch a targeted in-app push notification offering "Double Points on Breakfast Meals" to customers registered within 5 miles of the ${worstStore.name} branch to stimulate off-peak visits.`,
        executed: false
      });
    }
  }

  // Rule 3: Product-wise inventory warning (Predictive -> Prescriptive)
  // Check if Fries or Big Mac forecast shows rising trend, recommend supply increase
  const friesSales = filteredSales.filter(d => d.isForecast).reduce((sum, d) => {
    const item = d.productSales.find(p => p.productId === 'p5'); // Fries
    return sum + (item ? item.quantity : 0);
  }, 0);
  
  if (friesSales > 500) {
    actions.push({
      id: 'act-inv-fries',
      title: 'Bulk Supply Replenishment: French Fries',
      type: 'Inventory',
      impact: 'High',
      storeId: storeId === 'All' ? 'Multiple' : storeId,
      metric: `Forecasted French Fries demand is high (${Math.round(friesSales)} units next 7 days)`,
      recommendation: `Increase potato oil and fry-carton distribution levels by 15% for the upcoming weekly delivery cycle to prevent inventory stockouts during the weekend sales surge.`,
      executed: false
    });
  }

  // Rule 4: Customer Segmentation engagement (Prescriptive)
  const dealSeekersCount = filteredCustomers.filter(c => c.clusterId === 2).length;
  if (dealSeekersCount > 0) {
    actions.push({
      id: 'act-seg-deals',
      title: 'App-Exclusive Combo discount for "Deal Seekers"',
      type: 'Promotion',
      impact: 'Medium',
      storeId: 'All',
      metric: `Identified ${dealSeekersCount} local loyalty users in 'Deal Seekers' cluster with low purchase frequency`,
      recommendation: `Inject an app coupon for $2.00 off a $10.00 basket value containing a Cheeseburger meal. Historically, this segment reacts with a 24% uplift in conversion.`,
      executed: false
    });
  }

  return actions;
};
