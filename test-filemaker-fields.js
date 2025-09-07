// Direct FileMaker Field Analysis Script
const testFileMakerFields = async () => {
  try {
    console.log('🔍 Testing FileMaker Job Fields...');
    
    // Auth
    const authUrl = 'https://modd.mainspringhost.com/fmi/data/vLatest/databases/PEP2_1/sessions';
    const credentials = Buffer.from('trevor_api:XcScS2yRoTtMo7').toString('base64');
    
    const authResponse = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    });

    if (!authResponse.ok) {
      throw new Error(`Auth failed: ${authResponse.status}`);
    }

    const authData = await authResponse.json();
    const token = authData.response.token;
    
    // Query jobs
    const findUrl = 'https://modd.mainspringhost.com/fmi/data/vLatest/databases/PEP2_1/layouts/jobs_api/_find';
    
    const response = await fetch(findUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: [{ "_kp_job_id": "*" }],
        limit: 5
      })
    });

    if (!response.ok) {
      throw new Error(`Query failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.response.data && data.response.data.length > 0) {
      const sampleRecord = data.response.data[0];
      const allFields = Object.keys(sampleRecord.fieldData);
      
      console.log('\n📊 FILEMAKER JOB FIELDS ANALYSIS');
      console.log('='.repeat(50));
      console.log(`Total Records: ${data.response.dataInfo.totalRecordCount.toLocaleString()}`);
      console.log(`Total Fields: ${allFields.length}`);
      
      // Categorize fields
      const schedulingFields = [];
      const statusFields = [];
      const timeFields = [];
      const identificationFields = [];
      
      allFields.forEach(field => {
        const fieldLower = field.toLowerCase();
        
        if (fieldLower.includes('date') || fieldLower.includes('time') || fieldLower.includes('arrive') || fieldLower.includes('complete') || fieldLower.includes('schedule')) {
          schedulingFields.push(field);
        }
        
        if (fieldLower.includes('status') || fieldLower.includes('disposition')) {
          statusFields.push(field);
        }
        
        if (fieldLower.includes('time') || fieldLower.includes('arrive') || fieldLower.includes('complete') || fieldLower.includes('start') || fieldLower.includes('finish') || fieldLower.includes('actual') || fieldLower.includes('estimated')) {
          timeFields.push(field);
        }
        
        if (fieldLower.includes('id') || fieldLower.includes('_kp_') || fieldLower.includes('_kf_')) {
          identificationFields.push(field);
        }
      });
      
      console.log('\n📅 SCHEDULING FIELDS:');
      schedulingFields.forEach(field => console.log(`  • ${field}`));
      
      console.log('\n📋 STATUS FIELDS:');
      statusFields.forEach(field => console.log(`  • ${field}`));
      
      console.log('\n🕒 TIME-RELATED FIELDS (for hygiene checks):');
      timeFields.forEach(field => console.log(`  • ${field}`));
      
      // Show sample data for first 3 jobs
      console.log('\n📄 SAMPLE JOB DATA:');
      data.response.data.slice(0, 3).forEach((job, index) => {
        console.log(`\nJob ${job.fieldData._kp_job_id}:`);
        
        // Show scheduling and status fields
        [...schedulingFields, ...statusFields].forEach(field => {
          const value = job.fieldData[field];
          if (value) {
            console.log(`  ${field}: ${value}`);
          }
        });
      });
      
      console.log('\n✅ COMPLETE STATUSES TO CHECK AGAINST:');
      ['Complete', 'Re-scheduled', 'Attempted', 'Canceled', 'Done'].forEach(status => {
        console.log(`  • ${status}`);
      });
      
      console.log('\n🎯 SCHEDULE HYGIENE STRATEGY:');
      console.log('  1. Query jobs with arrive/complete times but status NOT in complete list');
      console.log('  2. Flag jobs where arrive time exists but status is still "Active" or "Pending"');
      console.log('  3. Alert on jobs with complete times but status not updated');
      
    } else {
      console.log('❌ No job data returned');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

// Export for use
module.exports = { testFileMakerFields };