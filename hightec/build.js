const fs = require('fs');
const path = require('path');
const minify = require('html-minifier').minify;
const JavaScriptObfuscator = require('javascript-obfuscator');

// 读取 HTML 文件
const htmlFilePath = path.join(__dirname, 'index.html');
let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

// 提取 JavaScript 代码
const scriptRegex = /<script>([\s\S]*?)<\/script>/;
const scriptMatch = htmlContent.match(scriptRegex);
let scriptContent = '';

if (scriptMatch && scriptMatch[1]) {
  scriptContent = scriptMatch[1];
  
  // 混淆 JavaScript 代码
  const obfuscationResult = JavaScriptObfuscator.obfuscate(scriptContent, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.7,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    debugProtection: true,
    debugProtectionInterval: true,
    disableConsoleOutput: true,
    identifierNamesGenerator: 'hexadecimal',
    renameGlobals: false,
    rotateStringArray: true,
    selfDefending: true,
    stringArray: true,
    stringArrayEncoding: ['base64'],
    stringArrayThreshold: 0.75,
    unicodeEscapeSequence: false
  });
  
  // 替换原始 JavaScript 代码
  htmlContent = htmlContent.replace(scriptContent, obfuscationResult.getObfuscatedCode());
}

// 压缩 HTML
const minifiedHtml = minify(htmlContent, {
  collapseWhitespace: true,
  removeComments: true,
  removeOptionalTags: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeTagWhitespace: true,
  useShortDoctype: true,
  minifyCSS: true,
  minifyJS: false // 我们已经单独混淆了 JS
});

// 创建 dist 目录
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// 写入压缩后的 HTML
fs.writeFileSync(path.join(distDir, 'index.html'), minifiedHtml);

// 复制其他必要文件
const templatesCss = path.join(__dirname, 'templates.css');
if (fs.existsSync(templatesCss)) {
  fs.copyFileSync(templatesCss, path.join(distDir, 'templates.css'));
}

console.log('构建完成！压缩和混淆后的文件已保存到 dist 目录。');