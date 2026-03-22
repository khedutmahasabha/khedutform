/**
 * update-villages.js
 *
 * Reads village names from an Excel file and updates gujarat.json
 *
 * Usage:
 *   node update-villages.js <talukaName> <columnNumber> <startRow> [excelFileName]
 *
 * Examples:
 *   node update-villages.js "Daskroi" 3 3
 *   node update-villages.js "Anand" 1 2 my-villages.xlsx
 *
 * Args:
 *   talukaName    - Exact taluka name as in gujarat.json  (e.g. "Daskroi")
 *   columnNumber  - Excel column number (1 = A, 2 = B, 3 = C ...)
 *   startRow      - Row number where data starts (e.g. 3 if rows 1-2 are headers)
 *   excelFileName - Optional filename in Downloads dir (default: first .xlsx found)
 */

const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const os = require("os");

// ── Config ──────────────────────────────────────────────────────────────────

const DOWNLOADS_DIR = path.join(os.homedir(), "Downloads");
const JSON_PATH = path.join(__dirname, "data", "gujarat.json");

// ── Args ─────────────────────────────────────────────────────────────────────

const [, , talukaName, colArg, startRowArg, fileArg] = process.argv;

if (!talukaName || !colArg || !startRowArg) {
  console.error(`
Usage: node update-villages.js <talukaName> <columnNumber> <startRow> [excelFileName]

  talukaName    Exact taluka name (e.g. "Daskroi")
  columnNumber  Excel column number  1=A  2=B  3=C ...
  startRow      First row that has data (skip headers)
  excelFileName Optional .xlsx filename in Downloads (default: first xlsx found)

Example:
  node update-villages.js "Daskroi" 3 3
`);
  process.exit(1);
}

const colIndex = parseInt(colArg, 10) - 1; // 0-based for xlsx array
const startRow = parseInt(startRowArg, 10); // 1-based, same as Excel

if (isNaN(colIndex) || colIndex < 0) {
  console.error("❌  columnNumber must be a positive integer (1 = column A)");
  process.exit(1);
}

if (isNaN(startRow) || startRow < 1) {
  console.error("❌  startRow must be a positive integer");
  process.exit(1);
}

// ── Find Excel file ───────────────────────────────────────────────────────────

let excelPath;

if (fileArg) {
  excelPath = path.join(DOWNLOADS_DIR, fileArg);
  if (!fs.existsSync(excelPath)) {
    console.error(`❌  File not found: ${excelPath}`);
    process.exit(1);
  }
} else {
  const xlsxFiles = fs
    .readdirSync(DOWNLOADS_DIR)
    .filter((f) => f.endsWith(".xlsx") || f.endsWith(".xls"))
    .map((f) => ({
      name: f,
      mtime: fs.statSync(path.join(DOWNLOADS_DIR, f)).mtime,
    }))
    .sort((a, b) => b.mtime - a.mtime); // newest first

  if (xlsxFiles.length === 0) {
    console.error(`❌  No .xlsx files found in ${DOWNLOADS_DIR}`);
    process.exit(1);
  }

  excelPath = path.join(DOWNLOADS_DIR, xlsxFiles[0].name);
  console.log(`📂  Auto-selected: ${xlsxFiles[0].name}`);
}

// ── Read Excel ────────────────────────────────────────────────────────────────

console.log(`📖  Reading: ${excelPath}`);
const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Convert to 2D array (no header parsing — raw rows)
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

// Extract villages starting from startRow (convert to 0-based index)
const villages = [];
for (let i = startRow - 1; i < rows.length; i++) {
  const cell = rows[i][colIndex];
  const val = String(cell ?? "").trim();
  if (val) villages.push(val);
}

if (villages.length === 0) {
  console.error(
    `❌  No data found in column ${colArg} starting from row ${startRow}`,
  );
  console.error(
    `    Sheet has ${rows.length} rows. Check your column/row numbers.`,
  );
  process.exit(1);
}

console.log(
  `✅  Found ${villages.length} villages in column ${colArg} from row ${startRow}`,
);
console.log(
  `    Preview: ${villages.slice(0, 5).join(", ")}${villages.length > 5 ? " ..." : ""}`,
);

// ── Update gujarat.json ───────────────────────────────────────────────────────

if (!fs.existsSync(JSON_PATH)) {
  console.error(`❌  gujarat.json not found at: ${JSON_PATH}`);
  console.error(
    `    Make sure you run this script from inside the project folder.`,
  );
  process.exit(1);
}

const gujaratData = JSON.parse(fs.readFileSync(JSON_PATH, "utf-8"));

let talukaFound = false;
let districtName = "";

for (const district of gujaratData.districts) {
  const taluka = district.talukas.find(
    (t) => t.name.toLowerCase() === talukaName.toLowerCase(),
  );

  if (taluka) {
    talukaFound = true;
    districtName = district.name;

    const oldCount = taluka.villages.length;
    taluka.villages = villages; // replace entirely

    console.log(`\n🗺️   Taluka   : ${taluka.name}`);
    console.log(`    District  : ${districtName}`);
    console.log(`    Old count : ${oldCount} villages`);
    console.log(`    New count : ${villages.length} villages`);
    break;
  }
}

if (!talukaFound) {
  console.error(`\n❌  Taluka "${talukaName}" not found in gujarat.json`);
  console.error(`    Check spelling/case. Available talukas:`);
  gujaratData.districts.forEach((d) =>
    d.talukas.forEach((t) => console.error(`      - ${t.name}  (${d.name})`)),
  );
  process.exit(1);
}

// ── Write back ────────────────────────────────────────────────────────────────

fs.writeFileSync(JSON_PATH, JSON.stringify(gujaratData, null, 2), "utf-8");
console.log(`\n💾  gujarat.json updated successfully!`);
console.log(`    Restart your Next.js dev server to see changes.\n`);
