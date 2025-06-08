export class ReadingTracker {
  constructor() {
    this.startTime = null;
    this.scrollEvents = [];
    this.isTracking = false;
    this.lastScrollTime = 0;
    this.scrollThrottle = 200; // スクロールイベント記録の間隔（ミリ秒）
    this.maxScrollEvents = 100; // 最大記録数を制限
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
    
    // スロットリング: 一定時間内のスクロールイベントは無視
    if (now - this.lastScrollTime < this.scrollThrottle) {
      return;
    }
    
    // 最大記録数に達した場合、古いイベントを削除
    if (this.scrollEvents.length >= this.maxScrollEvents) {
      this.scrollEvents.shift(); // 最古のイベントを削除
    }
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    this.scrollEvents.push({
      timestamp: now - this.startTime,
      scrollPosition: scrollTop
    });
    
    this.lastScrollTime = now;
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
    this.lastScrollTime = 0;
  }
}