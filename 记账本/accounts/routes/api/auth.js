// 导入
var express = require("express");
var router = express.Router();
const UserModel = require("../../models/UserModel");
const jwt = require("jsonwebtoken");
const md5 = require("md5");
const { token } = require("morgan");

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
      return res.json({
        code: 2002,
        msg: "账号/密码错误",
        data: null,
      });
    }

    // 登陆成功
    // 创建(生成token)
    const token = jwt.sign(
      {
        username: data.username,
        _id: data._id,
      },
      "atguigu",
      {
        expiresIn: 60 * 60 * 24 * 7, // 7天过期
      }
    );

    // 响应token
    res.json({
      code: "0000",
      msg: "登陆成功",
      data: token,
    });

    // 渲染页面
    res.render("success", { msg: "登陆成功", url: "/account" });
  } catch (err) {
    // 捕获数据库或其他错误
    console.error("Login Error:", err); // 打印错误日志
    res.json({
      code: 2001,
      msg: "数据库获取失败，请稍后重试",
      data: null,
    });
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
