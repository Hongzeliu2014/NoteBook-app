// 导入
const express = require("express");
const router = express.Router();
const moment = require("moment");
const AccountModel = require("../../models/AccountModel");
const checkLoginMiddleware = require("../../middlewares/checkLoginMiddleware");

// 添加首页路由规则
router.get("/", (req, res, next) => {
  // 重新定向到账本列表页（account）
  res.redirect("/account");
});

// 记账本的列表
router.get("/account", checkLoginMiddleware, async function (req, res, next) {
  try {
    // 使用异步方式查询所有账单信息，并按时间降序排序
    const accounts = await AccountModel.find().sort({ time: -1 }).exec();

    // 响应成功，渲染模板
    res.render("list", { accounts, moment });
  } catch (err) {
    // 捕获错误并返回 500 错误信息
    console.error("Error fetching accounts:", err.message);
    res.status(500).send("读取失败~~~");
  }
});

// 添加
router.get("/account/create", checkLoginMiddleware, function (req, res, next) {
  res.render("create");
});

// 新增记录（使用了异步操作重构代码，最新版本不再支持回调函数）
router.post("/account", checkLoginMiddleware, async function (req, res) {
  console.log(req.body);

  try {
    // 使用 moment 将日期转换为 JavaScript Date 对象
    const newAccount = await AccountModel.create({
      ...req.body,
      time: moment(req.body.time).toDate(),
    });

    // 插入成功后，返回成功页面
    res.render("success", { msg: "新增成功！", url: "/account" });
  } catch (err) {
    console.error("新增记录失败:", err);

    // 插入失败，返回错误信息
    res.status(500).send("插入失败");
  }
});

// 删除（使用了异步操作重构代码，最新版本不再支持回调函数）
router.get("/account/:id", checkLoginMiddleware, async (req, res) => {
  try {
    // 通过 params 获取 id
    const id = req.params.id;

    // 使用异步方式删除数据
    const result = await AccountModel.deleteOne({ id });

    // 检查删除操作是否影响了任何记录
    if (result.deletedCount === 0) {
      res.status(404).send("未找到需要删除的记录");
      return;
    }

    // 成功提醒
    res.render("success", { msg: "删除成功！", url: "/account" });
  } catch (err) {
    console.error("Error deleting account:", err.message);
    res.status(500).send("删除失败");
  }
});

module.exports = router;
