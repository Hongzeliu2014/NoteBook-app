// 声明中间件检测登陆,检测是否登录
let checkLoginMiddleware = function (req, res, next) {
  if (!req.session.username) {
    return res.redirect("/login");
  }
  next();
};
// 导出中间件
module.exports = checkLoginMiddleware;
