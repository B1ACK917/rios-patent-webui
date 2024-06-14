const port = 23457;
const loggerMaxOutput = 65536;
const stringMaxLen = 0x1000000; // ~16MB
const queryLimit = 1024;
const submitTaskRouter = "http://localhost:19527/patent/publications/submit?"
const runTaskRouter = "http://localhost:19527/patent/publications/run?"
const getTaskDataRouter = "http://localhost:19527/patent/publications/query"
const patentSearchRouter = "http://localhost:19527/patent/publications/"
const llmChatPostRouterllama65 = "http://macs.nekololi.cn:8065/v1/chat/completions"
const llmChatPostRouterllama2_70 = "http://macs.nekololi.cn:8070/v1/chat/completions"
const llmChatPostRouterllama13Tuned = "http://10.8.102.47:8001/nl_items/"
const SQLExecRouter = "http://localhost:8001/sql_es/"
const recommendRouter = "http://10.8.102.47:8002/recommend_items/"
const translatorRouter =    "http://10.8.103.89:5000/translator/translate"
const retrainRouter =       "http://10.8.103.89:5000/translator/retrain"
const saveRouter =          "http://10.8.103.89:5000/translator/save"
const loadRouter =          "http://10.8.103.89:5000/translator/load"
const loginRouter =         "http://10.8.103.89:5000/translator/login"
const logoutRouter =        "http://10.8.103.89:5000/translator/logout"
const docxTranslateRouter = "http://10.8.103.89:5000/translator/docxtranslate"
const collectRouter =       "http://10.8.103.89:5000/translator/collect"
const askVectorRouter =     "http://localhost:8080/milvus/ask"
const uploadVectorRouter =  "http://localhost:8080/milvus/upload"
const uploadRouter =        "http://localhost:8082/filemanager/insert"
const fileRouter =          "http://localhost:8082/filemanager/query"
const singlefileRouter =    "http://localhost:8082/filemanager/singlefile"

module.exports = {
    port,
    loggerMaxOutput,
    stringMaxLen,
    queryLimit,
    submitTaskRouter,
    runTaskRouter,
    getTaskDataRouter,
    patentSearchRouter,
    llmChatPostRouterllama65,
    llmChatPostRouterllama2_70,
    llmChatPostRouterllama13Tuned,
    SQLExecRouter,
    recommendRouter,
    translatorRouter,
    retrainRouter,
    saveRouter,
    loadRouter,
    loginRouter,
    logoutRouter,
    docxTranslateRouter,
    collectRouter,
    askVectorRouter,
    uploadVectorRouter,
    uploadRouter,
    fileRouter,
    singlefileRouter
}
