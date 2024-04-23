const express = require('express')
const fs = require('fs')
const axios = require('axios')
var FormData = require('form-data');
const { Parser } = require('@json2csv/plainjs')

const func = require('./func')
const logger = require('./log')
const global = require('./global')
// const hive = require('./hiveUtils')
const llm = require('./llmUtils')
const app = express();

const multer = require('multer');
const { table } = require('console');

const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)

const mult_storage = multer.diskStorage({
  destination: (req, file, cb)=>{
    cb(null, 'uploads/')
  },
  //filename: (req, file, cb)=>{
  //  cb(null, file.originalname)
  //}
})


const allowedFileExtensions = ['docx', 'pdf', 'xlsx'];

const upload = multer({storage: mult_storage,
                       limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
                       fileFilter: (req, file, cb) => {
                         const extension = file.originalname.split('.').pop();
                         console.log(extension);
                         if (allowedFileExtensions.includes(extension)) {
                             cb(null, true);
                         } else {
                             cb(null, false);
                             const err = new Error('Only .docx, .pdf and .xlsx format allowed!')
                             err.name = 'ExtensionError'
                             return cb(err);
                         }
                       }
                     })

//const upload = multer({ dest: 'uploads/' })



var taskList = {};
var llmResponseList = {};

app.get('/getHDFSTableList', async (req, res) => {
    logger.info("Call /getHDFSTablesList");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send({
        tableList: func.getHDFSFileList()[req.query.tableType]
    })
})

app.get('/getTemplate', async (req, res) => {
    logger.info("Call /getTemplate");
    const template = await func.loadTemplateFromDisk(req.query.filename)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(template)
})

app.get('/submitTask', async (req, res) => {
    logger.info("Call /submitTask");
    templateContext = func.getTemplateContext()
    fullTask = templateContext.begin + func.addSpaces(req.query.executeCode) + templateContext.end
    logger.debug(fullTask)

    query = {
        className: "ExecObj",
        packageName: "org.rioslab.spark.core.exec"
    }
    queryRouter = global.submitTaskRouter

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
})

app.get('/runTask', async (req, res) => {
    logger.info("Call /runTask");
    queryID = req.query.queryID
    codeID = req.query.codeID
    logger.debug(`queryID: ${queryID}`)
    logger.debug(`codeID: ${codeID}`)

    queryRouter = global.runTaskRouter
    queryRouter += "codeID" + "=" + codeID
    logger.debug("Post " + queryRouter)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send({ status: true })

    const response = await axios.post(queryRouter);
    taskList[queryID] = response.data
    logger.debug(response.data)

    logger.info(queryID + " finished, add to TaskList")
})

app.get('/taskStatus', async (req, res) => {
    logger.info("Call /taskStatus");
    queryID = req.query.queryID
    logger.debug("taskList: " + Object.keys(taskList))

    res.setHeader("Access-Control-Allow-Origin", "*");
    checkData = func.pollCheck(queryID, taskList, "taskList")
    res.send(checkData)
})

app.get('/getTaskData', async (req, res) => {
    logger.info("Call /getTaskData");
    const response = await axios.get(global.getTaskDataRouter,
        {
            params: { taskID: req.query.taskID }
        });
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(response.data)
    logger.debug(response.data.data[0])
    const csvParser = new Parser()
    const csv = csvParser.parse(response.data.data)
    const csvFile = `./temp/TaskData/${req.query.taskID}.csv`
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
    let dlFile = `./temp/TaskData/${req.query.taskID}.csv`
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
    var queryRouter = global.patentSearchRouter
    const response = await axios.get(queryRouter + req.query.patentID);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(response.data.data)
})

// LLM sth.
app.get('/postLLMChat', async (req, res) => {
    logger.info("Call /postLLMChat");
    queryID = req.query.queryID
    llmParams = llm.genLLMBackendParams(req.query)
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (llmParams.status) {
        res.send({ status: true })
        logger.debug(JSON.stringify(llmParams))
        if (llmParams.method == "post") {
            var response = await axios.post(llmParams.server, llmParams.payload);
        }
        else {
            var response = await axios.get(llmParams.server, llmParams.payload);
        }
        llmResponseList[queryID] = response.data
    }
    else {
        res.send(llmParams)
    }
})

