export class ReadingTracker {
  constructor() {
    this.startTime = null;
    this.scrollEvents = [];
    this.isTracking = false;
  }

  startTracking() {
    this.startTime = Date.now();
    this.scrollEvents = [];
    this.isTracking = true;
    
    // スクロールイベントのリスナーを追加
    window.addEventListener('scroll', this.handleScroll.bind(this));
  }

  stopTracking() {
    this.isTracking = false;
    window.removeEventListener('scroll', this.handleScroll.bind(this));
  }

  handleScroll() {
    if (!this.isTracking) return;
    
    const now = Date.now();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    this.scrollEvents.push({
      timestamp: now - this.startTime,
      scrollPosition: scrollTop
    });
  }

  getReadingTime() {
    if (!this.startTime) return 0;
    return Math.round((Date.now() - this.startTime) / 1000);
  }

  getScrollData() {
    return {
      totalScrollEvents: this.scrollEvents.length,
      scrollPattern: this.scrollEvents
    };
  }

  reset() {
    this.startTime = null;
    this.scrollEvents = [];
    this.isTracking = false;
  }
}