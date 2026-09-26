
const fs = require('fs');
const path = require('path');

const N = 11; 
const ALLOWED_EXTENSIONS = ['.js', '.json', '.txt', '.md'];

const targetDir = process.argv[2] || '.';


function scanDirectory(dir) {
    const result = {
        totalFolders: 0,
        totalFiles: 0,
        totalSize: 0,
        files: [] 
    };

    function walk(currentDir) {
        const items = fs.readdirSync(currentDir, { withFileTypes: true });

        items.forEach((item) => {
            const fullPath = path.join(currentDir, item.name);

            if (item.isDirectory()) {
                result.totalFolders++;
                walk(fullPath);
            } else if (item.isFile()) {
                const ext = path.extname(item.name).toLowerCase();

                
                if (!ALLOWED_EXTENSIONS.includes(ext)) {
                    return;
                }

                const stats = fs.statSync(fullPath);
                result.totalFiles++;
                result.totalSize += stats.size;
                result.files.push({
                    name: item.name,
                    ext: ext || '(без расширения)',
                    size: stats.size,
                    relativePath: './' + path.relative(targetDir, fullPath).split(path.sep).join('/')
                });
            }
        });
    }

    walk(dir);
    return result;
}


function formatSize(bytes) {
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb >= 1) return `${mb.toFixed(2)} МБ`;
    if (kb >= 1) return `${kb.toFixed(0)} КБ`;
    return `${bytes} байт`;
}


function buildStatistics(scanResult) {
    
    const extGroups = {};
    scanResult.files.forEach((file) => {
        if (!extGroups[file.ext]) {
            extGroups[file.ext] = { count: 0, size: 0 };
        }
        extGroups[file.ext].count++;
        extGroups[file.ext].size += file.size;
    });

    
    const sortedBySize = [...scanResult.files].sort((a, b) => b.size - a.size);
    const top5Largest = sortedBySize.slice(0, 5);
    const top5Smallest = [...scanResult.files].sort((a, b) => a.size - b.size).slice(0, 5);

    return {
        directory: targetDir,
        totalFolders: scanResult.totalFolders,
        totalFiles: scanResult.totalFiles,
        totalSizeBytes: scanResult.totalSize,
        totalSizeFormatted: formatSize(scanResult.totalSize),
        extensions: extGroups,
        top5Largest,
        top5Smallest,
        allowedExtensions: ALLOWED_EXTENSIONS,
        generatedAt: new Date().toISOString()
    };
}


function printStatistics(stats) {
    console.log(` Анализ директории: ${stats.directory}`);
    console.log('');
    console.log(` Общее количество папок: ${stats.totalFolders}`);
    console.log(` Общее количество файлов: ${stats.totalFiles}`);
    console.log(` Общий размер: ${stats.totalSizeFormatted} (${stats.totalSizeBytes.toLocaleString('ru-RU')} байт)`);
    console.log('');

    console.log(' Расширения файлов:');
    Object.entries(stats.extensions).forEach(([ext, data]) => {
        const wordForm = getFileWord(data.count);
        console.log(`  ${ext}: ${data.count} ${wordForm} (${formatSize(data.size)})`);
    });
    console.log('');

    console.log(' Топ-5 самых больших файлов:');
    stats.top5Largest.forEach((file, i) => {
        console.log(`  ${i + 1}. ${file.name} (${formatSize(file.size)}) - ${file.relativePath}`);
    });
    console.log('');

    console.log(' Топ-5 самых маленьких файлов:');
    stats.top5Smallest.forEach((file, i) => {
        console.log(`  ${i + 1}. ${file.name} (${formatSize(file.size)}) - ${file.relativePath}`);
    });
    console.log('');
}

function getFileWord(count) {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod100 >= 11 && mod100 <= 14) return 'файлов';
    if (mod10 === 1) return 'файл';
    if (mod10 >= 2 && mod10 <= 4) return 'файла';
    return 'файлов';
}

function saveReport(stats) {
    const reportFileName = `report_${N}.json`;
    fs.writeFileSync(reportFileName, JSON.stringify(stats, null, 2), 'utf8');
    console.log(`📝 Отчет сохранен: ${reportFileName}`);
}

function main() {
    if (!fs.existsSync(targetDir)) {
        console.error(`Ошибка: директория "${targetDir}" не найдена.`);
        process.exit(1);
    }

    const scanResult = scanDirectory(targetDir);
    const stats = buildStatistics(scanResult);
    printStatistics(stats);
    saveReport(stats);
}

main();