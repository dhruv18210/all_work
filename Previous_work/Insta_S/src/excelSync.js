const { getScheduledPosts } = require('./googleSheets');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const EXCEL_FILE_PATH = path.join(__dirname, '..', 'GoogleSheet_Export.xlsx');
const SHEET_NAME = 'Content';

/**
 * Fetch all rows from Google Sheets and save to GoogleSheet_Export.xlsx
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
const syncSheetsToExcel = async () => {
    try {
        console.log('Fetching data from Google Sheets to store in Excel...');
        // Fetch all rows from row 1 to column Q
        const data = await getScheduledPosts(`${SHEET_NAME}!A1:Q`);
        if (!data || data.length === 0) {
            console.log('No data fetched from Google Sheets.');
            return false;
        }

        console.log(`Fetched ${data.length} rows. Writing to Excel...`);
        const ws = xlsx.utils.aoa_to_sheet(data);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, SHEET_NAME);
        xlsx.writeFile(wb, EXCEL_FILE_PATH);
        console.log(`✅ Successfully synced Google Sheets to ${EXCEL_FILE_PATH}`);
        return true;
    } catch (error) {
        console.error('❌ Error syncing to Excel:', error.message);
        return false;
    }
};

/**
 * Read the current rows from GoogleSheet_Export.xlsx
 * @returns {Array<Array>} Array of arrays representing sheet rows
 */
const readExcelRows = () => {
    try {
        if (!fs.existsSync(EXCEL_FILE_PATH)) {
            console.error(`Excel file not found at ${EXCEL_FILE_PATH}`);
            return [];
        }
        const workbook = xlsx.readFile(EXCEL_FILE_PATH);
        const worksheet = workbook.Sheets[SHEET_NAME];
        if (!worksheet) {
            console.error(`Sheet "${SHEET_NAME}" not found in workbook`);
            return [];
        }
        return xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    } catch (error) {
        console.error('❌ Error reading Excel file:', error.message);
        return [];
    }
};

/**
 * Update the status of a specific row in the Excel file
 * @param {number} rowNumber 1-based row number
 * @param {string} status The new status (e.g., 'Published', 'FAILED')
 * @returns {boolean} True if successful, false otherwise
 */
const updateExcelStatus = (rowNumber, status) => {
    try {
        if (!fs.existsSync(EXCEL_FILE_PATH)) {
            console.error(`Excel file not found at ${EXCEL_FILE_PATH}, cannot update status.`);
            return false;
        }
        const workbook = xlsx.readFile(EXCEL_FILE_PATH);
        const worksheet = workbook.Sheets[SHEET_NAME];
        if (!worksheet) {
            console.error(`Sheet "${SHEET_NAME}" not found in workbook, cannot update status.`);
            return false;
        }

        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
        const rowIndex = rowNumber - 1;

        if (rowIndex >= data.length) {
            while (data.length <= rowIndex) {
                data.push([]);
            }
        }

        if (!data[rowIndex]) {
            data[rowIndex] = [];
        }

        // Column M is index 12
        data[rowIndex][12] = status;

        const updatedWs = xlsx.utils.aoa_to_sheet(data);
        const newWb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(newWb, updatedWs, SHEET_NAME);
        xlsx.writeFile(newWb, EXCEL_FILE_PATH);

        console.log(`✅ Successfully updated row ${rowNumber} status to "${status}" in Excel.`);
        return true;
    } catch (error) {
        console.error(`❌ Error updating Excel status for row ${rowNumber}:`, error.message);
        return false;
    }
};

module.exports = {
    syncSheetsToExcel,
    readExcelRows,
    updateExcelStatus
};
