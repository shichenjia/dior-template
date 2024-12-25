const path = require("path");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

let defaultCssPath="default";

switch(String(process.env.NODE_ENV)){
        default:
            break;
}
function isDev() {
    return process.env.npm_lifecycle_script.indexOf("serve") > 0;
}
module.exports = {
    //基本路径
    "publicPath": process.env.VUE_APP_BASE_PATH,
    //输出文件目录
    //"outputDir": process.env.Node_ENV === "production" ? "dist" : "dev_dist",
    "outputDir": "dist",
    // 是否在保存的时候使用 `eslint-loader` 进行检查。
    // 有效的值：`true` | `false` | `"error"`
    // 当设置为 `"error"` 时，检查出的错误会触发编译失败。
    "lintOnSave": true,
    //  放置静态资源的目录
    "assetsDir": "./src/assets",
    //  html 的输出路径
    // indexPath: "index.html",
    //文件名哈希
    "filenameHashing": true,
    //  是否使用带有浏览器内编译器的完整构建版本
    "runtimeCompiler": false,
    //  babel-loader 默认会跳过 node_modules 依赖。 /* string or regex */
    "transpileDependencies": [],
    //  是否为生产环境构建生成 source map？
    "productionSourceMap": false,
    //  设置生成的 HTML 中 <link rel="stylesheet"> 和 <script> 标签的 crossorigin 属性。
    "crossorigin": "",
    //  在生成的 HTML 中的 <link rel="stylesheet"> 和 <script> 标签上启用 Subresource Integrity (SRI)。
    "integrity": false,
    // 用于多页配置，默认是 undefined
    // pages: {
    //   index: {
    //     // 入口文件
    //     entry: "src/main.js" /*这个是根入口文件*/,
    //     // 模板文件
    //     template: "public/index.html",
    //     // 输出文件
    //     filename: "index.html",
    //     // 当使用页面 title 选项时，
    //     // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
    //     // 页面title
    //     title: "Index Page"
    //   },
    //   // 简写格式
    //   // 模板文件默认是 `public/subpage.html`
    //   // 如果不存在，就是 `public/index.html`.
    //   // 输出文件默认是 `subpage.html`.
    //   subpage: "src/main.js" /*注意这个是*/
    // },
    //  调整内部的 webpack 配置
    "configureWebpack": (config) => {
        config.output.filename = "src/js/[name].[hash].js";
        config.output.chunkFilename = "src/js/[name].[hash].js";
        config.resolve = {
            "extensions": [".js", ".json", ".vue"],
            "alias": {
                "@": path.resolve(__dirname, "./src"),
                "assets": path.resolve(__dirname, "./src/assets/" + process.env.Node_ENV),
                "public": path.resolve(__dirname, "./public"),
                "components": path.resolve(__dirname, "./src"),
                "views": path.resolve(__dirname, "./src")
            }
        };
        if (!isDev()) {
            config.optimization={
                "minimize": true,
                "minimizer": [
                    new TerserPlugin({
                        "test": /\.js(\?.*)?$/i,
                        "cache": true,
                        "parallel": true,
                        "extractComments": "all"
                    }),
                    new OptimizeCSSAssetsPlugin({
                        // 默认是全部的CSS都压缩，该字段可以指定某些要处理的文件
                        "assetNameRegExp": /\.(sa|sc|c)ss$/g,
                        // 指定一个优化css的处理器，默认cssnano
                        "cssProcessor": require("cssnano"),

                        "cssProcessorPluginOptions": {
                            "preset": ["default", {
                                "discardComments": {
                                    "removeAll": true
                                }, //对注释的处理
                                "normalizeUnicode": false // 建议false,否则在使用unicode-range的时候会产生乱码
                            }]
                        },
                        "canPrint": false // 是否打印编译过程中的日志
                    })
                ],
                "splitChunks": {
                    "chunks": "all",
                    "minSize": 20000, // 允许新拆出 chunk 的最小体积，也是异步 chunk 公共模块的强制拆分体积
                    "maxAsyncRequests": 6, // 每个异步加载模块最多能被拆分的数量
                    "maxInitialRequests": 6, // 每个入口和它的同步依赖最多能被拆分的数量
                    "enforceSizeThreshold": 50000, // 强制执行拆分的体积阈值并忽略其他限制
                    "cacheGroups": {
                        "assets": {
                            // assetsImgSvg 单独拆包
                            "name": "chunk-assets",
                            "test": /[\\/]src[\\/]assets/,
                            "priority": 20, // 权重
                            "chunks": "all" // 只打包按需引入的模块
                        },
                        "components": {
                            // components 单独拆包
                            "name": "chunk-components",
                            "test": /[\\/]src[\\/]components/,
                            "priority": 20, // 权重
                            "chunks": "all" // 只打包按需引入的模块
                        },
                        "vant": {
                            // vant 单独拆包
                            "name": "chunk-vant",
                            "test": /[\\/]node_modules[\\/]vant/,
                            "priority": 20, // 权重要大于 libs
                            "chunks": "all" // 只打包按需引入的模块
                        },
                        "element-ui": {
                            // element-ui 单独拆包
                            "name": "chunk-element-ui",
                            "test": /[\\/]node_modules[\\/]element-ui/,
                            "priority": 20, // 权重要大于 libs
                            "chunks": "all" // 只打包按需引入的模块
                        },
                        "vconsole": {
                            // vconsole 单独拆包
                            "name": "chunk-vconsole",
                            "test": /[\\/]node_modules[\\/]vconsole/,
                            "priority": 20, // 权重要大于 libs
                            "chunks": "all" // 只打包按需引入的模块
                        },
                        "lodash-es": {
                            // vconsole 单独拆包
                            "name": "chunk-lodash-es",
                            "test": /[\\/]node_modules[\\/]lodash-es/,
                            "priority": 20, // 权重要大于 libs
                            "chunks": "all" // 只打包按需引入的模块
                        },
                        "echarts": {
                            // vconsole 单独拆包
                            "name": "chunk-echarts",
                            "test": /[\\/]node_modules[\\/]echarts/,
                            "priority": 20, // 权重要大于 libs
                            "chunks": "all" // 只打包按需引入的模块
                        },
                        "videojs": {
                            // vconsole 单独拆包
                            "name": "chunk-videojs",
                            "test": /[\\/]node_modules[\\/]video.js/,
                            "priority": 20, // 权重要大于 libs
                            "chunks": "all" // 只打包按需引入的模块
                        },
                        "vxe-table": {
                            // vconsole 单独拆包
                            "name": "chunk-vxe-table",
                            "test": /[\\/]node_modules[\\/]vxe-table/,
                            "priority": 20, // 权重要大于 libs
                            "chunks": "all" // 只打包按需引入的模块
                        },
                        "zrender": {
                            // vconsole 单独拆包
                            "name": "chunk-zrender",
                            "test": /[\\/]node_modules[\\/]zrender[\\/]lib/,
                            "priority": 20, // 权重要大于 libs
                            "chunks": "all" // 只打包按需引入的模块
                        },
                        "swiper": {
                            // vconsole 单独拆包
                            "name": "chunk-swiper",
                            "test": /[\\/]node_modules[\\/]swiper/,
                            "priority": 20, // 权重要大于 libs
                            "chunks": "all" // 只打包按需引入的模块
                        },
                        "vform": {
                            // vconsole 单独拆包
                            "name": "chunk-vform",
                            "test": /[\\/]node_modules[\\/]vform-builds[\\/]dist/,
                            "priority": 20, // 权重要大于 libs
                            "chunks": "all" // 只打包按需引入的模块
                        },
                        "vue": {
                            // vconsole 单独拆包
                            "name": "chunk-vue",
                            "test": /[\\/]node_modules[\\/]vue/,
                            "priority": 20, // 权重要大于 libs
                            "chunks": "all" // 只打包按需引入的模块
                        },
                        "jquery": {
                            // vconsole 单独拆包
                            "name": "chunk-jquery",
                            "test": /[\\/]node_modules[\\/]jquery/,
                            "priority": 20, // 权重要大于 libs
                            "chunks": "all" // 只打包按需引入的模块
                        },
                        "libs": {
                            // 第三方库
                            "name": "chunk-libs",
                            "test": /node_modules/,
                            "priority": 10
                            // chunks: "initial" // 只打包初始时依赖的第三方
                        },
                        "common": {
                            // 公共模块包
                            "name": "chunk-common",
                            "minChunks": 2,
                            "priority": 0,
                            "reuseExistingChunk": true
                        }
                    }
                }

            };
        }

    }, //(Object | Function)
    "chainWebpack": (config) => {
        config.resolve.symlinks(true);
        // set svg-sprite-loader
        config.plugin("html").tap((args) => {
            args[0].title = "";
            return args;
        });
        if (!isDev()) {
            config.plugin("CompressionPlugin").use("compression-webpack-plugin", [{
                "algorithm": "gzip",
                "test": /\.js$|\.otf$|.\css/, // 匹配文件名
                "threshold": 10240, // 对超过10k的数据压缩
                "deleteOriginalAssets": false, // 不删除源文件
                "minRatio": 0.8 // 压缩比
            }]);
        }
        config.plugin("HardSourceWebpackPlugin").use("hard-source-webpack-plugin");
        config.plugin("SpeedMeasurePlugin ").use("speed-measure-webpack-plugin");
        // ============压缩图片 start============
        // config.module
        //     .rule("images")
        //     .use("image-webpack-loader")
        //     .loader("image-webpack-loader")
        //     .options({
        //         "bypassOnDebug": true
        //     })
        //     .end();
    // ============压缩图片 end============
    },
    // 配置 webpack-dev-server 行为。
    "devServer": {
        "open": true,
        "host": "0.0.0.0",
        "port": 8001,
        "https": false,
        "hotOnly": false,
        // 查阅 https://github.com/vuejs/vue-docs-zh-cn/blob/master/vue-cli/cli-service.md#配置代理
        "proxy": {
            "/server_api": {
                "target": process.env.VUE_APP_URL,
                //"target":"https://ywzt.xh.sh.cn/",
                "changeOrigin": true,
                "secure": false,
                "pathRewrite": {
                    "^/server_api": ""
                }
            },
            "/map_url": {
                "target": "https://map.3h-weixin.com/",
                "changeOrigin": true,
                "secure": false,
                "pathRewrite": {
                    "^/map_url": ""
                }
            }
        }
    // string | Object
    //before: app => {}
    },
    // CSS 相关选项
    "css": {
    // 将组件内的 CSS 提取到一个单独的 CSS 文件 (只用在生产环境中)
    // 也可以是一个传递给 `extract-text-webpack-plugin` 的选项对象
        "extract": true,
        // 是否开启 CSS source map？
        "sourceMap": false,
        // 为预处理器的 loader 传递自定义选项。比如传递给
        // Css-loader 时，使用 `{ Css: { ... } }`。
        "loaderOptions": {
            "sass": {
                "prependData":
          "@import \"./src/styles/" + defaultCssPath + "/index.scss\";"
            },
            "postcss": {
                "plugins": [
                    require("postcss-px-to-viewport")({
                        "unitToConvert": "px", // 需要转换的单位，默认为"px"
                        "viewportWidth": 1920, // 视窗的宽度，对应移动端设计稿的宽度，一般是375
                        // "viewportHeight": 1080,// 视窗的高度，对应的是我们设计稿的高度
                        "unitPrecision": 3, // 单位转换后保留的精度
                        "propList": [ // 能转化为vw的属性列表
                            "*"
                        ],
                        "viewportUnit": "vw", // 希望使用的视口单位
                        "fontViewportUnit": "vw", // 字体使用的视口单位
                        "selectorBlackList": [], // 需要忽略的CSS选择器，不会转为视口单位，使用原有的px等单位。
                        "minPixelValue": 1, // 设置最小的转换数值，如果为1的话，只有大于1的值会被转换
                        "mediaQuery": true, // 媒体查询里的单位是否需要转换单位
                        "replace": false, // 是否直接更换属性值，而不添加备用属性
                        "exclude": /(node_module)/ // 忽略某些文件夹下的文件或特定文件，例如 'node_modules' 下的文件
                    })
                ]
            }
        },
        // 为所有的 CSS 及其预处理文件开启 CSS Modules。
        // 这个选项不会影响 `*.vue` 文件 false 导致 element-ui 失效
        "requireModuleExtension": true
    },
    // 在生产环境下为 Babel 和 TypeScript 使用 `thread-loader`
    // 在多核机器下会默认开启。
    "parallel": require("os").cpus().length > 1,
    // PWA 插件的选项。
    // 查阅 https://github.com/vuejs/vue-docs-zh-cn/blob/master/vue-cli-plugin-pwa/README.md
    "pwa": {},
    // 三方插件的选项
    "pluginOptions": {
    //
    }
};
