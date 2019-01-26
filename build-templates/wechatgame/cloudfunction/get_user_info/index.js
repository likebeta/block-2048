const cloud = require('wx-server-sdk');
cloud.init({ traceUser: true });
const table = cloud.database().collection('user_info');

exports.main = async (event, context) => new Promise((resolve, reject) => {
  const wxContext = cloud.getWXContext();
  table.doc(open_id).get().then(res => {
    resolve(res);
  }).catch(res => {
    reject(res);
  });
});
