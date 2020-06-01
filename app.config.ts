module.exports = {
  viewType: 'pc',
  componentId: "993",
  componentType: "koubei-b-pc-ts",
  // 本地开发调试配置
  webpack: {
    // devServer配置
    devServer: {
      host: 'local.koubei.test',
      port: 8000,
    },
    babel: {
      // 开启对antd/cook/qingtai组件按需加载， 默认false
      importHelper: false,
    },
    postcss: {
      less: {
        // 主题配置
        themes: {},
      },
    },
    output: {
      // 开启UMD构建
      umd: false,
      // UMD文件名前缀（需要自定义！！！）
      filename: 'index',
      // 模块打包成UMD后的, 导出的模块名称（需要自定义！！！）
      library: 'Index',
      // 自定义UMD构建配置
      config: (compileConfig) => {
        return compileConfig;
      },
    },
  },
};
