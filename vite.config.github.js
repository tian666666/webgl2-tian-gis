/*
 * @Description:
 * @Author: tianyw
 * @Date: 2023-01-25 15:30:26
 * @LastEditTime: 2023-01-26 17:46:39
 * @LastEditors: tianyw
 */
const { defineConfig } = require("vite");
const { resolve } = require("path");
const fs = require("fs");

const input = {
  main: resolve(__dirname, "index.html")
};
const samples = fs.readdirSync(resolve(__dirname, "samples"));
for (let file of samples) {
  const files = fs.readdirSync(resolve(__dirname, "samples/" + file));

  for (const childFile of files) {
    if (childFile.endsWith(".html")) {
      const filePath = resolve(__dirname, "samples/" + file + "/" + childFile);
      input[file] = filePath;
    }
  }
}
// 编译输出目录 输出文件夹 默认为 dist 如果想要生成为其他名称，需要在此处修改，直接修改打包后的文件夹名称会影响 html 中引用的地址导致项目无法正常运行
const outFolderName = "dist";
module.exports = defineConfig({
  base: `/${outFolderName}/`,
  build: {
    outDir: `./${outFolderName}`,
    rollupOptions: {
      input
    }
  }
});
