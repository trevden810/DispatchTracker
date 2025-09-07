# Dispatch Tracker

Simple dispatcher tool for tracking driver locations and job assignments using GPS data.

## Features

- Real-time vehicle tracking via Samsara API
- Job assignments from FileMaker database
- GPS proximity detection to determine if drivers are at job sites
- Simple dispatcher interface with status overview

## Setup

1. **Install dependencies:**
   ```bash
   cd C:\Projects\DispatchTracker
   npm install
   ```

2. **Configure environment variables:**
   Update `.env.local` with your API credentials:
   - `SAMSARA_API_TOKEN` - Your Samsara API token
   - `FILEMAKER_PASSWORD` - FileMaker API password
   - `JOB_PROXIMITY_THRESHOLD_MILES` - Distance threshold (default: 0.5 miles)

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   Navigate to `http://localhost:3000`

## Usage

The dispatcher interface shows:
- Total vehicles and job assignments
- Real-time location status for each driver
- Distance from assigned job sites
- Color-coded status indicators:
  - **Green**: At job location (within threshold)
  - **Blue**: Nearby job location
  - **Yellow**: En route to job
  - **Red**: Far from job location

## API Endpoints

- `/api/vehicles` - Fetch Samsara vehicle data
- `/api/jobs` - Fetch FileMaker job assignments
- `/api/tracking` - Combined vehicle-job correlation data

## Deployment

Build for production:
```bash
npm run build
npm start
```