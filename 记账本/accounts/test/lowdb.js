//导入 lowdb
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
// 数据将会被存放在db.json文件中
const adapter = new FileSync("db.json");

//获取 db 对象
const db = low(adapter);

//初始化数据
db.defaults({ posts: [], user: {} }).write();

//写入数据
//push 向数组尾部添加数据
//unshift 向数组头部添加数据
db.get("posts").push({ id: 2, title: "今天天气还不错~~" }).write();
db.get("posts").unshift({ id: 3, title: "今天天气还不错~~" }).write();

//获取单条数据:get().find().value()
let getdata = db.get("posts").find({ id: 2 }).value();
console.log(getdata);

//获取数据:get().value()
console.log(db.get("posts").value());

//删除数据
let del = db.get("posts").remove({ id: 2 }).write();
console.log(del);

//更新数据
db.get("posts").find({ id: 1 }).assign({ title: "今天下雨啦!!!" }).write();
