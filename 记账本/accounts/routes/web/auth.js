// 导入
var express = require("express");
var router = express.Router();
const UserModel = require("../../models/UserModel");

const md5 = require("md5");

// 注册界面
router.get("/reg", (req, res) => {
  // 响应HTML
  res.render("auth/reg");
});

// 注册操作
router.post("/reg", async (req, res) => {
  try {
    // 表单验证
    if (!req.body.username || !req.body.password) {
      return res.status(400).send("用户名和密码不能为空");
    }

    // 对密码进行 MD5 加密
    const hashedPassword = md5(req.body.password);
    console.log("Hashed Password:", hashedPassword);

    // 准备用户数据，替换原始密码为加密后的密码
    const userData = {
      username: req.body.username,
      password: hashedPassword,
    };

    // 创建用户
    const data = await UserModel.create(userData);

    // 渲染成功页面
    res.render("success", { msg: "注册成功", url: "/login" });
  } catch (err) {
    // 错误处理
    res.status(500).send("注册失败");
  }
});

// 登陆页面
router.get("/login", (req, res) => {
  // 响应HTML
  res.render("auth/login");
});

/// 登陆操作
router.post("/login", async (req, res) => {
  try {
    // 获取用户名和密码
    const { username, password } = req.body;

    // 查询数据库，检查用户名和加密后的密码是否匹配
    const data = await UserModel.findOne({
      username: username,
      password: md5(password),
    });

    // 如果用户不存在，返回错误
    if (!data) {
      return res.status(401).send("用户名或密码错误");
    }

    // 登陆成功
    // 写入session
    req.session.username = data.username;
    req.session.userId = data._id;
    // 渲染页面
    res.render("success", { msg: "登陆成功", url: "/account" });
  } catch (err) {
    // 捕获数据库或其他错误
    console.error("Login Error:", err); // 打印错误日志
    res.status(500).send("数据库获取失败，请稍后重试");
  }
});

// 退出登陆
router.post("/logout", (req, res) => {
  // 清除session
  req.session.destroy(() => {
    res.render("success", { msg: "登出成功", url: "/login" });
  });
});

module.exports = router;
