# Setup Guide for AI Road Analysis Drone System

This guide will help you set up the complete system on Windows.

## Prerequisites

### Required Software
1. **Node.js** (v16+)
   - Download: https://nodejs.org
   - Verify: Open PowerShell and run `node -v` and `npm -v`

2. **Python** (3.8+)
   - Download: https://www.python.org
   - During installation, check "Add Python to PATH"
   - Verify: Open PowerShell and run `python --version`

3. **MongoDB** (Community Edition)
   - Download: https://www.mongodb.com/try/download/community
   - Follow installation wizard
   - Or use MongoDB Atlas cloud: https://www.mongodb.com/cloud/atlas

4. **Git** (Optional but recommended)
   - Download: https://git-scm.com

## Installation Steps

### 1. Clone/Extract Project

If you have Git:
```powershell
git clone <your-repo-url>
cd "ai road drone system"
```

Or if you have the ZIP file:
- Extract the folder to your desired location
- Open PowerShell and navigate to the extracted folder

### 2. Backend Setup

```powershell
cd backend
npm install

# Create .env file
Copy-Item .env.example .env
# Edit .env file and update values if needed
notepad .env
```

Start backend:
```powershell
npm run dev
# Server will run on http://localhost:5000
```

### 3. Frontend Setup

Open a new PowerShell window and navigate to project:
```powershell
cd frontend
npm install
npm start
# Frontend will open on http://localhost:3000
```

### 4. AI Model Setup

Open another PowerShell window and navigate to project:
```powershell
cd ai-model

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run AI model
python app.py
# AI model will run on http://localhost:5001
```

## Accessing the Application

Once all services are running:

1. **Frontend Dashboard**: http://localhost:3000
2. **Backend API**: http://localhost:5000
3. **AI Model**: http://localhost:5001
4. **MongoDB**: mongodb://localhost:27017

## Default Credentials

**To create a test account:**

1. Go to http://localhost:3000
2. Click "Create Account"
3. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Role: Engineer

Or test the login page to see working features.

## Database Setup

### Option 1: Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```powershell
   # MongoDB should auto-start, or restart it with:
   net start MongoDB
   ```

### Option 2: MongoDB Atlas (Cloud)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/drone-system
   ```

## Troubleshooting

### Port Already in Use

If you get "Port X already in use" error:

```powershell
# Find process using port 5000 (for backend)
Get-NetTCPConnection -LocalPort 5000

# Kill the process (replace PID)
Stop-Process -Id <PID> -Force

# Or use different ports in .env
```

### MongoDB Connection Failed

```powershell
# Check if MongoDB is running
Get-Service MongoDB

# Start MongoDB service
net start MongoDB

# If issues persist, check connection string in .env
```

### Python Virtual Environment Issues

```powershell
# If activation fails, try:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then activate again:
.\venv\Scripts\Activate.ps1
```

### Frontend Won't Connect to Backend

1. Check that backend is running on port 5000
2. Check browser console for errors (F12)
3. Ensure CORS is enabled in backend

### AI Model Not Responding

```powershell
# Make sure Flask is running
# Test the endpoint:
curl http://localhost:5001/health
```

## Testing the API

### Using PowerShell

```powershell
# Register user
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
    role = "engineer"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

# Login
$loginBody = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
    -Method POST `
    -Body $loginBody `
    -ContentType "application/json"

$token = $loginResponse.token

# Get reports
Invoke-RestMethod -Uri "http://localhost:5000/api/reports" `
    -Method GET `
    -Headers @{Authorization = "Bearer $token"}
```

## Development Workflow

### Terminal 1 - Backend
```powershell
cd backend
npm run dev
```

### Terminal 2 - Frontend
```powershell
cd frontend
npm start
```

### Terminal 3 - AI Model
```powershell
cd ai-model
.\venv\Scripts\Activate.ps1
python app.py
```

### Terminal 4 - MongoDB (if local)
```powershell
# Usually runs automatically, or:
net start MongoDB
```

## Project Structure

```
ai road drone system/
├── backend/              # Node.js + Express API
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth middleware
│   ├── services/        # Business logic
│   ├── package.json
│   ├── server.js
│   └── .env
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API & Socket services
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── public/
├── ai-model/            # Flask AI API
│   ├── app.py
│   ├── requirements.txt
│   └── venv/            # Virtual environment
└── docker-compose.yml   # Docker configuration
```

## Docker Deployment (Advanced)

### Prerequisites
- Docker Desktop for Windows
- Download: https://www.docker.com/products/docker-desktop

### Deploy with Docker
```powershell
# Make sure Docker is running
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f ai-model

# Stop services
docker-compose down
```

## Production Deployment

Before deploying to production:

1. **Security**
   - Change JWT_SECRET in .env
   - Use strong passwords
   - Enable HTTPS
   - Set up firewall rules

2. **Environment**
   - Set NODE_ENV=production
   - Use production MongoDB URI
   - Configure proper CORS origins

3. **Monitoring**
   - Set up error logging
   - Configure uptime monitoring
   - Set up alerts

4. **Database**
   - Enable MongoDB authentication
   - Regular backups
   - Configure replication

## Getting Help

- Check logs in terminal where services are running
- Use browser DevTools (F12) to check frontend errors
- Visit http://localhost:5000/api/health to verify backend
- Visit http://localhost:5001/health to verify AI model

## Next Steps

1. Familiarize yourself with the dashboard
2. Test the complete workflow:
   - Create a new mission
   - Simulate image upload
   - Check damage detection
   - View reports

3. Customize:
   - Update color schemes in CSS
   - Add custom drone models
   - Integrate with real drone APIs

4. Deploy:
   - Follow production deployment guide
   - Set up CI/CD pipeline
   - Configure monitoring and alerts

## Support

For issues:
1. Check the troubleshooting section
2. Review README.md for architecture info
3. Check browser console and server logs
4. Verify all services are running on correct ports
