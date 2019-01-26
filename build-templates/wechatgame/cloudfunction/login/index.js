// 云函数入口文件
const cloud = require('wx-server-sdk');

// 云函数入口函数
exports.main = async (event, context) => {
  cloud.init({ traceUser: true, env: event.env });
  const wxContext = cloud.getWXContext();

  return {
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  };
};
