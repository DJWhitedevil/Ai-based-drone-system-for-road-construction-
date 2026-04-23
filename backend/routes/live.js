const express = require('express');
const multer = require('multer');
const axios = require('axios');
const DamageReport = require('../models/DamageReport');
const DroneSession = require('../models/DroneSession');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

module.exports = (io) => {
  // POST - Receive drone frame from drone
  router.post('/frame', upload.single('frame'), async (req, res) => {
    try {
      const { sessionId, latitude, longitude, altitude, battery, speed } = req.body;

      if (!sessionId || !req.file) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Update session with latest telemetry
      const session = await DroneSession.findByIdAndUpdate(
        sessionId,
        {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          altitude: parseFloat(altitude),
          battery: parseFloat(battery),
          speed: parseFloat(speed),
          connectionStatus: 'connected'
        },
        { new: true }
      );

      // Send frame to AI model for analysis
      const formData = new FormData();
      formData.append('file', new Blob([req.file.buffer]), 'frame.jpg');

      try {
        const aiResponse = await axios.post(
          `${process.env.AI_MODEL_URL}/detect`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        if (aiResponse.data.detected) {
          // Create damage report from AI detection
          const report = new DamageReport({
            imageURL: `/uploads/frame-${Date.now()}.jpg`,
            location: { lat: latitude, lng: longitude },
            damageType: aiResponse.data.damageType,
            severity: aiResponse.data.severity,
            confidence: aiResponse.data.confidence,
            session: sessionId
          });
          await report.save();

          // Update session damage count
          session.totalDamages += 1;
          await session.save();

          // Emit alert to all connected clients
          io.emit('damage-alert', {
            id: report._id,
            damageType: report.damageType,
            severity: report.severity,
            location: { lat: latitude, lng: longitude },
            confidence: aiResponse.data.confidence
          });
        }
      } catch (aiError) {
        console.error('AI Model error:', aiError.message);
      }

      // Broadcast telemetry update
      io.to(`drone-${sessionId}`).emit('telemetry-update', {
        sessionId,
        latitude,
        longitude,
        altitude,
        battery,
        speed
      });

      res.json({ status: 'received', sessionId });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // POST - Receive GPS coordinates
  router.post('/gps', async (req, res) => {
    try {
      const { sessionId, latitude, longitude } = req.body;

      if (!sessionId || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Update session location
      await DroneSession.findByIdAndUpdate(sessionId, {
        latitude,
        longitude
      });

      // Broadcast GPS update
      io.to(`drone-${sessionId}`).emit('gps-update', {
        latitude,
        longitude,
        timestamp: new Date()
      });

      res.json({ status: 'received' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // POST - Receive telemetry data
  router.post('/telemetry', async (req, res) => {
    try {
      const { sessionId, battery, altitude, speed, connectionStatus } = req.body;

      if (!sessionId) {
        return res.status(400).json({ message: 'Session ID required' });
      }

      await DroneSession.findByIdAndUpdate(sessionId, {
        battery: battery || undefined,
        altitude: altitude || undefined,
        speed: speed || undefined,
        connectionStatus: connectionStatus || 'connected'
      });

      // Broadcast telemetry
      io.to(`drone-${sessionId}`).emit('telemetry-update', {
        battery,
        altitude,
        speed,
        connectionStatus,
        timestamp: new Date()
      });

      res.json({ status: 'received' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  return router;
};
