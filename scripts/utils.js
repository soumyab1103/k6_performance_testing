
import papaparse from "../papaparse.min.js";  //A JavaScript CSV parser library //Converts CSV text → JSON objects

export function readCSV(path) {
  const raw = open(path);            // must be in init/global context //Read raw CSV file
  if (!raw) {
    console.error(`Failed to read CSV at path: ${path}`);
    return [];                       // always return an array
  }
 
  const parsed = papaparse.parse(raw, {        //PapaParse converts CSV text → array of objects.
    header: true,       // because you use user.username, user.password
    skipEmptyLines: true,
  });

  if (parsed.errors && parsed.errors.length) {
    console.error(`CSV parse errors for ${path}:`, JSON.stringify(parsed.errors));
  }

  return parsed.data;   // array of objects: [{ username, password }, ...]
}
