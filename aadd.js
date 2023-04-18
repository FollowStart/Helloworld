const config = require('../mt-template-static-config.json')
const fs = require('fs').promises;
const fetch = require('node-fetch')
const path = require("path");
const TASKNAME = 'transform-mach-template';
const getSubpackageNames = (config) => Object.keys(config);
const subpackageNames = getSubpackageNames(config);
const getDDConfig = async () => {
  // TODO 支持mach env 开发期间，先用test环境
  const response = await fetch('xxxx', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "app": "group",
      "mach_version": "1.0.81",
      "uuid": 123,
      "app_version": "900100006",
      "platform": "Weixin",
      "channel": ""
    })
  })
  return response.json();
}
const getTemplateDDVersion = (template_id, ddConfig) => {
  return ddConfig.find(item => item.mach_id === template_id).bundleVersion
}
const transformMachSubPackages = async (subPackageName, ddConfig) => {
  const templates = config[subPackageName];
  for (const {template_id, template_source} of templates) {
    try {
      const templateFile = await fs.readFile(path.resolve(__dirname, `../src/packages/mt-${subPackageName}/${template_id}.js`), {encoding: 'utf-8'});
      const templateDDVersion = getTemplateDDVersion(template_id, ddConfig);
      if (templateFile.indexOf(templateDDVersion) === -1) {
        console.error('[mach]', template_id, '模版版本与dd不匹配，如需上线请及时确认，当前dd版本为：', templateDDVersion);
      }
      await fs.writeFile(path.resolve(__dirname, `../dist/packages/${subPackageName}/${template_id}.js`), templateFile);
    } catch (e) {
      console.log(e)
    }
  }
  const indexJs = templates.reduce((pre, cur) => {
      return pre.concat(`  '${cur.template_id}': require('./${cur.template_id}'),\n`)
    },
    '// AUTO GENERATED MACH TEMPLATES PACKAGE INDEX_JS\n// DO NOT MODIFY\n"use strict"\nconst TemplateMsg = {\n')
    .concat('};\n\nmodule.exports = TemplateMsg;')
  await fs.writeFile(path.resolve(__dirname, `../dist/packages/${subPackageName}/index.js`), indexJs);
}
const transformMach = async () => {
  const ddConfig = (await getDDConfig()).body.bundles;
  for (const subpackageName of subpackageNames) {
    await (transformMachSubPackages(subpackageName, ddConfig))
  }
}

dwqklldwqmlkdqwmkl

/**
 * 操作变更mach模版
 * 外卖mach模版->团子包mach模版
 * 运行时机：build:mt/build:mt-dev 之后， mt-transform 之前
 * 会将根据本地文件与 mt-template-static-config.json
 */
module.exports = (gulp) => {
  gulp.task(TASKNAME, (cb) => {
    console.log('[mach] 开始拷贝团子包mach模版')
    transformMach()
      .then(() => console.log('mach 处理完毕'))
      .catch(e => 'mach 处理出错')
  });
};