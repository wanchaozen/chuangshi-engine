# 创世引擎（Chuangshi Engine）

[English](README.md)

创世引擎是一套面向数据驱动叙事游戏、人生模拟器的轻量开源工具，不依赖第三方运行时库，主要提供：

- 事件条件表达式解析与执行；
- 大型事件关系图静态审计；
- 重复事件、未知属性、断裂引用、随机分支错位、比较符异常和孤立事件检查；
- 可在本地或持续集成中运行的命令行工具。

它来自跨世界人生模拟游戏 **《创世之初》** 的实际开发需求。正式游戏拥有数千条叙事事件；本仓库只公开可复用引擎和虚构示例，不包含完整剧情数据库、人物原画、音乐或其他私有内容。

![创世之初水墨诸天景观](assets/images/cloud-scroll.png)

仓库精选展示两张代表性美术，并附带一首原创程序生成的短篇氛围音乐；授权范围见
[assets/README.md](assets/README.md)。正式游戏的完整美术与音乐库不会公开。

仓库还提供一套独立原创的
[《灯照诸天：百事件演示篇》](examples/demo-world-100.zh-CN.json)，用于展示事件链、属性变化、选择和结局。它与《创世之初》正式事件库完全分离，不包含正式剧情、角色或隐藏条件。

## 可玩的浏览器演示

仓库包含一个无需构建的浏览器演示，将原创100事件、两张精选展示图、属性变化、
二选一分支和一首原创氛围音乐串成最小游戏流程。使用任意静态服务器启动仓库
根目录后，打开 `demo/` 即可体验。

## 为什么需要它

数据驱动游戏很容易出现“代码不报错，但内容永远不会触发”的问题。例如一个目标名称少写一个字，可能让整条后续事件链失效；没有条件、也没有前置引用的事件，则可能在不同运行时产生不同结果。

创世引擎把这些问题转换为确定、可在 CI 中复查的报告。

## 环境要求

- Node.js 20 或更高版本

不需要安装运行时依赖。

## 快速开始

```bash
git clone https://github.com/wanchaozen/chuangshi-engine.git
cd chuangshi-engine
npm test
npm run audit:example
npm run audit:world
```

检查自己的事件数据：

```bash
node src/cli.js path/to/events.json report.json
```

退出码：

- `0`：没有发现问题；
- `1`：文件有效，但发现错误或警告；
- `2`：输入文件或命令参数无效。

## 条件表达式

```js
import { checkCondition } from "@wanchaozen/chuangshi-engine";

const state = { AGE: 18, HEALTH: 7, TAGS: [1, 3] };

checkCondition(state, "AGE>=18&HEALTH>5");
checkCondition(state, "(AGE=18|AGE=19)&TAGS?[3]");
```

支持数值比较、相等、不等、数组包含和数组排除；逻辑关系使用 `&`、`|` 和括号。

## 当前路线

- JSON Schema 校验；
- 事件循环与可达性分析；
- 可复现的批量模拟；
- 事件关系图可视化；
- 常见 Excel 事件表适配器。

参与贡献前请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 来源与署名

条件执行器最初来源于
[VickScarlet/lifeRestart](https://github.com/VickScarlet/lifeRestart)，本项目在其基础上加入输入验证、对象与 Map 支持、公开解析 API 和明确错误处理。原 MIT 版权声明保留在 [LICENSE](LICENSE) 与 [NOTICE](NOTICE) 中。

事件审计工具和本文档来自 **《创世之初》** 项目的开发实践。

## 许可证

MIT，详见 [LICENSE](LICENSE)。
