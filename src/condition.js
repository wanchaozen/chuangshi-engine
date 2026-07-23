/**
 * Condition evaluator for data-driven event systems.
 *
 * The original implementation was derived from VickScarlet/lifeRestart
 * and is distributed under the MIT License. This version adds input
 * validation, exported parsing, Map/object adapters, and explicit errors.
 */

const OPERATORS = ["!=", ">=", "<=", ">", "<", "=", "?", "!"];

export function parseCondition(source) {
  if (typeof source !== "string") {
    throw new TypeError("Condition must be a string.");
  }

  let cursor = 0;

  function parseGroup(stopAtClosingParen = false) {
    const nodes = [];
    let token = "";

    const flush = () => {
      const value = token.trim();
      if (value) nodes.push(value);
      token = "";
    };

    while (cursor < source.length) {
      const char = source[cursor++];

      if (char === "(") {
        flush();
        nodes.push(parseGroup(true));
      } else if (char === ")") {
        flush();
        if (!stopAtClosingParen) throw new SyntaxError("Unexpected closing parenthesis.");
        return nodes;
      } else if (char === "&" || char === "|") {
        flush();
        nodes.push(char);
      } else {
        token += char;
      }
    }

    flush();
    if (stopAtClosingParen) throw new SyntaxError("Missing closing parenthesis.");
    return nodes;
  }

  const parsed = parseGroup();
  validateParsed(parsed);
  return parsed;
}

function validateParsed(nodes) {
  if (!Array.isArray(nodes) || nodes.length === 0) return;
  if (nodes.length % 2 === 0) throw new SyntaxError("Condition has a missing operand.");

  nodes.forEach((node, index) => {
    if (index % 2 === 1) {
      if (node !== "&" && node !== "|") throw new SyntaxError(`Unsupported logical operator: ${node}`);
    } else if (Array.isArray(node)) {
      validateParsed(node);
    } else {
      parseComparison(node);
    }
  });
}

export function parseComparison(source) {
  const match = OPERATORS
    .map(operator => ({ operator, index: source.indexOf(operator) }))
    .filter(candidate => candidate.index > 0)
    .sort((a, b) => a.index - b.index || b.operator.length - a.operator.length)[0];

  if (!match) throw new SyntaxError(`Missing comparison operator in "${source}".`);

  const key = source.slice(0, match.index).trim();
  const rawValue = source.slice(match.index + match.operator.length).trim();
  if (!key || !rawValue) throw new SyntaxError(`Incomplete comparison in "${source}".`);

  let value;
  if (rawValue.startsWith("[")) {
    value = JSON.parse(rawValue);
    if (!Array.isArray(value)) throw new SyntaxError("Membership value must be an array.");
  } else {
    value = Number(rawValue);
    if (!Number.isFinite(value)) throw new SyntaxError(`Expected a number in "${source}".`);
  }

  return { key, operator: match.operator, value };
}

function propertyValue(properties, key) {
  if (properties instanceof Map) return properties.get(key);
  if (properties && typeof properties.get === "function") return properties.get(key);
  return properties?.[key];
}

function compare(properties, source) {
  const { key, operator, value } = parseComparison(source);
  const actual = propertyValue(properties, key);

  switch (operator) {
    case ">": return actual > value;
    case "<": return actual < value;
    case ">=": return actual >= value;
    case "<=": return actual <= value;
    case "=": return Array.isArray(actual) ? actual.includes(value) : actual == value;
    case "!=": return Array.isArray(actual) ? !actual.includes(value) : actual != value;
    case "?": return Array.isArray(actual)
      ? actual.some(item => value.includes(item))
      : value.includes(actual);
    case "!": return Array.isArray(actual)
      ? actual.every(item => !value.includes(item))
      : !value.includes(actual);
    default: return false;
  }
}

function evaluateParsed(properties, nodes) {
  if (!Array.isArray(nodes)) return compare(properties, nodes);
  if (nodes.length === 0) return true;

  let result = Array.isArray(nodes[0])
    ? evaluateParsed(properties, nodes[0])
    : compare(properties, nodes[0]);

  for (let index = 1; index < nodes.length; index += 2) {
    const operator = nodes[index];
    const right = nodes[index + 1];
    if (operator === "&") {
      result = result && evaluateParsed(properties, right);
    } else if (operator === "|") {
      result = result || evaluateParsed(properties, right);
    }
  }
  return result;
}

export function checkCondition(properties, source) {
  return evaluateParsed(properties, parseCondition(source));
}

export function extractMaxTriggers(source) {
  const match = /AGE\?\[([0-9,\s]+)\]/.exec(source);
  return match ? match[1].split(",").filter(Boolean).length : 1;
}
