const IDENTIFIER = /[A-Za-z_\u3400-\u9fff][A-Za-z0-9_\u3400-\u9fff]*/g;
const CONDITION_TYPES = new Set([2, 3, 4, 5, 6]);
const SYSTEM_TARGETS = new Set(["END", "GAME_OVER"]);

function identifiers(value) {
  return String(value ?? "").match(IDENTIFIER) ?? [];
}

function push(map, key, eventKey) {
  if (!map.has(key)) map.set(key, []);
  if (!map.get(key).includes(eventKey)) map.get(key).push(eventKey);
}

function sortedObject(map) {
  return Object.fromEntries([...map.entries()].sort(([left], [right]) => left.localeCompare(right)));
}

export function auditEventDatabase(database) {
  const errors = [];
  if (!database || !Array.isArray(database.events)) {
    return {
      valid: false,
      summary: { events: 0, errors: 1, warnings: 0 },
      errors: ["The root object must contain an events array."],
      warnings: []
    };
  }

  const eventKeys = new Set();
  const duplicateEventKeys = new Map();
  const unknownIdentifiers = new Map();
  const unknownTargets = new Map();
  const referencedEvents = new Map();
  const brokenRandomArrays = [];
  const unsupportedConditionTypes = [];
  const unconditionalOrphans = [];
  const properties = new Set(database.properties ?? []);
  const flags = new Set(database.flags ?? []);

  for (const event of database.events) {
    if (!event?.key) {
      errors.push("An event is missing a non-empty key.");
      continue;
    }
    if (eventKeys.has(event.key)) push(duplicateEventKeys, event.key, event.key);
    eventKeys.add(event.key);
  }

  const known = new Set([...eventKeys, ...properties, ...flags]);

  for (const event of database.events) {
    if (!event?.key) continue;
    const conditions = Array.isArray(event.conditions) ? event.conditions : [];
    const choices = Array.isArray(event.choices) ? event.choices : [];

    if (!conditions.length && !event.triggeredOnly && !event.disabled) {
      unconditionalOrphans.push(event.key);
    }

    for (const condition of conditions) {
      if (!CONDITION_TYPES.has(condition.type)) {
        unsupportedConditionTypes.push({ event: event.key, type: condition.type });
      }
      if (!known.has(condition.key)) push(unknownIdentifiers, condition.key, event.key);
      for (const identifier of identifiers(condition.value)) {
        if (!known.has(identifier)) push(unknownIdentifiers, identifier, event.key);
      }
    }

    if (event.random) {
      const keys = event.random.keys ?? [];
      const values = event.random.values ?? [];
      if (keys.length !== values.length) brokenRandomArrays.push(event.key);
      keys.forEach(key => {
        if (key !== "RANDOM" && !known.has(key)) push(unknownIdentifiers, key, event.key);
      });
      values.flatMap(identifiers).forEach(identifier => {
        if (!known.has(identifier)) push(unknownIdentifiers, identifier, event.key);
      });
    }

    for (const choice of choices) {
      for (const effect of choice.effects ?? []) {
        if (eventKeys.has(effect.target)) {
          push(referencedEvents, effect.target, event.key);
        } else if (!known.has(effect.target) && !SYSTEM_TARGETS.has(effect.target)) {
          push(unknownTargets, effect.target, event.key);
        }
        for (const identifier of identifiers(effect.value)) {
          if (!known.has(identifier)) push(unknownIdentifiers, identifier, event.key);
        }
      }
    }
  }

  const warnings = [];
  if (duplicateEventKeys.size) warnings.push("Duplicate event keys were found.");
  if (unknownIdentifiers.size) warnings.push("Unknown identifiers were found in conditions or expressions.");
  if (unknownTargets.size) warnings.push("Unknown effect targets were found.");
  if (brokenRandomArrays.length) warnings.push("Random key/value arrays have mismatched lengths.");
  if (unsupportedConditionTypes.length) warnings.push("Unsupported condition comparison types were found.");
  if (unconditionalOrphans.length) warnings.push("Enabled events without conditions or inbound references were found.");

  return {
    valid: errors.length === 0 && warnings.length === 0,
    summary: {
      events: database.events.length,
      referencedEventTitles: referencedEvents.size,
      duplicateEventKeys: duplicateEventKeys.size,
      unknownIdentifiers: unknownIdentifiers.size,
      unknownEffectTargets: unknownTargets.size,
      brokenRandomArrays: brokenRandomArrays.length,
      unsupportedConditionTypes: unsupportedConditionTypes.length,
      unconditionalOrphans: unconditionalOrphans.length,
      errors: errors.length,
      warnings: warnings.length
    },
    errors,
    warnings,
    details: {
      duplicateEventKeys: sortedObject(duplicateEventKeys),
      unknownIdentifiers: sortedObject(unknownIdentifiers),
      unknownEffectTargets: sortedObject(unknownTargets),
      brokenRandomArrays,
      unsupportedConditionTypes,
      unconditionalOrphans,
      referencedEvents: sortedObject(referencedEvents)
    }
  };
}
