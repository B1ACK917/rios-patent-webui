const express = require('express')
const fs = require('fs')
const axios = require('axios')
const shell = require('shelljs');
const { setTimeout } = require('core-js');
const { Parser } = require('@json2csv/plainjs')
var log4js = require('log4js')

// Consts
const app = express();
const port = 23457;
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

// Global var
var taskList = {};
var templateBegin, templateEnd;
var HDFSFileList = {};

// Startup settings
log4js.configure({
    appenders: {
        datefileout: {
            type: "dateFile",
            filename: "log/run.log",
            pattern: "-yyyy-MM-dd"
        },
        consoleout: { type: "console" },
    },
    categories: {
        default: { appenders: ["datefileout", "consoleout"], level: "debug" },
        anything: { appenders: ["consoleout"], level: "debug" }
    }
});
var logger = log4js.getLogger()

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
        var shellRes = await shell.exec(`hdfs dfs -ls /patent/uspto/${key}`)
        fileList[key] = parseFileNames(shellRes)
    }
    HDFSFileList = fileList;
}

function refreshHDFSFileList() {
    loadHDFSFileList()
    logger.info("HDFS file list refreshed")
    setTimeout(refreshHDFSFileList, 1000 * 1800)
}

function GenNonDuplicateID(randomLength) {
    return Number(Math.random().toString().substr(2, randomLength) + Date.now()).toString(36)
}

// Routers
app.get('/getHDFSTableList', async (req, res) => {
    logger.info("Call /getHDFSTablesList");
    // shellRes = shell.exec("hdfs dfs -ls /patent/uspto/csv")
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send({
        tableList: HDFSFileList[req.query.tableType]
    })
})

app.get('/getTemplate', (req, res) => {
    logger.info("Call /getTemplate");
    fullFilename = './scala_templates/' + req.query.filename + '.scala'
    fs.readFile(fullFilename, 'utf-8', (err, data) => {
        if (err) return logger.error(err.message);
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.send(data)
        logger.debug('Load ' + fullFilename)
    })
})

app.get('/submitTask', async (req, res) => {
    logger.info("Call /submitTask");
    fullTask = templateBegin + addSpaces(req.query.executeCode) + templateEnd
    logger.debug(fullTask)

    query = {
        className: "ExecObj",
        packageName: "org.rioslab.spark.core.exec"
    }
    queryRouter = "http://localhost:19527/patent/publications/submit?"
    for (const [key, value] of Object.entries(query)) {
        queryRouter += "&" + key + "=" + value
    }
    logger.debug("Post " + queryRouter)
    const response = await axios.post(queryRouter,
        {
            code: fullTask
        });
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(response.data)
    // logger.debug(response.data)
})

app.get('/runTask', async (req, res) => {
    logger.info("Call /runTask");
    queryID = req.query.queryID
    logger.debug(`queryID: ${queryID}`)

    query = {
        className: "ExecObj",
        packageName: "org.rioslab.spark.core.exec"
    }
    queryRouter = "http://localhost:19527/patent/publications/run?"
    for (const [key, value] of Object.entries(query)) {
        queryRouter += "&" + key + "=" + value
    }
    logger.debug("Post " + queryRouter)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send({ status: true })

    runAxios = axios.create()
    runAxios.defaults.timeout = 1000 * 60 * 30
    const response = await runAxios.post(queryRouter);
    taskList[queryID] = response.data
    logger.debug(response.data)

    logger.info(queryID + " finished, add to TaskList")
})

app.get('/taskStatus', async (req, res) => {
    logger.info("Call /taskStatus");
    queryID = req.query.queryID
    logger.debug("taskList: " + Object.keys(taskList))

    res.setHeader("Access-Control-Allow-Origin", "*");

    if (queryID in taskList) {
        res.send({
            status: true,
            data: taskList[queryID]
        })
        delete taskList[queryID]
        logger.info(queryID + " removed from TaskList")
    }
    else {
        res.send({
            status: false,
            data: null
        })
    }
})

app.get('/getTaskData', async (req, res) => {
    logger.info("Call /getTaskData");
    const response = await axios.get("http://localhost:19527/patent/publications/query",
        {
            params: { taskID: req.query.taskID }
        });
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(response.data)
    logger.debug(response.data.data[0])
    const csvParser = new Parser()
    const csv = csvParser.parse(response.data.data)
    const csvFile = `./task_data/${req.query.taskID}.csv`
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
})

app.get('/downloadTaskData', async (req, res) => {
    logger.info("Call /downloadTaskData");
    res.setHeader("Access-Control-Allow-Origin", "*");
    let dlFile = `./task_data/${req.query.taskID}.csv`
    logger.info("Request " + dlFile)
    res.download(dlFile, function (error) {
        if (error) {
            logger.error(error)
        }
    })
})

app.get('/patentSearch', async (req, res) => {
    logger.info("Call /patentSearch");
    logger.debug(`Request query ${req.query.patentID}`)
    var SpringServer = "http://localhost:19527/patent/publications/"
    const response = await axios.get(SpringServer + req.query.patentID);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(response.data.data)
})

app.listen(port, () => { logger.info(`node backend listening on port ${port}`) })
setTimeout(refreshHDFSFileList, 0)