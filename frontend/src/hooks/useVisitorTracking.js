import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const API = process.env.REACT_APP_BACKEND_URL;
const SESSION_KEY = 'tgme_sid';

function getSessionId() {
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

export function useVisitorTracking() {
  const location = useLocation();

  useEffect(() => {
    // Skip tracking for workspace/portal/admin pages
    if (location.pathname.startsWith('/workspace') || location.pathname.startsWith('/portal')) return;

    const params = new URLSearchParams(location.search);
    const payload = {
      page: location.pathname,
      referrer: document.referrer || '',
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      session_id: getSessionId(),
    };

    fetch(`${API}/api/leads/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {}); // fire and forget
  }, [location.pathname, location.search]);
}
