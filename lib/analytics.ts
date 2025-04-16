// Analytics utility functions
export const trackEvent = (eventName: string, properties: Record<string, any>) => {
  // In a real implementation, you would send this to your analytics service
  // For now, we'll just log to console
  console.log('Analytics Event:', eventName, properties)
}

export const trackFilterClick = (filterType: string, value: string) => {
  trackEvent('filter_click', {
    filter_type: filterType,
    value,
    timestamp: new Date().toISOString()
  })
}

export const trackGiftClick = (giftTitle: string) => {
  trackEvent('gift_click', {
    gift_title: giftTitle,
    timestamp: new Date().toISOString()
  })
} 