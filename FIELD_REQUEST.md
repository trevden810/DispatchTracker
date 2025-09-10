# FileMaker Field Access Request

**To**: Database Administrator  
**From**: DispatchTracker Development Team  
**Date**: September 9, 2025  

## Request

Please add the following fields to the **jobs_api** layout for user **trevor_api**:

```
_kf_route_id
_kf_driver_id  
order_C1
order_C2
address_C2
Customer_C2
contact_C1
job_status_driver
```

## Purpose

These fields are needed for vehicle-to-job correlation in our fleet tracking system. Currently vehicles show "0 assigned jobs" because we cannot access the route assignment data.

## Verification

After adding these fields, this API call should return the new data:
```
GET /api/jobs?limit=1
```

Thank you.
