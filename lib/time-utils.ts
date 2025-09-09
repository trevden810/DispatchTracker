// Time conversion utility for FileMaker decimal time format
export function convertFileMakerTime(decimalTime: string | number): string | null {
  if (!decimalTime || decimalTime === '') return null;
  
  const decimal = typeof decimalTime === 'string' ? parseFloat(decimalTime) : decimalTime;
  if (isNaN(decimal)) return null;
  
  // Convert decimal to hours and minutes
  const totalMinutes = decimal * 24 * 60; // Convert fraction of day to minutes
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  
  // Format as HH:MM
  const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  
  return timeString;
}