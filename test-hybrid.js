const FileManagerHybrid = require('./fileOperationsHybrid');
const { FileManagerError } = require('./fileOperationsHybrid');

const fm = new FileManagerHybrid('./test-data-hybrid');

(async () => {
    console.log('=== ГИБРИДНЫЙ РЕЖИМ ===\n');

    
    console.log('1) Промис-стиль:');
    const path1 = await fm.createFile('a.txt', 'Файл A');
    console.log('  ✅ создан:', path1);

    const content = await fm.readFile('a.txt');
    console.log('  ✅ содержимое:', content);

    
    console.log('\n2) Колбэк-стиль:');
    fm.createFile('b.txt', 'Файл B', (err, filePath) => {
        if (err) {
            console.error('  ❌', err.message);
            return;
        }
        console.log('  ✅ создан:', filePath);

        fm.readFile('b.txt', (err, data) => {
            if (err) {
                console.error('  ❌', err.message);
                return;
            }
            console.log('  ✅ содержимое:', data);

            
            console.log('\n3) Обработка ошибок:');

            
            fm.readFile('нет-такого-файла.txt')
                .then(() => {})
                .catch(e => {
                    console.log('  ⚠ Промис-ошибка:', e.name, '|', e.code);
                    console.log('    Причина:', e.cause.code); // ENOENT и т.п.
                })
                .finally(async () => {
                    
                    fm.readFile('тоже-нет.txt', (err) => {
                        if (err) {
                            console.log('  ⚠ Колбэк-ошибка:', err.code);
                        }

                        
                        fm.listFiles((err, files) => {
                            if (err) return console.error(err.message);
                            console.log('\n4) Файлы:', files);

                            Promise.all(files.map(f => fm.deleteFile(f)))
                                .then(() => console.log('\n✅ Очистка завершена'));
                        });
                    });
                });
        });
    });
})();