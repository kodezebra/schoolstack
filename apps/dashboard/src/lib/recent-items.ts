import { useState, useEffect } from 'react'

export interface RecentItem {
  id: string
  type: 'student' | 'staff' | 'exam' | 'page' | 'payment' | 'report'
  title: string
  subtitle?: string
  to: string
  timestamp: number
}

const STORAGE_KEY = 'kidzkave_recent_items'
const MAX_ITEMS = 10

export function useRecentItems() {
  const [recentItems, setRecentItems] = useState<RecentItem[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setRecentItems(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Failed to load recent items:', error)
    }
  }, [])

  // Add a new recent item
  const addRecentItem = (item: Omit<RecentItem, 'timestamp'>) => {
    setRecentItems(prev => {
      // Remove if already exists (to move to top)
      const filtered = prev.filter(i => i.id !== item.id)
      const newItem: RecentItem = { ...item, timestamp: Date.now() }
      const updated = [newItem, ...filtered].slice(0, MAX_ITEMS)
      
      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch (error) {
        console.error('Failed to save recent items:', error)
      }
      
      return updated
    })
  }

  // Clear all recent items
  const clearRecentItems = () => {
    setRecentItems([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear recent items:', error)
    }
  }

  return { recentItems, addRecentItem, clearRecentItems }
}
