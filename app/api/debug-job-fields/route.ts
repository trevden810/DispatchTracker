// Raw FileMaker Field Debugging Endpoint
// Purpose: Show exactly what fields FileMaker returns vs what we expect

import { NextResponse } from 'next/server'
import { FileMakerResponse } from '../../../lib/types'

const FILEMAKER_CONFIG = {
  baseUrl: 'https://modd.mainspringhost.com',
  database: 'PEP2_1',
  layout: 'jobs_api',
  username: 'trevor_api',
  password: 'XcScS2yRoTtMo7'
}

export async function GET() {
  try {
    console.log('🔍 DEBUGGING: Raw FileMaker field analysis...')
    
    // Step 1: Get token
    const authUrl = `${FILEMAKER_CONFIG.baseUrl}/fmi/data/vLatest/databases/${FILEMAKER_CONFIG.database}/sessions`
    const credentials = Buffer.from(`${FILEMAKER_CONFIG.username}:${FILEMAKER_CONFIG.password}`).toString('base64')
    
    const authResponse = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    })
    
    const authData = await authResponse.json()
    const token = authData.response?.token
    
    if (!token) {
      return NextResponse.json({ error: 'Failed to get token' }, { status: 500 })
    }
    
    // Step 2: Query for a few records with truck assignments
    const queryUrl = `${FILEMAKER_CONFIG.baseUrl}/fmi/data/vLatest/databases/${FILEMAKER_CONFIG.database}/layouts/${FILEMAKER_CONFIG.layout}/_find`
    
    const queryResponse = await fetch(queryUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: [{ "_kp_job_id": "*" }],
        limit: 5
      })
    })
    
    const queryData: FileMakerResponse = await queryResponse.json()
    
    if (!queryData.response?.data) {
      return NextResponse.json({ 
        error: 'No data returned',
        response: queryData 
      }, { status: 500 })
    }
    
    // Step 3: Analyze the raw field data
    const analysis: {
      totalRecords: number
      fieldAnalysis: Array<{
        recordIndex: number
        totalFields: number
        allFieldNames: string[]
        sampleFieldValues: Record<string, any>
      }>
      truckIdAnalysis: {
        recordsWithTruckIds: number
        truckIdFieldPatterns: string[]
        sampleTruckIds: any[]
      }
      expectedFields: {
        present: Array<{
          field: string
          value: any
          type: string
        }>
        missing: string[]
      }
    } = {
      totalRecords: queryData.response.data.length,
      fieldAnalysis: [],
      truckIdAnalysis: {
        recordsWithTruckIds: 0,
        truckIdFieldPatterns: [],
        sampleTruckIds: []
      },
      expectedFields: {
        present: [],
        missing: []
      }
    }
    
    const expectedFields = [
      '_kp_job_id',
      'job_date', 
      'job_status',
      'job_type',
      '*kf*trucks_id',  // CRITICAL FIELD
      'Customer_C1',
      'address_C1',
      'time_arival',
      'time_complete',
      '*kf*route_id',
      '*kf*driver_id'
    ]
    
    // Analyze each record
    queryData.response.data.forEach((record: { fieldData: Record<string, any>, recordId: string, modId: string }, index: number) => {
      const fieldData = record.fieldData
      
      console.log(`\nRecord ${index + 1} Raw Fields:`)
      console.log(JSON.stringify(fieldData, null, 2))
      
      // Check for truck ID field variations
      const possibleTruckFields = [
        '*kf*trucks_id',
        '_kf_trucks_id', 
        'trucks_id',
        'truck_id',
        'TruckId',
        'Truck_ID'
      ]
      
      let truckIdFound: { fieldName: string; value: any } | null = null
      possibleTruckFields.forEach(fieldName => {
        if (fieldData[fieldName] !== undefined) {
          truckIdFound = {
            fieldName,
            value: fieldData[fieldName]
          }
          console.log(`✅ TRUCK ID FOUND: ${fieldName} = ${fieldData[fieldName]}`)
        }
      })
      
      if (truckIdFound) {
        analysis.truckIdAnalysis.recordsWithTruckIds++
        analysis.truckIdAnalysis.truckIdFieldPatterns.push((truckIdFound as any).fieldName)
        analysis.truckIdAnalysis.sampleTruckIds.push((truckIdFound as any).value)
      } else {
        console.log('❌ NO TRUCK ID FOUND in record', index + 1)
      }
      
      // Full field analysis for first record
      if (index === 0) {
        const allFields = Object.keys(fieldData)
        console.log(`\nALL FIELDS in first record: [${allFields.join(', ')}]`)
        
        expectedFields.forEach(field => {
          if (fieldData[field] !== undefined) {
            analysis.expectedFields.present.push({
              field,
              value: fieldData[field],
              type: typeof fieldData[field]
            })
          } else {
            analysis.expectedFields.missing.push(field)
          }
        })
        
        analysis.fieldAnalysis.push({
          recordIndex: index + 1,
          totalFields: allFields.length,
          allFieldNames: allFields,
          sampleFieldValues: Object.entries(fieldData).slice(0, 10).reduce((obj: Record<string, any>, [key, value]) => {
            obj[key] = value
            return obj
          }, {})
        })
      }
    })
    
    // Step 4: Return comprehensive analysis
    const result: {
      success: boolean
      message: string
      analysis: typeof analysis
      recommendations: string[]
      rawSampleRecord: Record<string, any> | null
    } = {
      success: true,
      message: 'Raw FileMaker field analysis complete',
      analysis,
      recommendations: [],
      rawSampleRecord: queryData.response.data[0]?.fieldData || null
    }
    
    // Generate recommendations
    if (analysis.truckIdAnalysis.recordsWithTruckIds === 0) {
      result.recommendations.push('❌ CRITICAL: No truck ID fields found in any records!')
      result.recommendations.push('🔧 Check FileMaker layout permissions for *kf*trucks_id field')
      result.recommendations.push('🔧 Verify field exists in jobs_api layout')
    } else {
      result.recommendations.push(`✅ Found truck IDs in ${analysis.truckIdAnalysis.recordsWithTruckIds}/${analysis.totalRecords} records`)
      
      const uniquePatterns = Array.from(new Set(analysis.truckIdAnalysis.truckIdFieldPatterns))
      if (uniquePatterns.length > 1) {
        result.recommendations.push(`⚠️ Multiple truck ID field patterns: ${uniquePatterns.join(', ')}`)
      }
    }
    
    if (analysis.expectedFields.missing.length > 0) {
      result.recommendations.push(`⚠️ Missing expected fields: ${analysis.expectedFields.missing.join(', ')}`)
    }
    
    console.log('\n📊 ANALYSIS COMPLETE')
    console.log('Recommendations:', result.recommendations)
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('❌ Field debugging failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Field debugging failed',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
