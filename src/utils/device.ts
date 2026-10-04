export interface DeviceInfo {
  id: string;
  name: string;
  type: 'pc' | 'mobile';
  os: string;
  browser: string;
}

export function getDeviceInfo(): DeviceInfo {
  const ua = navigator.userAgent || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) || window.innerWidth < 768;

  let os = 'Unknown OS';
  if (/Windows NT 10.0/i.test(ua)) os = 'Windows 11/10';
  else if (/Windows/i.test(ua)) os = 'Windows';
  else if (/iPhone/i.test(ua)) os = 'iOS (iPhone)';
  else if (/iPad/i.test(ua)) os = 'iPadOS';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Linux/i.test(ua)) os = 'Linux';

  let browser = 'Browser';
  if (/Chrome|CriOS/i.test(ua) && !/Edg|OPR/i.test(ua)) browser = 'Chrome';
  else if (/Safari/i.test(ua) && !/Chrome|CriOS/i.test(ua)) browser = 'Safari';
  else if (/Firefox|FxiOS/i.test(ua)) browser = 'Firefox';
  else if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/OPR|Opera/i.test(ua)) browser = 'Opera';

  // Get or persist a persistent device ID for this browser
  let deviceId = localStorage.getItem('beamdrop_device_id');
  if (!deviceId) {
    deviceId = `dev_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('beamdrop_device_id', deviceId);
  }

  // Persistent friendly device name
  let savedName = localStorage.getItem('beamdrop_device_name');
  if (!savedName) {
    if (isMobile) {
      if (/iPhone/i.test(ua)) savedName = 'iPhone';
      else if (/iPad/i.test(ua)) savedName = 'iPad';
      else if (/Android/i.test(ua)) savedName = 'Android Phone';
      else savedName = 'Mobile Device';
    } else {
      if (/Macintosh/i.test(ua)) savedName = 'MacBook';
      else if (/Windows/i.test(ua)) savedName = 'Windows PC';
      else savedName = 'Desktop PC';
    }
    localStorage.setItem('beamdrop_device_name', savedName);
  }

  return {
    id: deviceId,
    name: savedName,
    type: isMobile ? 'mobile' : 'pc',
    os,
    browser,
  };
}

export function updateDeviceName(name: string): void {
  localStorage.setItem('beamdrop_device_name', name);
}
