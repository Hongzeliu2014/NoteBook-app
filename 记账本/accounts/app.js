var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
// 导入express - session模块 , 导入mongo存储模块
const session = require("express-session");
const MongoStore = require("connect-mongo");
// 导入配置项
const { DBHOST, DBPORT, DBNAME } = require("./config/config");

// 导入路由文件
var indexRouter = require("./routes/web/index");
const authRouter = require("./routes/web/auth");
const accountRouter = require("./routes/api/account");
const authApirouter = require("./routes/api/auth");

// 创建express实例
var app = express();

// 测试mongodb连接
const mongoose = require("mongoose");
mongoose
  .connect(`mongodb://${DBHOST}:${DBPORT}/${DBNAME}`)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

//设置 session 的中间件
app.use(
  session({
    name: "sid", //设置cookie的name，默认值是：connect.sid
    secret: "atguigu", //参与加密的字符串（又称签名）  加盐
    saveUninitialized: false, //是否为每次请求都设置一个cookie用来存储session的id
    resave: true, //是否在每次请求时重新保存session  20 分钟    4:00  4:20
    store: MongoStore.create({
      mongoUrl: `mongodb://${DBHOST}:${DBPORT}/${DBNAME}`, //数据库的连接配置
      collectionName: "my_custom_sessions", // 自定义集合名称
    }),
    cookie: {
      httpOnly: true, // 开启后前端无法通过 JS 操作
      maxAge: 1000 * 60 * 60 * 24 * 7, // 这一条 是控制 sessionID 的过期时间的！！！
    },
  })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// 设置路由中间件
app.use("/", indexRouter);
app.use("/", authRouter);
app.use("/api", accountRouter);
app.use("/api", authApirouter);

// catch 404 and forward to error handler
// 在这个代码块中设置404页面处理
app.use(function (req, res, next) {
  // 响应404
  res.render("404");
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
