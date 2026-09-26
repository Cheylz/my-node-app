
const fs = require('fs');


const N = 11; 
const studentInfo = {
    fullName: 'Мандрыкин Никита',
    group: '478',
    variant: N,
    favorites: [
        'Грокаем Алгоритмы',
        'Человек-паук(Мультсериал)',
        'Невероятный Человек-паук2(Фильм)',
        'Клинок Рассекающий Демонов',
        'Боку-но-пика'
    ]
};

const fileName = `student_${N}.txt`;


function createStudentFile() {
    const now = new Date();
    const dateTimeStr = now.toLocaleString('ru-RU'); 

    const lines = [
        `Фамилия и имя студента: ${studentInfo.fullName}`,
        `Номер группы: ${studentInfo.group}`,
        `Номер варианта: ${studentInfo.variant}`,
        `Текущая дата и время: ${dateTimeStr}`,
        `Список любимых книг/фильмов:`,
        ...studentInfo.favorites
    ];

    fs.writeFileSync(fileName, lines.join('\n') + '\n', 'utf8');
    console.log(`Файл "${fileName}" успешно создан.`);
}


function appendRecordCount() {
    const content = fs.readFileSync(fileName, 'utf8');
    const lineCount = content.split('\n').filter(line => line.trim() !== '').length;

    fs.appendFileSync(fileName, `Количество записей: ${lineCount}\n`, 'utf8');
    console.log(`В файл добавлена строка с количеством записей: ${lineCount}`);
}


function printFileContent() {
    const content = fs.readFileSync(fileName, 'utf8');
    const lines = content.split('\n').filter(line => line.trim() !== '');

    console.log('\n' + '='.repeat(50));
    console.log(`СОДЕРЖИМОЕ ФАЙЛА: ${fileName}`);
    console.log('='.repeat(50));

    lines.forEach((line, index) => {
        console.log(`${String(index + 1).padStart(2, '0')}. ${line}`);
    });

    console.log('='.repeat(50) + '\n');
}

function main() {
    createStudentFile();
    appendRecordCount();
    printFileContent();
}

main();