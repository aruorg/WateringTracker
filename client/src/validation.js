export const PLANT_NAME_MAX = 60;
export const WATER_DAYS_MIN = 1;
export const WATER_DAYS_MAX = 30;

// Returns { values, errors }. values is only safe to send when errors is empty.
export function validatePlant({ plant, days_between_watering }) {
  const errors = {};
  const name = plant.trim();
  const days = Number(days_between_watering);

  if (!name) {
    errors.plant = 'Plant name is required';
  } else if (name.length > PLANT_NAME_MAX) {
    errors.plant = `Plant name must be at most ${PLANT_NAME_MAX} characters`;
  }

  if (String(days_between_watering).trim() === '') {
    errors.days_between_watering = 'Watering interval is required';
  } else if (!Number.isInteger(days)) {
    errors.days_between_watering = 'Must be a whole number of days';
  } else if (days < WATER_DAYS_MIN || days > WATER_DAYS_MAX) {
    errors.days_between_watering = `Must be between ${WATER_DAYS_MIN} and ${WATER_DAYS_MAX} days`;
  }

  return { values: { plant: name, days_between_watering: days }, errors };
}
