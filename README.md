# AI-Based Road Analysis Drone System

A comprehensive system for autonomous road inspection using AI-powered drone technology.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
│         - Dashboard, Live Feed, Map, Reports                │
│         - Real-time updates via Socket.io                   │
└─────────────────────────────────────────────────────────────┘
                            │
                 ┌──────────┴──────────┐
                 │                     │
         ┌───────▼────────┐   ┌───────▼────────┐
         │  BACKEND       │   │  AI MODEL      │
         │  (Node.js)     │◄──┤  (Flask)       │
         │  - Express API │   │  - Detection   │
         │  - MongoDB     │   │  - Analysis    │
         │  - Socket.io   │   └────────────────┘
         └────────────────┘
```

## Components

### 1. Backend (Node.js + Express)
- REST API for damage reports
- WebSocket for real-time telemetry
- MongoDB integration
- JWT authentication

**Location:** `/backend`

### 2. Frontend (React + Tailwind)
- Modern dashboard UI
- Live drone feed display
- Interactive map with damage markers
- Real-time notifications

**Location:** `/frontend`

### 3. AI Model (Flask)
- Road damage detection
- Image analysis
- Severity classification

**Location:** `/ai-model`

## Prerequisites

- Node.js 16+
- Python 3.8+
- MongoDB 5.0+
- Docker (optional)

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
# Update .env with your configuration
npm run dev  # Development
npm start    # Production
```

**Environment Variables:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/drone-system
JWT_SECRET=your_secret_key
AI_MODEL_URL=http://localhost:5001
NODE_ENV=development
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start  # Starts on http://localhost:3000
```

### 3. AI Model Setup

```bash
cd ai-model
pip install -r requirements.txt
python app.py  # Runs on http://localhost:5001
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Damage Reports
- `GET /api/reports` - Get all reports
- `POST /api/reports` - Create new report
- `GET /api/reports/:id` - Get single report
- `PUT /api/reports/:id/status` - Update status
- `DELETE /api/reports/:id` - Delete report

### Sessions
- `POST /api/sessions/start` - Start mission
- `PUT /api/sessions/:id/end` - End mission
- `GET /api/sessions` - Get all sessions

### Stats
- `GET /api/stats/summary` - Get summary
- `GET /api/stats/trends` - Get 30-day trends

### Live Data
- `POST /api/live/frame` - Send drone frame
- `POST /api/live/gps` - Send GPS data
- `POST /api/live/telemetry` - Send telemetry

### AI Detection
- `POST /detect` - Detect damages in image

## Database Schema

### DamageReport
```javascript
{
  imageURL: String,
  location: { lat: Number, lng: Number },
  damageType: String, // crack, pothole, undamaged
  severity: String, // low, medium, high
  confidence: Number,
  status: String, // reported, assigned, in-progress, resolved
  timestamp: Date
}
```

### DroneSession
```javascript
{
  startTime: Date,
  endTime: Date,
  status: String,
  totalDistance: Number,
  totalDamages: Number,
  operator: ObjectId,
  droneId: String
}
```

### User
```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  role: String, // admin, engineer, operator
  phone: String,
  department: String
}
```

## Docker Deployment

```bash
docker-compose up -d
```

This will start:
- MongoDB on port 27017
- Backend on port 5000
- Frontend on port 3000
- AI Model on port 5001

## Features

### Dashboard
- ✅ Real-time statistics
- ✅ Damage type breakdown
- ✅ Severity distribution
- ✅ 30-day trend analysis
- ✅ Recent alerts

### Live Feed
- ✅ Real-time video stream
- ✅ Live telemetry (battery, altitude, speed)
- ✅ GPS coordinates
- ✅ Connection status
- ✅ Damage notifications

### Map View
- ✅ Interactive Leaflet map
- ✅ Color-coded damage markers
- ✅ Damage details on click
- ✅ Severity filtering

### Reports
- ✅ Comprehensive report listing
- ✅ Advanced filtering (date, type, severity)
- ✅ Status management
- ✅ CSV export

### Drone Control
- ✅ Mission management
- ✅ Manual/Auto mode toggle
- ✅ Flight controls
- ✅ System status monitoring

## Authentication

The system uses JWT (JSON Web Tokens) for authentication.

**Login Flow:**
1. User provides email and password
2. Backend validates credentials
3. JWT token is issued (expires in 7 days)
4. Token is stored in localStorage
5. Token is sent in Authorization header for protected routes

**User Roles:**
- **Admin**: Full access, user management
- **Engineer**: Can view reports, manage missions
- **Operator**: Can operate drones, view feed

## Real-time Features

Socket.io is used for real-time communication:

**Events:**
- `telemetry-update` - Battery, altitude, speed updates
- `gps-update` - GPS coordinate updates
- `damage-alert` - New damage detected
- `mission-started` - Mission initialization
- `mission-ended` - Mission completion

## AI Model Details

The Flask AI model provides damage detection:

**Input:**
- Image file (jpg, png)

**Output:**
```json
{
  "detected": true,
  "damageType": "pothole",
  "severity": "high",
  "confidence": 0.92,
  "boxes": [[x, y, w, h]]
}
```

**Supported Damage Types:**
- Crack
- Pothole
- Undamaged

**Severity Levels:**
- Low (minor issues, can wait)
- Medium (should be repaired soon)
- High (urgent repairs needed)

## Development Tips

### Testing API Endpoints
Use Postman or cURL:

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get reports
curl -X GET http://localhost:5000/api/reports \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Monitoring
- Backend logs: Check terminal where `npm run dev` is running
- Frontend errors: Browser DevTools console
- AI Model logs: Terminal where `python app.py` is running

### Database
Connect to MongoDB:
```bash
mongodb://localhost:27017/drone-system
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check connection string in .env

### Port Already in Use
- Backend: `lsof -i :5000` then `kill -9 PID`
- Frontend: `lsof -i :3000` then `kill -9 PID`
- AI Model: `lsof -i :5001` then `kill -9 PID`

### Socket.io Connection Issues
- Check CORS settings in backend
- Ensure frontend URL matches server configuration

### AI Model Not Responding
- Verify Flask server is running on port 5001
- Check AI_MODEL_URL in backend .env

## Future Enhancements

- [ ] Multi-drone support
- [ ] Advanced ML model integration
- [ ] Historical trend analysis
- [ ] Email notifications
- [ ] Mobile app
- [ ] 3D visualization
- [ ] Integration with repair services
- [ ] Cost estimation

## Security Considerations

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ CORS configuration
- ✅ Input validation
- ✅ Error handling
- ⚠️ Add rate limiting
- ⚠️ Add request logging
- ⚠️ Implement HTTPS in production

## License

MIT

## Support

For issues and questions, please create an issue in the repository.
