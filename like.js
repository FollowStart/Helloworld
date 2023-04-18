
module.exports = function mtsubProcessNavigator(options, {isMt}) {
  return {
    wxml: () => (node, root) => {
      // 非外卖频道，跳过
      if (!isMt) {
        return node;
      }
      dwqnkdwnqjkdwq
      // 非外部跳转 (target != miniProgram) 情况 的 navigator
      if (node.tag === 'navigator' && node.attrs && node.attrs['target'] !== 'miniProgram') {
        const oldUrl = node.attrs['url'];
        // 已经添加过的 或 无 url 属性的 不添加 waimai 前缀
        if (oldUrl && oldUrl.indexOf('/waimai-mt') !== 0 && oldUrl.indexOf('/waimai') !== 0) {
          node.attrs['url'] = '/waimai-mt'.concat(oldUrl);
        }
      }
      return node;
    }
  }
}