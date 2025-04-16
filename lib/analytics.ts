import { event } from './gtag'

// Analytics utility functions
export const trackEvent = (eventName: string, properties: Record<string, any>) => {
  event({
    action: eventName,
    category: 'User Interaction',
    label: JSON.stringify(properties),
    value: properties.value
  })
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