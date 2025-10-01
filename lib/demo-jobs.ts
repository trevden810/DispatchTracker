// Demo mode with mock jobs that have truck IDs matching your vehicle numbers
import { Job } from './types'

export function createDemoJobs(): Job[] {
  // Based on your vehicle numbers: 56, 67, 74, 81, 85, 86, 70, 804, etc.
  const mockJobs: Job[] = [
    {
      id: 896883,
      date: '09/16/2025', 
      status: 'In Progress',
      type: 'Delivery',
      truckId: "77", // This matches Truck 77 from your fleet
      customer: 'SHRINE OF ST ANNES SCHOOL',
      address: '6665 BALSAM ST, ARVADA, CO 80004',
      arrivalTime: null,
      completionTime: null,
      dueDate: '09/16/2025',
      routeId: "1",
      driverId: 77,
      stopOrder: 1,
      location: {
        lat: 39.8028,
        lng: -105.0467,
        address: '6665 BALSAM ST, ARVADA, CO 80004',
        source: 'mock'
      }
    },
    {
      id: 896891,
      date: '09/16/2025',
      status: 'Scheduled',
      type: 'Delivery', 
      truckId: "81", // Proper job for TRUCK 81
      customer: 'COLORADO MILLS MALL',
      address: '14500 W COLFAX AVE, LAKEWOOD, CO 80401',
      arrivalTime: null,
      completionTime: null,
      dueDate: '09/16/2025',
      routeId: "9",
      driverId: 81,
      stopOrder: 1,
      location: {
        lat: 39.7264,
        lng: -105.1565,
        address: '14500 W COLFAX AVE, LAKEWOOD, CO 80401',
        source: 'mock'
      }
    },
    {
      id: 896884,
      date: '09/16/2025',
      status: 'Scheduled', 
      type: 'Pickup',
      truckId: "85", // This matches TRUCK 85
      customer: 'SONIC AUTOMOTIVE',
      address: '10501 W COLFAX AVE, LAKEWOOD, CO 80215',
      arrivalTime: null,
      completionTime: null, 
      dueDate: '09/16/2025',
      routeId: "2",
      driverId: 85,
      stopOrder: 1,
      location: {
        lat: 39.7392,
        lng: -105.1178,
        address: '10501 W COLFAX AVE, LAKEWOOD, CO 80215', 
        source: 'mock'
      }
    },
    {
      id: 896885,
      date: '09/16/2025',
      status: 'Entered',
      type: 'Delivery',
      truckId: "56", // This matches TRUCK 56
      customer: 'DENVER TECH CENTER',
      address: '7900 E UNION AVE, DENVER, CO 80237',
      arrivalTime: null,
      completionTime: null,
      dueDate: '09/16/2025', 
      routeId: "3",
      driverId: 56,
      stopOrder: 1,
      location: {
        lat: 39.6157,
        lng: -104.8918,
        address: '7900 E UNION AVE, DENVER, CO 80237',
        source: 'mock'
      }
    },
    {
      id: 896886,
      date: '09/16/2025',
      status: 'In Progress', 
      type: 'Pickup',
      truckId: "67", // This matches TRUCK 67
      customer: 'WESTMINSTER PROMENADE',
      address: '10455 WESTMINSTER BLVD, WESTMINSTER, CO 80020',
      arrivalTime: '09:30 AM',
      completionTime: null,
      dueDate: '09/16/2025',
      routeId: "4",
      driverId: 67,
      stopOrder: 1,
      location: {
        lat: 39.8834,
        lng: -105.0370,
        address: '10455 WESTMINSTER BLVD, WESTMINSTER, CO 80020',
        source: 'mock'
      }
    },
    {
      id: 896887,
      date: '09/16/2025',
      status: 'Scheduled',
      type: 'Delivery', 
      truckId: "74", // This matches TRUCK 74
      customer: 'CHERRY CREEK MALL',
      address: '3000 E 1ST AVE, DENVER, CO 80206',
      arrivalTime: null,
      completionTime: null,
      dueDate: '09/16/2025',
      routeId: "5", 
      driverId: 74,
      stopOrder: 1,
      location: {
        lat: 39.7185,
        lng: -104.9549,
        address: '3000 E 1ST AVE, DENVER, CO 80206',
        source: 'mock'
      }
    },
    {
      id: 896888,
      date: '09/16/2025', 
      status: 'Entered',
      type: 'Move',
      truckId: "72", // CORRECTED: Real FileMaker data shows TRK 72
      customer: 'FCI CONSTRUCTOS INC',
      address: 'WINDSOR, CO GOLDEN, CO',
      arrivalTime: null,
      completionTime: null,
      dueDate: '09/16/2025',
      routeId: "6",
      driverId: 72,
      stopOrder: 2, // Route shows stops 2-3
      location: {
        lat: 40.4774,
        lng: -105.0178,
        address: 'WINDSOR, CO GOLDEN, CO',
        source: 'mock'
      }
    },
    {
      id: 896889,
      date: '09/16/2025',
      status: 'Entered',
      type: 'Delivery',
      truckId: "86", // This matches TRUCK 86
      customer: 'PARK MEADOWS MALL',
      address: '8405 PARK MEADOWS CENTER DR, LONE TREE, CO 80124',
      arrivalTime: null,
      completionTime: null,
      dueDate: '09/16/2025',
      routeId: "7",
      driverId: 86, 
      stopOrder: 1,
      location: {
        lat: 39.5621,
        lng: -104.8719,
        address: '8405 PARK MEADOWS CENTER DR, LONE TREE, CO 80124',
        source: 'mock'
      }
    },
    {
      id: 896890,
      date: '09/16/2025',
      status: 'Scheduled',
      type: 'Pickup', 
      truckId: "70", // This matches OR 70
      customer: 'FLATIRON CROSSING',
      address: '1 W FLATIRON CROSSING DR, BROOMFIELD, CO 80021',
      arrivalTime: null,
      completionTime: null,
      dueDate: '09/16/2025',
      routeId: "8",
      driverId: 70,
      stopOrder: 1,
      location: {
        lat: 39.9270, 
        lng: -105.1365,
        address: '1 W FLATIRON CROSSING DR, BROOMFIELD, CO 80021',
        source: 'mock'
      }
    }
  ]

  console.log('🎭 DEMO MODE: Created mock jobs with truck IDs:', 
    mockJobs.map(job => job.truckId).join(', '))

  return mockJobs
}

export const DEMO_MODE = {
  enabled: false, // DISABLED: Switching to live FileMaker data
  reason: 'Correlation accuracy verified - ready for live data testing',
  dataValidated: true, // Demo data was corrected and validated
  lastUpdated: '2025-09-16',
  switchedToLive: '2025-09-16',
  readyForProduction: true
}
