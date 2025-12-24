const reporter = require("k6-html-reporter");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

// 1️⃣ Find latest summary file
const summaries = fs
  .readdirSync(__dirname)
  .filter((f) => f.startsWith("summary_") && f.endsWith(".json"));

if (summaries.length === 0) {
  console.error("❌ No summary JSON found");
  process.exit(1);
}

const latestSummary = summaries
  .map((f) => ({
    file: f,
    time: fs.statSync(path.join(__dirname, f)).mtime.getTime(),
  }))
  .sort((a, b) => b.time - a.time)[0].file;

// 2️⃣ Date folder: DD-MM-YYYY
const now = new Date();
const dateFolder = `${String(now.getDate()).padStart(2, "0")}-${String(
  now.getMonth() + 1
).padStart(2, "0")}-${now.getFullYear()}`;

// 3️⃣ Time stamp: HH-MM-SS
const timeStamp = `${String(now.getHours()).padStart(2, "0")}-${String(
  now.getMinutes()
).padStart(2, "0")}-${String(now.getSeconds()).padStart(2, "0")}`;

// 4️⃣ Create day-wise report folder
const reportDir = path.join(__dirname, `report_${dateFolder}`);
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

// 5️⃣ HTML file inside day folder
const reportFile = path.join(
  reportDir,
  `report_${dateFolder}_${timeStamp}.html`
);

// 6️⃣ Generate report
try {
  reporter.generateSummaryReport({
    jsonFile: path.join(__dirname, latestSummary),
    output: reportFile,
    title: `k6 Load Test Report - ${dateFolder} ${timeStamp}`,
  });

  console.log(`✅ Report generated from ${latestSummary}`);
  console.log(`📂 Folder : report_${dateFolder}`);
  console.log(`📄 File   : report_${dateFolder}_${timeStamp}.html`);

  // 7️⃣ Auto-open report in default browser
  openReport(reportFile);
} catch (err) {
  console.error("❌ Error generating report:", err);
}

// ---------- Helper: Open HTML ----------
function openReport(filePath) {
  const absolutePath = path.resolve(filePath);

  let command;
  if (process.platform === "win32") {
    command = `start "" "${absolutePath}"`;
  } else if (process.platform === "darwin") {
    command = `open "${absolutePath}"`;
  } else {
    command = `xdg-open "${absolutePath}"`;
  }

  exec(command, (err) => {
    if (err) {
      console.error("⚠️ Could not auto-open report:", err.message);
    } else {
      console.log("🌐 Report opened in default browser");
    }
  });
}
