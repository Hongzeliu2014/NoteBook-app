const express = require("express");
const router = express.Router();

// 导入moment
const moment = require("moment");
// 导入AccountModel 模型
const AccountModel = require("../../models/AccountModel");
// 导入jwt
const jwt = require("jsonwebtoken");
// 导入api检测中间件
const checkApiMiddleware = require("../../middlewares/checkTokenMiddleware");
const checkTokenMiddleware = require("../../middlewares/checkTokenMiddleware");

// 记账本的列表（使用了异步操作重构代码，最新版本不再支持回调函数）
router.get("/account", checkTokenMiddleware, async function (req, res, next) {
  try {
    // 使用异步方式查询所有账单信息，并按时间降序排序
    const accounts = await AccountModel.find().sort({ time: -1 }).exec();

    // 响应成功，渲染模板
    res.json({
      code: "0000", // 状态码,一般零表示成功
      msg: "读取成功", // 状态信息
      data: accounts, // 账单列表数据
    });
  } catch (err) {
    // 捕获错误并返回 500 错误信息
    console.error("Error fetching accounts:", err.message);
    res.json({
      code: "1001",
      msg: "读取失败",
      data: null,
    });
  }
});

// 新增记录（使用了异步操作重构代码，最新版本不再支持回调函数）
router.post("/account", checkTokenMiddleware, async function (req, res) {
  console.log(req.body);

  try {
    // 使用 moment 将日期转换为 JavaScript Date 对象
    const newAccount = await AccountModel.create({
      ...req.body,
      time: moment(req.body.time).toDate(),
    });

    // 插入成功后，返回成功页面
    res.json({
      code: "0000",
      msg: "新增成功",
      data: null,
    });
  } catch (err) {
    // 插入失败，返回错误信息
    res.json({
      code: "1002",
      msg: "新增失败",
      data: null,
    });
  }
});

// 删除（使用了异步操作重构代码，最新版本不再支持回调函数）
router.delete("/account/:id", checkTokenMiddleware, async (req, res) => {
  try {
    // 通过 params 获取 id
    const id = req.params.id;

    // 使用异步方式删除数据
    const result = await AccountModel.deleteOne({ _id: id });

    // 检查删除操作是否影响了任何记录
    if (result.deletedCount === 0) {
      res.status(404).send("未找到需要删除的记录");
      return;
    }

    // 成功提醒
    res.json({
      code: "0000",
      msg: "删除成功",
      data: null,
    });
  } catch (err) {
    console.error("Error deleting account:", err.message);
    res.json({
      code: "1003",
      msg: "删除失败",
      data: null,
    });
  }
});

// 读取单个账单
router.get("/account/:id", checkTokenMiddleware, async (req, res) => {
  try {
    // 通过 params 获取 id
    const { id } = req.params;

    // 使用异步方式查询数据库
    const data = await AccountModel.findById(id);

    // 检查是否有数据
    if (!data) {
      return res.status(404).json({
        code: "1004",
        msg: "未找到该账单信息",
        data: null,
      });
    }

    // 成功响应
    res.json({
      code: "0000",
      msg: "读取成功",
      data: data,
    });
  } catch (err) {
    console.error("Error fetching account data:", err);
    res.status(500).json({
      code: "1004",
      msg: "读取失败，服务器错误",
      data: null,
    });
  }
});

// 更新账单信息
router.patch("/account/:id", checkTokenMiddleware, async (req, res) => {
  try {
    // 获取 id 参数值
    const { id } = req.params;

    // 更新数据库
    const updateResult = await AccountModel.updateOne({ _id: id }, req.body);

    // 检查是否有匹配的记录被更新
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({
        code: "1005",
        msg: "更新失败，记录不存在~~",
        data: null,
      });
    }

    // 再次查询数据库，获取更新后的单条数据
    const updatedData = await AccountModel.findById(id);

    // 检查查询结果
    if (!updatedData) {
      return res.status(404).json({
        code: "1004",
        msg: "读取失败，未找到记录~~",
        data: null,
      });
    }

    // 成功响应
    res.json({
      code: "0000",
      msg: "更新成功",
      data: updatedData,
    });
  } catch (err) {
    // 错误处理
    console.error("Error updating or fetching account:", err);
    res.status(500).json({
      code: "1005",
      msg: "更新失败，服务器错误~~",
      data: null,
    });
  }
});

module.exports = router;