app.get('/getLLMChatStatus', async (req, res) => {
    logger.info("Call /getLLMChatStatus");
    logger.debug("llmResponseList: " + Object.keys(llmResponseList))
    queryID = req.query.queryID
    checkData = func.pollCheck(queryID, llmResponseList, "llmResponseList")
    if (checkData.status) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.send({
            status: checkData.status,
            data: llm.parseLLMResponse(req.query, checkData)
        })
    }
    else {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.send(checkData)
    }
})

app.get('/execSQL', async (req, res) => {
    logger.info("Call /execSQL");

    let data = JSON.stringify({
        "sql_query": req.query.content,
        "description": ""
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: global.SQLExecRouter,
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    axios.request(config)
        .then((response) => {
            logger.info(response.data);
            uuid = func.GenNonDuplicateID(24)
            parsedTable = func.writeCsvToDisk(uuid, response.data.es_result)
            data = {
                status: true,
                es_result: parsedTable,
                num_record: response.data.num_record,
                raw_data: response.data.es_result,
                taskid: uuid
            }
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.send(data)
        })
        .catch((error) => {
            logger.error(error);
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.send({
                status: false,
                es_result: error
            })
        });
})

app.get('/recommend', async (req, res) => {
    logger.info("Call /recommend");
    res.setHeader("Access-Control-Allow-Origin", "*");
    patentID = req.query.patentID
    sequence = req.query.sequence
    combSize = "2"
    payload = {
        "patent_number": patentID,
        "after_or_before": sequence,
        "comb_size": combSize
    }
    response = await axios.post(global.recommendRouter, payload)
    res.send(response.data)
})


app.get('/login', async (req, res) => {
    logger.info("Call /login");
    res.setHeader("Access-Control-Allow-Origin", "*");
    cookie = req.query.cookie;
    const api = axios.create({
        withCredentials: true,
        headers: {
            Cookie: cookie,
        },
        xsrfCookieName: 'csrf_access_token',
        xsrfHeaderName: "x-csrftoken"
    });
    response = await api.post(global.loginRouter)
    res.send(response.data)
})

app.get('/logout', async (req, res) => {
    logger.info("Call /logout");
    res.setHeader("Access-Control-Allow-Origin", "*");
    cookie = req.query.cookie;
    const api = axios.create({
        withCredentials: true,
        headers: {
            Cookie: cookie,
        },
        xsrfCookieName: 'csrf_access_token',
        xsrfHeaderName: "x-csrftoken"
    });
    response = await api.post(global.logoutRouter)
    res.send(response.data)
})

app.get('/translate', async (req, res) => {
    logger.info("Call /translate");
    res.setHeader("Access-Control-Allow-Origin", "*");
    cookie = req.query.cookie;
    const api = axios.create({
        withCredentials: true,
        headers: {
            Cookie: cookie,
        },
        xsrfCookieName: 'csrf_access_token',
        xsrfHeaderName: "x-csrftoken"
    });
    text = req.query.text
    in_lang = req.query.in_lang
    out_lang = req.query.out_lang
    payload = {
        "text": text,
        "in_lang": in_lang,
        "out_lang": out_lang
    }
    response = await api.get(global.translatorRouter, { params: payload })
    res.send(response.data)
})

app.get('/retrain', async (req, res) => {
    logger.info("Call /retrain");
    res.setHeader("Access-Control-Allow-Origin", "*");
    cookie = req.query.cookie;
    const api = axios.create({
        withCredentials: true,
        headers: {
            Cookie: cookie,
        },
        xsrfCookieName: 'csrf_access_token',
        xsrfHeaderName: "x-csrftoken"
    });
    src_text = req.query.src_text
    tgt_text = req.query.tgt_text
    in_lang = req.query.in_lang
    out_lang = req.query.out_lang
    payload = {
        "in_lang": in_lang,
        "out_lang": out_lang,
        "src_text": src_text,
        "tgt_text": tgt_text
    }
    response = await api.post(global.retrainRouter, payload)
    res.send(response.data)
})

app.get('/save', async (req, res) => {
    logger.info("Call /save");
    res.setHeader("Access-Control-Allow-Origin", "*");
    cookie = req.query.cookie;
    const api = axios.create({
        withCredentials: true,
        headers: {
            Cookie: cookie,
        },
        xsrfCookieName: 'csrf_access_token',
        xsrfHeaderName: "x-csrftoken"
    });
    model = req.query.path
    payload = {
        "model_path": model,
    }
    response = await api.post(global.saveRouter, payload)
    res.send(response.data)
})

app.get('/load', async (req, res) => {
    logger.info("Call /load");
    res.setHeader("Access-Control-Allow-Origin", "*");
    cookie = req.query.cookie;
    const api = axios.create({
        withCredentials: true,
        headers: {
            Cookie: cookie,
        },
        xsrfCookieName: 'csrf_access_token',
        xsrfHeaderName: "x-csrftoken"
    });
    model = req.query.path
    payload = {
        "model_path": model,
    }
    response = await api.post(global.loadRouter, payload, { withCredentials: true })
    res.send(response.data)
})

app.post('/docxtranslate', async (req, res, next) => { req.setTimeout(0); next(); }, upload.single('file'), async (req, res) => {
    logger.info("Call /docxtranslate");
    res.setHeader("Access-Control-Allow-Origin", "*");
    cookie = req.query.cookie;
    const api = axios.create({
        withCredentials: true,
        headers: {
            Cookie: cookie,
            'Content-Type': "multipart/form-data; charset=utf-8; boundary=" + Math.random().toString().substr(2),
        },
        timeout: 0,
        xsrfCookieName: 'csrf_access_token',
        xsrfHeaderName: "x-csrftoken"
    });

    var formData = new FormData();
    file = fs.createReadStream(req.file.path);
    formData.append('files', file);
    in_lang = req.query.in_lang;
    out_lang = req.query.out_lang;
    formData.append('in_lang', in_lang);
    formData.append('out_lang', out_lang);
    await unlinkAsync(req.file.path);
    response = await api.post(global.docxTranslateRouter, formData);
    res.send(response.data)
})

app.get('/collect', async (req, res) => {
    logger.info("Call /collect");
    res.setHeader("Access-Control-Allow-Origin", "*");
    json = req.query.json;
    payload = {
        "name" : Math.random().toString().slice(2,12),
        "json": json
    }
    response = await axios.post(global.collectRouter, payload)
    res.send(response.data);
})

app.get('/ask', async (req, res) => {
    logger.info("Call /ask");
    res.setHeader("Access-Control-Allow-Origin", "*");
    const api = axios.create({
        withCredentials: true,
        xsrfCookieName: 'csrf_access_token',
        xsrfHeaderName: "x-csrftoken"
    });
    text = req.query.text
    payload = {
        "text": text,
    }
    response = await api.get(global.askRouter, { params: payload })
    res.send(response.data)
})

app.post('/upload', async (req, res, next) => { req.setTimeout(0); next(); }, upload.array('file'), async (req, res) => {
    logger.info("Call /upload");
    res.setHeader("Access-Control-Allow-Origin", "*");
    const api = axios.create({
        withCredentials: true,
        headers: {
            'Content-Type': "multipart/form-data; charset=utf-8; boundary=" + Math.random().toString().substr(2),
        },
        timeout: 0,
        xsrfCookieName: 'csrf_access_token',
        xsrfHeaderName: "x-csrftoken"
    });


    for (let i = 0; i < req.files.length; i++) {
      var formData = new FormData();
      f = fs.createReadStream(req.files[i].path);
      formData.append('files', f);
      fname = req.query.fname;
      formData.append('fname', fname[i]);
      await unlinkAsync(req.files[i].path);
      await api.post(global.uploadRouter, formData);
    }
    res.status(200).end("Files uploaded.")
})

module.exports = app
