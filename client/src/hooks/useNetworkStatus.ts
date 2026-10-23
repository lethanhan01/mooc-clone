import { useState, useEffect } from 'react'

export interface NetworkStatus {
  isOnline: boolean
  wasOffline: boolean
  downlink?: number
}

interface NetworkInformation extends EventTarget {
  downlink?: number
  effectiveType?: string
  rtt?: number
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true
  })

  const [wasOffline, setWasOffline] = useState<boolean>(false)

  const [downlink, setDownlink] = useState<number | undefined>(() => {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const conn = (navigator as unknown as { connection?: NetworkInformation }).connection
      return conn?.downlink
    }
    return undefined
  })

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    let connection: NetworkInformation | undefined
    const handleConnectionChange = () => {
      if (connection?.downlink !== undefined) {
        setDownlink(connection.downlink)
      }
    }

    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      connection = (navigator as unknown as { connection?: NetworkInformation }).connection
      connection?.addEventListener('change', handleConnectionChange)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      connection?.removeEventListener('change', handleConnectionChange)
    }
  }, [])

  return { isOnline, wasOffline, downlink }
}
