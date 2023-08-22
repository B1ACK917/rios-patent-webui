val df = spark
    .read // 表示读文件
    .option("header", "true") // 设置参数header=true，表示有表头
    .option("multiline", "true") // 设置参数multiline=true，表示一个单元格可能有多行
    // 使用"来转义"
    .option("escape", "\"") // 设置escape="\""，表示使用双引号转义双引号。意思在csv文件里""表示"
    .csv("/patent/uspto/csv/g_applicant_not_disambiguated.csv") // 读取表

df.show() // 向控制台打印Dataframe

val sortedstring = df.limit(100).toJSON.collectAsList().toString()
sortedstring