class VoiceService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.enabled = true;
    this.voice = null;
    this.lastAnnouncement = 0;
    this.announcementCooldown = 5000; // 5 seconds between same announcements

    // Try to get a professional sounding voice
    const loadVoices = () => {
      const voices = this.synth.getVoices();
      // Look for Google UK English Male/Female or similar high-quality voices
      this.voice = voices.find(v => v.name.includes('Google') && v.lang.includes('en')) || 
                   voices.find(v => v.lang.includes('en')) || 
                   voices[0];
    };

    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
    loadVoices();
  }

  speak(text, priority = 'normal') {
    if (!this.enabled || !this.synth) return;

    // Check cooldown for normal priority to avoid spamming
    const now = Date.now();
    if (priority === 'normal' && now - this.lastAnnouncement < this.announcementCooldown) {
      return;
    }

    // Cancel any ongoing speech for high priority
    if (priority === 'high') {
      this.synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) utterance.voice = this.voice;
    
    // Set professional robotic tone
    utterance.pitch = 0.85; 
    utterance.rate = 1.05;
    utterance.volume = 1.0;

    this.synth.speak(utterance);
    this.lastAnnouncement = now;
  }

  announceDetection(type, severity, location = null) {
    let msg = `Detection confirmed: ${type}. `;
    
    if (severity === 'high') {
      msg = `Warning! Critical ${type} detected. `;
    }

    if (location && location.lat && location.lng) {
      msg += `at coordinates ${location.lat.toFixed(2)}, ${location.lng.toFixed(2)}. `;
    }

    msg += "Logging incident to central database.";
    
    this.speak(msg, severity === 'high' ? 'high' : 'normal');
  }

  toggle(state) {
    this.enabled = state !== undefined ? state : !this.enabled;
    if (!this.enabled) this.synth.cancel();
    return this.enabled;
  }
}

const voiceService = new VoiceService();
export default voiceService;
