# Pipeline｜小红书内容生成

在 DeepSeek Harness 里把主题或草稿写成小红书笔记，接着配图、预览和批量下载。也可以从收藏库选一篇参考笔记开始仿写。正式创作使用你的 Pipeline 账号和积分，体验模式消耗 0 积分。

## 在 Harness 里安装

打开 **插件 → 添加插件**，粘贴以下地址，点 **安装**。安装完成后点 **立即启用**，再从左侧打开 **Pipeline｜小红书内容生成**。Mac 和 Windows 用同一个地址，无需登录 GitHub。

```text
https://github.com/xuanqing-95/pipeline-xhs-harness-downloads
```

当前版本 **0.5.4-beta.54**，适用于 DeepSeek Harness **0.2.2 系列**（从 0.2.2-rc.1 起）。

### 按中文名称搜索或开启自动更新

如果已有「发现」入口，打开收录本插件的索引源，搜索 **小红书内容生成**，点 **安装**。第一次使用「发现」时，先在「插件 → 实验性插件」开启「自定义插件索引」，再到「发现」添加下面这个索引源。

```text
https://raw.githubusercontent.com/xuanqing-95/pipeline-xhs-harness-downloads/main/index.json
```

也可以在「添加插件」直接粘贴下面的版本地址。这个地址和「发现」都固定到同一个经过校验的版本。之后在 Pipeline「使用指南」里可以检查更新、点「立即更新」，或开启「空闲时自动更新」。普通仓库地址和备用安装包也会提示新版，如需一键更新，请先切换到上述固定版本来源。

```text
git+https://github.com/xuanqing-95/pipeline-xhs-harness-downloads.git#ae042b4ee5152a8e316eecff35f62b1645649010
```

[查看发行说明和备用安装包](https://github.com/xuanqing-95/pipeline-xhs-harness-downloads/releases/tag/v0.5.4-beta.54)

## 原创创作工作台

![当前工作台的体验模式，左侧是创作专家，生成的原图在下方每行显示四张](docs/examples/workbench-current.png)

上图使用 **beta.54** 工作台组件与内置体验数据。左侧可选择文案和配图专家，例如通用卡通配图、知识图卡和 Social Comic 条漫。

1. 从 Harness 侧栏打开插件，登录自己的 Pipeline 账号。
2. 打开「原创创作」。想先试用时，从标题旁切换到「体验模式」，点击「填入示例数据」。正式创作可直接输入自己的主题、草稿或完整文案。
3. 选择文案专家后，先生成文案供你核对和修改。已有文案时可只选配图专家。配图完成后，工作台会滚到结果，可逐张预览或批量下载。
4. 从「任务池」找回正式创作任务，从「账户积分」核对消耗。想仿写时，可从「收藏库」选择已收藏的笔记。

本插件由玄清维护。
