// lib/gtag.ts
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

// Declare gtag as a global function
declare global {
  interface Window {
    gtag: (
      command: string,
      target: string,
      params?: { [key: string]: any }
    ) => void
  }
}

// Log page views
export const pageview = (url: string) => {
  window.gtag('config', GA_MEASUREMENT_ID!, {
    page_path: url,
  })
}

// Log specific events
export const event = ({ action, category, label, value }: {
  action: string
  category: string
  label: string
  value?: number
}) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
} 