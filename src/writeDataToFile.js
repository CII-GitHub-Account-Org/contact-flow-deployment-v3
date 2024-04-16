import fs from 'fs';
import path from 'path';

// Helper function to write data to a file
async function writeDataToFile(fileName, data) {
        try {
            const fullPath = path.resolve(process.env.GITHUB_WORKSPACE, 'src', fileName);
            console.log('Writing data to file...');
            fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
            console.log(`Data written to ${fullPath}`);
        } catch (error) {
            console.error('Error writing file:', error);
        }
    }

module.exports = writeDataToFile;
