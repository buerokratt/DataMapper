export function stringToList(str, block) {
  var out = "";
  if (!str) return "";
  const parts = str.split(",");
  parts.map(function (prop, i) {
    out += block.fn({ value: `"${prop}"${i < parts.length - 1 ? "," : ""}` });
  });
  return out;
}

export function getUuid() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

export function lookup(configurationArray, key) {
  for (let i = 0; i < configurationArray.length; i++) {
    if (configurationArray[i].key === key) {
      return configurationArray[i].value;
    }
  }
  return "";
}

export function calculateDateDifference(value) {
  const { startDate, endDate, outputType } = value;
  const sDate = new Date(startDate);
  const eDate = new Date(endDate);
  const timeDifferenceInSeconds = (eDate.getTime() - sDate.getTime()) / 1000;

  switch (outputType?.toLowerCase()) {
    case "years":
      const differenceInYears = eDate.getFullYear() - sDate.getFullYear();
      return differenceInYears;
    case "months":
      const differenceInMonths =
        eDate.getMonth() -
        sDate.getMonth() +
        12 * (eDate.getFullYear() - sDate.getFullYear());
      return differenceInMonths;
    case "hours":
      const differenceInHours = Math.round(Math.abs(eDate - sDate) / 36e5);
      return differenceInHours;
    case "minutes":
      const differenceInMinutes = Math.floor(timeDifferenceInSeconds / 60);
      return differenceInMinutes;
    case "seconds":
      return timeDifferenceInSeconds;
    default:
      const differenceInDays = Math.round(
        timeDifferenceInSeconds / (3600 * 24)
      );
      return differenceInDays;
  }
}

export function toJSON(obj) {
  return JSON.stringify(obj);
}

export function eq(a, b) {
  return a == b;
}

export function jsonParse(obj) {
  return JSON.parse(obj);
}

export function arrayIsNotEmpty(array) {
  return !(!Array.isArray(array) || !array.length);
}

export function extractSlotKeys(obj) {
  const keys = [];

  function iterate(obj) {
    for (const key in obj) {
      keys.push(key);
    }
  }

  iterate(obj);

  return keys;
}

export function getObjectKeys(obj) {
  return Object.keys(obj);
}

export function ne(a, b) {
  return a !== b;
}

export function valueExists(array, value) {
  return array.includes(value);
}

export function removeEntityFromArray(entities) {
  const index = entities.indexOf(entityToRemove);
  if (index > -1) {
    entities.splice(index, 1);
  }
  return entities;
}

export function assign(varName, varValue, options) {
  if (!options.data.root) {
    options.data.root = {};
  }
  options.data.root[varName] = varValue;
}

export function sortEntities(entities) {
  return entities.sort((a, b) => (a.name > b.name ? 1 : -1));
}

export function isInModel(intentTitle, intents) {
  const inModelIntents = intents?.inmodel;
  return Array.isArray(inModelIntents)
    ? inModelIntents.includes(intentTitle)
    : false;
}

export function findConnectedServiceId(intentTitle, intents) {
  const name = intentTitle.replace("_", " ");
  const service = intents?.connections.find((x) => x.intent === name);
  return service?.service ?? "";
}

export function getCount(intentTitle, intents) {
  const intentCounts = intents.count;
  const intentCount = intentCounts?.find((intent) => intent.key === intentTitle)
    ?.examples_counts?.value;
  return intentCount || 0;
}

export function addStringIfAbsent(input, addString) {
  if (input.startsWith(addString)) {
    return input;
  } else {
    return addString + input;
  }
}

export function concatStringIfAbsent(input, addString) {
  if (input.endsWith(addString)) {
    return input;
  } else {
    return input + addString;
  }
}

export function findMatchInObject(object, key, keyModifier) {
  if (object) {
    const result = object[keyModifier + key];
    return result ? result[0].text : "";
  }
  return "";
}

export function filterArrayByKey(array, key) {
  return array.filter((ar) => ar[key].trim() !== "");
}

export function notEmpty(value, options) {
  if (typeof value === "string" && value.trim() !== "") {
    return options.fn(this);
  }
  return options.inverse(this);
}

export function isType(type, value) {
  return typeof value === type;
}

export function filterOutServicesConnectedToIntent(body) {
  const { connections, services } = body;
  const usedServiceIds = new Set(connections.map((x) => x.service));
  return services.filter((x) => !usedServiceIds.has(x.serviceId));
}
