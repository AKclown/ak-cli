// const ejs = require('ejs');
// const path = require('path');
// const html = '<div><%= user.name %></div>';
// const options = {};
// const data = {
//   user: {
//     name: 'ak',
//   },
// };

// const data2 = {
//   user: {
//     name: 'corner',
//   },
// };

// $ 第一种写法 返回function，用于解析html中的ejs模板
// const template = ejs.compile(html, options);
// const compileTemplate = template(data);
// const compileTemplate2 = template(data2);

// $ 第二种写法
// const renderTemplate = ejs.render(html, data, options);
// console.log('renderTemplate: ', renderTemplate);

// $ 第三种写法
// promise
// const renderedFile = ejs.renderFile(path.resolve(__dirname, 'template.html'), data, options)
// console.log(renderedFile);

// ejs.renderFile(path.resolve(__dirname, 'template.html'), data, options, (err, file) => {
//     console.log(file);
// })
