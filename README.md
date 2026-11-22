# Pipeline｜小红书内容生成

在 DeepSeek Harness 里把主题或草稿写成小红书笔记，接着配图、预览和批量下载。也可以从收藏库选一篇参考笔记开始仿写。正式创作使用你的 Pipeline 账号和积分，体验模式消耗 0 积分。

## 在 Harness 里安装

1. 打开 **插件 → 添加插件**。
2. 输入这个名字，点 **安装**。

   ```text
   dsh-pipeline-xhs
   ```

3. 安装完成后点 **立即启用**，从左侧打开 **Pipeline｜小红书内容生成**。

Mac 和 Windows 都用这个名字。后续更新在 Harness 的「插件」详情页办理。

全新安装的 Harness 可以直接按上面的短包名安装。已经添加作者或 DSHDesk 社区索引的用户，也可以在「发现」搜索 **小红书内容生成**，打开插件卡片安装。[Harness 官方插件索引说明](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/guide/plugin-market.zh.md)

### 自动更新

想让插件在空闲时自行更新，可以在 **使用指南 → 插件更新** 勾选 **空闲时自动更新**。

在 Harness 的「插件」页面打开 Pipeline 详情。有新版时，点右上角的「更新到…」，也可以展开「版本」选择要安装的版本。

<details>
<summary>已通过 GitHub 安装，或需要 Mac 安装包</summary>

通过索引安装的用户可在 Harness 插件详情页选择可用版本。使用 Mac 安装助手的用户可以下载下面的新版安装包。

[作者索引](https://raw.githubusercontent.com/xuanqing-95/pipeline-xhs-harness-downloads/main/index.json) · [GitHub 版本与备用安装包](https://github.com/xuanqing-95/pipeline-xhs-harness-downloads/releases/latest)

</details>

## 原创创作工作台

![当前工作台的体验模式，左侧是创作专家，生成的原图在下方每行显示四张](docs/examples/workbench-current.png)

上图使用 **beta.54** 工作台组件与内置体验数据。左侧可选择文案和配图专家，例如通用卡通配图、知识图卡和 Social Comic 条漫。

1. 从 Harness 侧栏打开插件，登录自己的 Pipeline 账号。
2. 打开「原创创作」。想先试用时，从标题旁切换到「体验模式」，点击「填入示例数据」。正式创作可直接输入自己的主题、草稿或完整文案。
3. 选择文案专家后，先生成文案供你核对和修改。已有文案时可只选配图专家。配图完成后，工作台会滚到结果，可逐张预览或批量下载。
4. 从「任务池」找回正式创作任务，从「账户积分」核对消耗。想仿写时，可从「收藏库」选择已收藏的笔记。

本插件由玄清维护。
