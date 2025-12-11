// generate_report.js
const reporter = require('k6-html-reporter');

try {
    reporter.generateSummaryReport({
        jsonFile: './summary.json',
        output: './report',
        title: 'k6 Load Test Report'
    });
    console.log('✅ Report generated in ./report');
} catch (err) {
    console.error('❌ Error generating report:', err);
}

