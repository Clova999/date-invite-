import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App, { STORAGE_KEY } from './App.jsx'
import './index.css'

/*
  Testing hatch. Loading the app with ?reset in the URL wipes her saved
  answers so the ask screen plays again from scratch. There is deliberately
  no button for this anywhere in the interface.

  This runs before React renders, so the wipe always lands before the first
  read of localStorage. The parameter is then stripped from the address bar,
  so a later refresh behaves like a normal visit instead of resetting again.
*/
if (new URLSearchParams(window.location.search).has('reset')) {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Private mode. Nothing was saved to clear anyway.
  }
  const url = new URL(window.location.href)
  url.searchParams.delete('reset')
  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
