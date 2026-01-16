
export interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

export interface DeviceStatus {
  id: string;
  name: string;
  location: LocationData | null;
  battery?: number;
  isOnline: boolean;
}

export interface SafetyReport {
  status: 'safe' | 'warning' | 'unknown';
  summary: string;
  recommendations: string[];
}
