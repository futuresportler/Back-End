const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const results = [];
const csvFilePath = path.join(__dirname, 'Archery_data.csv');
const jsonFilePath = path.join(__dirname, 'Archery_data.json');

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    // Extract headers from the first row
    const headers = results[0];
    
    // Process all subsequent rows
    const processedData = results.slice(1).map(row => {
      const newObj = {};
      for (const [key, value] of Object.entries(row)) {
        // Use the header value as the new key, trimming any whitespace
        const newKey = headers[key] ? headers[key].trim() : key;
        newObj[newKey] = value;
      }
      return newObj;
    });

    fs.writeFileSync(jsonFilePath, JSON.stringify(processedData, null, 2));
    console.log('CSV has been converted to JSON with proper keys and saved as Archery_data.json 🎯');
  });