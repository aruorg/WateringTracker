export const PLANT_NAME_MAX = 100;
export const WATER_DAYS_MIN = 1;
export const WATER_DAYS_MAX = 60;

// Returns { values, errors }. values is only safe to send when errors is empty.
export function validatePlant({ plant_name, water_every_days }) {
  const errors = {};
  const name = plant_name.trim();
  const days = Number(water_every_days);

  if (!name) {
    errors.plant_name = 'Plant name is required';
  } else if (name.length > PLANT_NAME_MAX) {
    errors.plant_name = `Plant name must be at most ${PLANT_NAME_MAX} characters`;
  }

  if (String(water_every_days).trim() === '') {
    errors.water_every_days = 'Watering interval is required';
  } else if (!Number.isInteger(days)) {
    errors.water_every_days = 'Must be a whole number of days';
  } else if (days < WATER_DAYS_MIN || days > WATER_DAYS_MAX) {
    errors.water_every_days = `Must be between ${WATER_DAYS_MIN} and ${WATER_DAYS_MAX} days`;
  }

  return { values: { plant_name: name, water_every_days: days }, errors };
}
