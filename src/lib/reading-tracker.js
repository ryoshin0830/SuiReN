export class ReadingTracker {
  constructor() {
    this.startTime = null;
    this.scrollEvents = [];
    this.isTracking = false;
    this.lastScrollTime = 0;
    this.scrollThrottle = 200; // スクロールイベント記録の間隔（ミリ秒）
    this.maxScrollEvents = 100; // 最大記録数を制限
    this.scrollElement = null; // 監視対象の要素
  }

  startTracking(element = null) {
    this.startTime = Date.now();
    this.scrollEvents = [];
    this.isTracking = true;
    this.scrollElement = element; // 監視対象の要素を設定
    
    // スクロールイベントのリスナーを追加
    if (this.scrollElement) {
      // 特定の要素のスクロールを監視
      this.scrollElement.addEventListener('scroll', this.handleScroll.bind(this));
    } else {
      // デフォルトはwindowのスクロールを監視
      window.addEventListener('scroll', this.handleScroll.bind(this));
    }
  }

  stopTracking() {
    this.isTracking = false;
    
    // スクロールイベントのリスナーを削除
    if (this.scrollElement) {
      this.scrollElement.removeEventListener('scroll', this.handleScroll.bind(this));
    } else {
      window.removeEventListener('scroll', this.handleScroll.bind(this));
    }
    
    this.scrollElement = null;
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
    
    // スクロール位置を取得
    let scrollTop;
    if (this.scrollElement) {
      scrollTop = this.scrollElement.scrollTop;
    } else {
      scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    }
    
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
    this.scrollElement = null;
  }
}