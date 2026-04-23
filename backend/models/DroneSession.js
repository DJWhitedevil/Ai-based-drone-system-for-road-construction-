const mongoose = require('mongoose');

const DroneSessionSchema = new mongoose.Schema({
  startTime: {
    type: Date,
    required: true
  },
  endTime: Date,
  status: {
    type: String,
    enum: ['active', 'completed', 'paused'],
    default: 'active'
  },
  totalDistance: {
    type: Number,
    default: 0
  },
  totalDamages: {
    type: Number,
    default: 0
  },
  damageSummary: {
    cracks: { type: Number, default: 0 },
    potholes: { type: Number, default: 0 },
    undamaged: { type: Number, default: 0 }
  },
  severitySummary: {
    high: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    low: { type: Number, default: 0 }
  },
  area: String,
  operator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DamageReport'
  }],
  droneId: String,
  latitude: Number,
  longitude: Number,
  altitude: Number,
  battery: Number,
  speed: Number,
  connectionStatus: {
    type: String,
    enum: ['connected', 'disconnected', 'weak'],
    default: 'disconnected'
  }
}, { timestamps: true });

module.exports = mongoose.model('DroneSession', DroneSessionSchema);
