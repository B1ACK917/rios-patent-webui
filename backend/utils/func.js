const { setTimeout } = require('core-js');
const fs = require('fs')
const { promisify } = require('util');
const logger = require('./log')
const exec = promisify(require('child_process').exec)
const { Parser } = require('@json2csv/plainjs')

var templateBegin, templateEnd;
var HDFSFileList = {};

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

function GenNonDuplicateID(randomLength) {
    return Number(Math.random().toString().substr(2, randomLength) + Date.now()).toString(36)
}

fs.readFile('./scala_templates/stable/begin.tp', 'utf-8', (err, data) => {
    if (err) return logger.error(err.message);
    templateBegin = data;
    logger.info("Begin template loaded")
})
fs.readFile('./scala_templates/stable/end.tp', 'utf-8', (err, data) => {
    if (err) return logger.error(err.message);
    templateEnd = data;
    logger.info("End template loaded")
})

// Functions
function parseFileNames(inputString) {
    var lines = inputString.trim().split('\n');
    var filenames = [];

    for (var i = 1; i < lines.length; i++) {
        var line = lines[i];
        var filePath = line.split(' ').pop();
        var fileNameWithExtension = filePath.split('/').pop();
        var fileName = fileNameWithExtension.split('.csv')[0]; // 移除文件扩展名.csv
        filenames.push(
            {
                tableName: fileName,
                tableHDFSPath: filePath
            }
        );
    }

    return filenames;
}

function addSpaces(inputString) {
    var lines = inputString.split('\n');
    var outputString = '';

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        outputString += '        ' + line + '\n'
    }

    return outputString;
}

async function loadHDFSFileList() {
    var fileList = {
        "csv": [],
        "g_brf_sum_text": [],
        "g_claims": [],
        "g_detail_desc_text": [],
        "g_draw_desc_text": []
    }
    for (const [key, value] of Object.entries(fileList)) {
        logger.info(`${key} refreshed`)
        var shellRes = await exec(`hdfs dfs -ls /patent/uspto/${key}`)
        fileList[key] = parseFileNames(shellRes.stdout)
    }
    HDFSFileList = fileList;
}

function refreshHDFSFileList() {
    loadHDFSFileList()
    logger.info("HDFS file list refreshed")
    setTimeout(refreshHDFSFileList, 1000 * 1800)
}

function getHDFSFileList() {
    return HDFSFileList
}

function getTemplateContext() {
    return {
        begin: templateBegin,
        end: templateEnd
    }
}

async function loadTemplateFromDisk(filename) {
    fullFilename = './scala_templates/' + filename + '.scala'
    logger.info(`Request load template ${fullFilename}`)
    try {
        return fs.readFileSync(fullFilename, 'utf-8')
    }
    catch (e) {
        logger.error(e)
    }
}

function pollCheck(queryID, taskList, taskName) {
    if (queryID in taskList) {
        result = {
            status: true,
            data: taskList[queryID]
        }
        delete taskList[queryID]
        logger.info(queryID + ` removed from ${taskName}`)
    }
    else {
        result = {
            status: false,
            data: null
        }
    }
    return result
}

function writeCsvToDisk(taskID, JSONString) {
    const csvParser = new Parser()
    try {
        const csv = csvParser.parse(JSONString)
        const csvFile = `./temp/TaskData/${taskID}.csv`
        fs.open(csvFile, "w", (err, fd) => {
            if (err) {
                logger.error(err.message);
            } else {
                fs.write(fd, csv, (err, bytes) => {
                    if (err) {
                        logger.error(err.message);
                    } else {
                        logger.debug(bytes + ` bytes written to ${csvFile}`);
                    }
                })
            }
        })
        return csv
    }
    catch {
        logger.error("Error parsing JSON to CSV");
        return "";
    }
}


// setTimeout(refreshHDFSFileList, 0)

module.exports = {
    sleep,
    getHDFSFileList,
    getTemplateContext,
    loadTemplateFromDisk,
    pollCheck,
    GenNonDuplicateID,
    addSpaces,
    writeCsvToDisk
}