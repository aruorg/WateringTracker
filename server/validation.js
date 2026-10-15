// Keep these in sync with client/src/validation.js and the table's CHECK constraints.
export const PLANT_NAME_MAX = 60;
export const WATER_DAYS_MIN = 1;
export const WATER_DAYS_MAX = 30;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Returns { values } on success or { error } with a message for the client.
export function validatePlant(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Request body must be a JSON object' };
  }

  const { plant, days_between_watering } = body;

  if (typeof plant !== 'string') {
    return { error: 'plant is required and must be a string' };
  }

  const name = plant.trim();

  if (!name) {
    return { error: 'plant must not be blank' };
  }
  if (name.length > PLANT_NAME_MAX) {
    return { error: `plant must be at most ${PLANT_NAME_MAX} characters` };
  }

  if (!Number.isInteger(days_between_watering)) {
    return { error: 'days_between_watering is required and must be a whole number' };
  }
  if (days_between_watering < WATER_DAYS_MIN || days_between_watering > WATER_DAYS_MAX) {
    return {
      error: `days_between_watering must be between ${WATER_DAYS_MIN} and ${WATER_DAYS_MAX}`,
    };
  }

  return { values: { plant: name, days_between_watering } };
}

export function isUuid(value) {
  return UUID_PATTERN.test(value);
}
