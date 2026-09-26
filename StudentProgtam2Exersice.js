
const fs = require('fs');
const path = require('path');


const N = 11; 
const isEven = N % 2 === 0;
const rootDir = `project_${N}`;


const folderDescriptions = {
    '': 'Корневая папка проекта.',
    'src': 'Исходный код проекта.',
    'src/modules': 'Модули приложения.',
    'src/components': 'Компоненты приложения.',
    'src/components/1': 'Вложенная папка компонента №1.',
    'src/components/2': 'Вложенная папка компонента №2.',
    'src/components/3': 'Вложенная папка компонента №3.',
    'src/utils': 'Вспомогательные утилиты.',
    'data': 'Данные проекта.',
    'data/input': 'Входные данные.',
    'data/output': 'Выходные данные (результаты обработки).',
    'temp': 'Временные файлы.'
};


function getFolderList() {
    const folders = [
        '',
        'src',
        'src/modules',
        'src/components',
        'src/utils',
        'data',
        'data/input',
        'data/output',
        'temp'
    ];

    
    if (!isEven) {
        folders.push('src/components/1', 'src/components/2', 'src/components/3');
    }

    return folders;
}


function createStructure() {
    const folders = getFolderList();
    folders.forEach((folder) => {
        const fullPath = path.join(rootDir, folder);
        fs.mkdirSync(fullPath, { recursive: true });
    });
    console.log(`Структура каталогов "${rootDir}" создана.\n`);
}


function createInfoFiles() {
    const folders = getFolderList();
    folders.forEach((folder) => {
        const fullPath = path.join(rootDir, folder);
        const description = folderDescriptions[folder] || 'Папка проекта.';

        fs.writeFileSync(path.join(fullPath, 'info.txt'), description + '\n', 'utf8');

        if (isEven) {
            const dateStr = new Date().toLocaleString('ru-RU');
            fs.writeFileSync(path.join(fullPath, 'README.md'), `Дата создания: ${dateStr}\n`, 'utf8');
        }
    });
    console.log('Файлы info.txt' + (isEven ? ' и README.md' : '') + ' созданы во всех папках.\n');
}


function printTree(dir, prefix = '') {
    const items = fs.readdirSync(dir, { withFileTypes: true })
        .sort((a, b) => {
            
            if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1;
            return a.name.localeCompare(b.name);
        });

    items.forEach((item, index) => {
        const isLast = index === items.length - 1;
        const connector = isLast ? '└── ' : '├── ';
        console.log(prefix + connector + item.name + (item.isDirectory() ? '/' : ''));

        if (item.isDirectory()) {
            const newPrefix = prefix + (isLast ? '    ' : '│   ');
            printTree(path.join(dir, item.name), newPrefix);
        }
    });
}

function showTree(title) {
    console.log(title);
    console.log(rootDir + '/');
    printTree(rootDir);
    console.log('');
}

function moveTempIntoData() {
    fs.renameSync(path.join(rootDir, 'temp'), path.join(rootDir, 'data', 'temp'));
    console.log('Папка temp перемещена в data/temp.\n');
}

function renameOutputToResults() {
    fs.renameSync(path.join(rootDir, 'data', 'output'), path.join(rootDir, 'data', 'results'));
    console.log('Папка data/output переименована в data/results.\n');
}


function removeTemp() {
    fs.rmSync(path.join(rootDir, 'data', 'temp'), { recursive: true, force: true });
    console.log('Папка data/temp удалена со всем содержимым.\n');
}

function main() {
    createStructure();
    createInfoFiles();

    showTree('=== ДЕРЕВО СТРУКТУРЫ ПОСЛЕ СОЗДАНИЯ ===');

    moveTempIntoData();
    renameOutputToResults();
    removeTemp();

    showTree('=== ОБНОВЛЁННОЕ ДЕРЕВО СТРУКТУРЫ ===');
}

main();