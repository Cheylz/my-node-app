
const fs = require('fs');
const path = require('path');
const util = require('util');


const pWriteFile = util.promisify(fs.writeFile);
const pReadFile  = util.promisify(fs.readFile);
const pUnlink    = util.promisify(fs.unlink);
const pReaddir   = util.promisify(fs.readdir);
const pStat      = util.promisify(fs.stat);

class FileManagerError extends Error {
    constructor(message, code, cause) {
        super(message);
        this.name = 'FileManagerError';
        this.code = code;
        this.cause = cause;
    }
}

class FileManagerHybrid {
    constructor(baseDir = './data-hybrid') {
        this.baseDir = baseDir;
        if (!fs.existsSync(baseDir)) {
            fs.mkdirSync(baseDir, { recursive: true });
            console.log(`Создана директория: ${baseDir}`);
        }
    }

    /**
     
     * @param {Function} promiseFactory - () => Promise
     * @param {Function|null} callback - (err, result) => void
     */
    _dispatch(promiseFactory, callback) {
        const promise = Promise.resolve().then(promiseFactory);

        if (typeof callback === 'function') {
            promise
                .then(result => callback(null, result))
                .catch(err => callback(err, null));
            return undefined; 
        }
        return promise; 
    }

    /**
     * Создание файла
     * @param {string} filename
     * @param {string} content
     * @param {Function} [callback] 
     * @returns {Promise<string>|undefined}
     */
    createFile(filename, content, callback) {
        const filePath = path.join(this.baseDir, filename);
        return this._dispatch(async () => {
            try {
                await pWriteFile(filePath, content, 'utf8');
                return filePath;
            } catch (err) {
                throw new FileManagerError(
                    `Не удалось создать файл "${filename}"`,
                    'CREATE_FAILED',
                    err
                );
            }
        }, callback);
    }

    /**
     * Чтение файла
     * @param {string} filename
     * @param {Function} [callback] - (err, content) => void
     * @returns {Promise<string>|undefined}
     */
    readFile(filename, callback) {
        const filePath = path.join(this.baseDir, filename);
        return this._dispatch(async () => {
            try {
                return await pReadFile(filePath, 'utf8');
            } catch (err) {
                throw new FileManagerError(
                    `Не удалось прочитать файл "${filename}"`,
                    'READ_FAILED',
                    err
                );
            }
        }, callback);
    }

    getFileStats(filename, callback) {
        const filePath = path.join(this.baseDir, filename);
        return this._dispatch(async () => {
            try {
                const stats = await pStat(filePath);
                return {
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime,
                    isFile: stats.isFile()
                };
            } catch (err) {
                throw new FileManagerError(
                    `Не удалось получить статистику "${filename}"`,
                    'STAT_FAILED',
                    err
                );
            }
        }, callback);
    }

    deleteFile(filename, callback) {
        const filePath = path.join(this.baseDir, filename);
        return this._dispatch(async () => {
            try {
                await pUnlink(filePath);
                return true;
            } catch (err) {
                throw new FileManagerError(
                    `Не удалось удалить файл "${filename}"`,
                    'DELETE_FAILED',
                    err
                );
            }
        }, callback);
    }

    listFiles(callback) {
        return this._dispatch(async () => {
            try {
                const entries = await pReaddir(this.baseDir);
                const stats = await Promise.all(
                    entries.map(async (name) => {
                        const s = await pStat(path.join(this.baseDir, name));
                        return { name, isFile: s.isFile() };
                    })
                );
                return stats.filter(s => s.isFile).map(s => s.name);
            } catch (err) {
                throw new FileManagerError(
                    'Не удалось получить список файлов',
                    'LIST_FAILED',
                    err
                );
            }
        }, callback);
    }

    createMultipleFiles(files, callback) {
        return this._dispatch(async () => {
            const results = await Promise.all(
                files.map(({ filename, content }) =>
                    this.createFile(filename, content) 
                )
            );  
            return results;
        }, callback);
    }
}

module.exports = FileManagerHybrid;
module.exports.FileManagerError = FileManagerError;