'use client'

import { useEffect } from 'react'

export function BrowserExtensionHandler() {
  useEffect(() => {
    // Remove browser extension attributes that cause hydration issues
    const removeExtensionAttributes = () => {
      const body = document.body
      const extensionAttributes = [
        'data-atm-ext-installed',
        'data-new-gr-c-s-check-loaded',
        'data-gr-ext-installed',
        'cz-shortcut-listen',
        'data-gramm',
        'spellcheck'
      ]
      
      extensionAttributes.forEach(attr => {
        if (body.hasAttribute(attr)) {
          body.removeAttribute(attr)
        }
      })
    }

    // Run immediately and after a short delay
    removeExtensionAttributes()
    const timeout = setTimeout(removeExtensionAttributes, 100)

    // Clean up
    return () => clearTimeout(timeout)
  }, [])

  return null
}