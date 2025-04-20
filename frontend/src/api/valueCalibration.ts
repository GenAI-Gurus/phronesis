import axios from 'axios';

export interface ValueCalibrationCheckin {
  id: string;
  user_id: string;
  created_at: string;
  value_snapshot: string; // JSON string
}

export async function createValueCalibrationCheckin(values: Record<string, number>): Promise<ValueCalibrationCheckin> {
  const resp = await axios.post('/api/value-calibration/checkins', {
    value_snapshot: JSON.stringify(values),
  }, { withCredentials: true });
  return resp.data;
}

export async function listValueCalibrationCheckins(): Promise<ValueCalibrationCheckin[]> {
  const resp = await axios.get('/api/value-calibration/checkins', { withCredentials: true });
  return resp.data;
}
