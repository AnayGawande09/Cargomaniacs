# Vehicle Tracker Execution Complete

The autonomous tracking loop has been completed successfully.

- The application consists of a Node.js backend simulating vehicle movement and telemetry over WebSockets.
- A Next.js frontend uses React-Leaflet to visualize the track and Recharts to map telemetry.
- Weather and Route APIs are mocked to bypass API key requirements, simulating travel from Los Angeles to San Francisco.

## Running the Application Locally

1. **Start the backend server**
   ```bash
   cd backend
   node server.js
   ```
   The backend will run on `http://localhost:3001`.

2. **Start the frontend server**
   Open a new terminal window:
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:3000` (or the next available port, e.g., 3001, 3002). Access this port in your browser.

## Customizing Environment

To change parameters such as the REST endpoints or testing logic, you can easily modify `frontend/src/app/page.tsx` and `backend/server.js`.
The design focuses on a data-heavy, minimalist engineering aesthetic.
