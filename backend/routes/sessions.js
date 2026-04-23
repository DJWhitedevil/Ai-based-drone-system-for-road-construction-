const express = require('express');
const DroneSession = require('../models/DroneSession');
const DamageReport = require('../models/DamageReport');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// POST - Start new drone session
router.post('/start', authMiddleware, async (req, res) => {
  try {
    const { area, droneId } = req.body;

    const session = new DroneSession({
      startTime: new Date(),
      area,
      droneId,
      operator: req.userId
    });

    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT - End session
router.put('/:id/end', authMiddleware, async (req, res) => {
  try {
    const session = await DroneSession.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    session.endTime = new Date();
    session.status = 'completed';

    // Calculate summary
    const reports = await DamageReport.find({ session: session._id });
    session.totalDamages = reports.length;
    session.reports = reports.map(r => r._id);

    // Count by type and severity
    const typeSummary = reports.reduce((acc, r) => {
      acc[r.damageType] = (acc[r.damageType] || 0) + 1;
      acc[r.severity] = (acc[r.severity] || 0) + 1;
      return acc;
    }, {});

    session.damageSummary = {
      cracks: typeSummary.crack || 0,
      potholes: typeSummary.pothole || 0,
      undamaged: typeSummary.undamaged || 0
    };

    session.severitySummary = {
      high: typeSummary.high || 0,
      medium: typeSummary.medium || 0,
      low: typeSummary.low || 0
    };

    await session.save();
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT - Pause/Resume session
router.put('/:id/pause', authMiddleware, async (req, res) => {
  try {
    const session = await DroneSession.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    session.status = session.status === 'active' ? 'paused' : 'active';
    await session.save();
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - All sessions
router.get('/', async (req, res) => {
  try {
    const sessions = await DroneSession.find()
      .populate('operator', 'name email')
      .sort({ startTime: -1 });
    
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - Single session
router.get('/:id', async (req, res) => {
  try {
    const session = await DroneSession.findById(req.params.id)
      .populate('operator', 'name email')
      .populate('reports');
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
