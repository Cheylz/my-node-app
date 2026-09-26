
const fs = require('fs');
const readline = require('readline');
const path = require('path');

const N = 11; 
const LINES_TO_GENERATE = 100000; 
const HIGH_WATER_MARK = 64 * 1024; 

const dataFile = `data_${N}.txt`;
const processedFile = `processed_${N}.txt`;
const filteredFile = `filtered_${N}.txt`; 


function fmt(num) {
    return num.toLocaleString('en-US');
}

function formatSize(bytes) {
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} МБ`;
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} КБ`;
}

async function generateFileIfNeeded() {
    if (fs.existsSync(dataFile)) {
        console.log(`Файл "${dataFile}" уже существует, генерация пропущена.`);
        return;
    }

    console.log(`Генерирую файл "${dataFile}" (${fmt(LINES_TO_GENERATE)} строк)...`);
    const writeStream = fs.createWriteStream(dataFile, { highWaterMark: HIGH_WATER_MARK });

    const BATCH_SIZE = 2000;
    let buffer = '';

    for (let i = 1; i <= LINES_TO_GENERATE; i++) {
        const randomNum = Math.floor(Math.random() * 1000) + 1;
        buffer += `${i}, ${randomNum}, Вариант ${N}\n`;

        if (i % BATCH_SIZE === 0 || i === LINES_TO_GENERATE) {
            const canContinue = writeStream.write(buffer);
            buffer = '';
            if (!canContinue) {
                
                await new Promise((resolve) => writeStream.once('drain', resolve));
            }
        }
    }

    await new Promise((resolve, reject) => {
        writeStream.end(() => resolve());
        writeStream.on('error', reject);
    });

    console.log(`Файл "${dataFile}" сгенерирован.\n`);
}

function countLines(filePath) {
    return new Promise((resolve, reject) => {
        let count = 0;
        let lastChunkEndsWithNewline = true;

        const stream = fs.createReadStream(filePath, { highWaterMark: HIGH_WATER_MARK });
        stream.on('data', (chunk) => {
            const str = chunk.toString('utf8');
            for (let i = 0; i < str.length; i++) {
                if (str[i] === '\n') count++;
            }
            lastChunkEndsWithNewline = str.endsWith('\n');
        });
        stream.on('end', () => {
            if (!lastChunkEndsWithNewline) count++; 
            resolve(count);
        });
        stream.on('error', reject);
    });
}

async function processFile(totalLines) {
    const stats = fs.statSync(dataFile);
    console.log(` Обработка файла: ${dataFile}`);
    console.log(`Размер файла: ${formatSize(stats.size)}\n`);

    const startTime = Date.now();

    const readStream = fs.createReadStream(dataFile, { highWaterMark: HIGH_WATER_MARK });
    const rl = readline.createInterface({ input: readStream, crlfDelay: Infinity });
    const filteredWriteStream = fs.createWriteStream(filteredFile);

    let lineCount = 0;
    let sum = 0;
    let max = -Infinity;
    let min = Infinity;
    let lastProgressPrinted = 0;

    for await (const line of rl) {
        if (!line.trim()) continue;

        
        const parts = line.split(',');
        const num = parseInt(parts[1].trim(), 10);

        if (!Number.isNaN(num)) {
            lineCount++;
            sum += num;
            if (num > max) max = num;
            if (num < min) min = num;

            
            if (num > 500) {
                filteredWriteStream.write(line + '\n');
            }
        }

        
        const progress = Math.floor((lineCount / totalLines) * 100);
        if (progress >= lastProgressPrinted + 10 && progress <= 100) {
            lastProgressPrinted = progress - (progress % 10);
            console.log(`Прогресс: ${lastProgressPrinted}% (${fmt(lineCount)} строк обработано)`);
        }
    }

    await new Promise((resolve) => filteredWriteStream.end(resolve));

    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);
    const average = lineCount > 0 ? sum / lineCount : 0;

    console.log(`\nОбработка завершена!`);
    console.log(`Результаты:`);
    console.log(`  - Всего строк: ${fmt(lineCount)}`);
    console.log(`  - Сумма чисел: ${fmt(sum)}`);
    console.log(`  - Среднее значение: ${average.toFixed(2)}`);
    console.log(`  - Максимальное число: ${max}`);
    console.log(`  - Минимальное число: ${min}`);

    return { lineCount, sum, average, max, min, elapsedSec };
}

function saveProcessedReport(results) {
    const content = [
        `Обработка файла: ${dataFile}`,
        `Всего строк: ${fmt(results.lineCount)}`,
        `Сумма чисел: ${fmt(results.sum)}`,
        `Среднее значение: ${results.average.toFixed(2)}`,
        `Максимальное число: ${results.max}`,
        `Минимальное число: ${results.min}`,
        `Время выполнения: ${results.elapsedSec} сек`,
        `Строки с числами > 500 сохранены в: ${filteredFile}`
    ].join('\n') + '\n';

    fs.writeFileSync(processedFile, content, 'utf8');
    console.log(`\nРезультаты сохранены в: ${processedFile}`);
    console.log(` Строки с числами > 500 сохранены в: ${filteredFile}`);
    console.log(`\n Время выполнения: ${results.elapsedSec} сек`);
}

async function main() {
    await generateFileIfNeeded();

    const totalLines = await countLines(dataFile);
    const results = await processFile(totalLines);
    saveProcessedReport(results);
}

main().catch((err) => {
    console.error('Ошибка выполнения:', err);
    process.exit(1);
});