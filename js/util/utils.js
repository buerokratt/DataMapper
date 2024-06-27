import path from "path";
import fs from "fs";
import { parse as parseYmlToJson } from "yaml";

export const assignSecrets = (data, result) => {
  Object.keys(data).forEach((k) => {
    if (typeof data[k] === "object") {
      result[k] = {};
      assignSecrets(data[k], result[k]);
    }
    result[k] = data[k];
  });
};

export const mapSecretToJson = (secrets) => {
  const result = {};
  secrets.forEach((secretPath) => {
    try {
      const data = parseYmlToJson(fs.readFileSync(secretPath, "utf8"));
      assignSecrets(data, result);
    } catch (_) {
      return;
    }
  });
  return result;
};

export const buildContentFilePath = (fileName) => {
  const normalizedPath = path
    .normalize(fileName)
    .replace(/^(\.\.(\/|\\|$))+/, "");
  return path.join(process.env.CONTENT_FOLDER || "data", normalizedPath);
};

export const isValidFilename = (fileName) => {
  return fileName && /^[0-9a-zA-Z-._/]+$/.test(fileName);
};

export const isValidFilePath = (filePath) => {
  return (
    filePath &&
    isValidFilename(filePath) &&
    path.normalize(filePath).includes("..") === false
  );
};

export const getAllFiles = function (dirPath) {
  const folder = path.join(process.env.CONTENT_FOLDER || "data", dirPath);
  return getAllFilesInsideFolder(folder);
};

const getAllFilesInsideFolder = function (dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFilesInsideFolder(
        dirPath + "/" + file,
        arrayOfFiles
      );
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
};

export const readFile = function (filePath) {
  const data = fs.readFileSync(filePath, { encoding: "utf8" });
  return Buffer.from(data).toString();
};

export const parseBoolean = (value) => {
  return value?.toLowerCase() === "true";
};

export const getUrl = (dir) => {
  let startIndex;
  if (dir.includes("/POST")) {
    startIndex = dir.indexOf("/POST") + "/POST".length;
  } else {
    startIndex = dir.indexOf("/GET") + "/GET".length;
  }
  return dir.substring(startIndex);
};

export const getHeadersMapping = (csv_type) => {
  if (csv_type === "companies") {
    return {
      Registrikood: "registry_code",
      Nimi: "name",
      Liik: "type",
      "Registreeritud käibemaksukohustuslaste registrisse": "vat_register",
      "EMTAK tegevusvaldkond, mis on EMTAKi struktuuris tähistatud tähtkoodiga":
        "emtak_field_of_activity",
      Maakond: "county",
      "Riiklikud Maksud": "national_taxes",
      "Tööjõumaksud Ja Maksed": "labor_taxes_and_payments",
      Kaive: "turnover",
      Tootajaid: "workers",
    };
  } else if (csv_type === "municipalities") {
    return {
      KUU: "month",
      MAAKOND: "county",
      "KOHALIK OMAVALITSUS": "local_government",
      TEGEVUSALA: "field_of_activity",
      "Keskmine palk sellel tegevusalal omavalitsuse territooriumil tegutsevates ettevõtetes (eurodes)":
        "average_salary_in_field_of_activity_municipality",
      "Keskmine palk Eestis (eurodes)": "average_salary_estonia",
      "Keskmine palk sellel tegevusalal (eurodes)":
        "average_salary_in_field_of_activity",
      "Juriidiliste isikute arv omavalitsuses":
        "legal_entities_count_municipality",
      "Tegutsevate ettevõtete arv omavalitsuses":
        "companies_count_municipality",
      "Tegutsevate ettevõtete arv Eestis": "companies_count_estonia",
      "Tegutsevate ettevõtete arv sellel tegevusalal":
        "companies_count_in_field_of_activity",
      "Töötajatega ettevõtete arv omavalitsuses":
        "companies_count_with_employees_municipality",
      "Töötajatega ettevõtete arv Eestis":
        "companies_count_with_employees_estonia",
      "Töötajatega ettevõtete arv sellel tegevusalal Eestis":
        "companies_count_with_employees_in_field_of_activity_estonia",
      "Deklaratsiooni KMD esitavate juriidiliste isikute arv omavalitsuses":
        "municipality_legal_entities_kmd_count",
      "Käive kokku (eurodes)": "total_turnover",
      "Eksport  (eurodes)": "export",
      "Tasumisele kuuluv käibemaks (eurodes)": "vat_payable",
      "Omavalitsuse tööandjate deklaratsioonis TSD märgitud töötajate arv":
        "municipal_employers_tsd_count",
      "Omavalitsuse tööandjate  deklareeritud tööjõumaksud (eurodes)":
        "labor_taxes_declared_by_municipal_employer",
    };
  } else {
    return {};
  }
};
