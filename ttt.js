const path = require('path');
const fs = require('fs');
const download = require('download');
const TASKNAME = 'mt-mach-template-update';
const config = require('../mt-template-static-config');
const getSubpackNames = (config) => Object.keys(config);
const subpackNames = getSubpackNames(config);
const getAllConfigfilesName = (config) => {
    let rArr = [];
    Object.keys(config).map(item => {
        rArr = rArr.concat(config[item].map(item => `src/packages/mt-${item}/${item.template_id}.js`));
    })
    return rArr;
}
const getAllFiles = (config) => {
    let allFiles = []
    subpackNames.map(item => {
        if(fs.existsSync(path.resolve(__dirname, `../src/packages/mt-${item}`))) {
            allFiles = allFiles.concat(readFileList(`src/packages/mt-${item}`));
        }
    })
    return allFiles;
}
const getAllDirs = () => {
    return fs.readdirSync(path.resolve(__dirname, '../src/packages')).filter(item => item.startsWith('mt-mach-') && item.endsWith('template'))
}
const readFileList = (dir) => {
    const filesList = [];
    const files = fs.readdirSync(dir);
    files.forEach((item, index) => {
        var fullPath = path.join(dir, item);
        if(fullPath.indexOf('pages') === -1 && fullPath.indexOf('index') === -1) {
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                readFileList(path.join(dir, item), filesList);  //递归读取文件
            } else {
                filesList.push(fullPath);
            }
        }
    });
    return filesList;
}
const build = async(gulp, dirPath, subPathName) => {
    const configArr = config[subPathName];
    return await Promise.all(configArr.map(item =>
        download(`${item.template_source}`, `${dirPath}`, {
            filename: `${item.template_id}.js`
        })
    ))
};
const allFiles = getAllFiles(config);
const allConfigFiles = getAllConfigfilesName(config);
const allDirs = getAllDirs();
const removeFiles = (allFiles, allConfigFiles) => {
    allFiles.map(item => {
        if(!allConfigFiles.includes(item)) {
            fs.unlinkSync(path.resolve(__dirname, `../${item}`));
        }
    })
}
const removeDir = () => {
    allDirs.map(item => {
        if(!subpackNames.includes(item)) {
            //配置里没有的就删除掉
            fs.rmdirSync(path.resolve(__dirname, `../src/packages/${item}`))
        }
    })
}
module.exports = (gulp) => {
    gulp.task(TASKNAME, (cb) => {
        removeFiles(allFiles, allConfigFiles);
        // removeDir();
        Promise.all(
            subpackNames.map(item => build(gulp, `src/packages/mt-${item}`, item))
        ).then(() => {
           cb();
        })
    });
};