// Test all possible truck/vehicle correlation fields
const testAllTruckFields = async () => {
  try {
    console.log('🔍 Testing all possible truck correlation fields...');
    
    // Test the jobs API with a smaller limit to see field data
    const response = await fetch('http://localhost:3002/api/jobs?limit=3');
    
    if (!response.ok) {
      console.error(`❌ API failed: ${response.status}`);
      const text = await response.text();
      console.log('Error details:', text);
      return;
    }
    
    const data = await response.json();
    console.log(`✅ API Response: ${data.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`📊 Jobs returned: ${data.count || 0}`);
    
    if (data.data && data.data.length > 0) {
      console.log('\\n🔍 DETAILED FIELD ANALYSIS:');
      
      data.data.forEach((job, index) => {
        console.log(`\\n--- Job ${index + 1} (ID: ${job.id}) ---`);
        console.log(`  truckId: ${job.truckId} (${typeof job.truckId})`);
        console.log(`  routeId: ${job.routeId} (${typeof job.routeId})`);
        console.log(`  driverId: ${job.driverId} (${typeof job.driverId})`);
        console.log(`  stopOrder: ${job.stopOrder} (${typeof job.stopOrder})`);
        console.log(`  customer: ${job.customer}`);
        console.log(`  status: ${job.status}`);
        console.log(`  type: ${job.type}`);
      });
      
      // Check which fields have data
      console.log('\\n📊 FIELD DATA SUMMARY:');
      const hasData = {
        truckId: data.data.filter(job => job.truckId != null).length,
        routeId: data.data.filter(job => job.routeId != null).length,
        driverId: data.data.filter(job => job.driverId != null).length,
        stopOrder: data.data.filter(job => job.stopOrder != null).length
      };
      
      console.log(`  Jobs with truckId: ${hasData.truckId}/${data.data.length}`);
      console.log(`  Jobs with routeId: ${hasData.routeId}/${data.data.length}`);
      console.log(`  Jobs with driverId: ${hasData.driverId}/${data.data.length}`);
      console.log(`  Jobs with stopOrder: ${hasData.stopOrder}/${data.data.length}`);
      
      // Show unique values in each field
      console.log('\\n🎯 UNIQUE VALUES IN EACH FIELD:');
      const uniqueValues = {
        truckIds: [...new Set(data.data.map(job => job.truckId).filter(x => x != null))],
        routeIds: [...new Set(data.data.map(job => job.routeId).filter(x => x != null))],
        driverIds: [...new Set(data.data.map(job => job.driverId).filter(x => x != null))],
        stopOrders: [...new Set(data.data.map(job => job.stopOrder).filter(x => x != null))]
      };
      
      console.log(`  Truck IDs: [${uniqueValues.truckIds.join(', ')}]`);
      console.log(`  Route IDs: [${uniqueValues.routeIds.join(', ')}]`);
      console.log(`  Driver IDs: [${uniqueValues.driverIds.join(', ')}]`);
      console.log(`  Stop Orders: [${uniqueValues.stopOrders.join(', ')}]`);
      
    } else {
      console.log('❌ No job data returned');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
};

// Wait a moment for the server to be ready
setTimeout(() => {
  testAllTruckFields();
}, 2000);
