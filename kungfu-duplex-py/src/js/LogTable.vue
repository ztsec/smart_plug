<template>
    <div class="sx-widget-box">
        <div class="sx-widget-header overflow-hidden">
            <span class="sx-widget-title float-left text-truncate">Python日志 {{logPath}}</span>
            <div class="sx-widget-toolbar">
                <TableFilter @on-search="onSearch" placeholder="关键字" />
                <div class="option-bar">
                    <label>日志跟踪</label>
                    <i-switch v-model="isTail" @on-change="tailChange" style="margin-bottom: .3rem;">
                        <span slot="open">是</span>
                        <span slot="close">否</span>
                    </i-switch>

                    <label>查找：</label>
                    <Button type="primary" size="small" @click="onSearchDown">下一个</Button>
                    <Button type="primary" size="small" @click="onSearchUp">上一个</Button>
                </div>
            </div>
        </div>
        <div
            class="sx-widget-body"
            :style="{'overflow-y': 'auto','overflow-x': 'hidden'}"
            ref="logBody"
            @scroll="vbarScroll($event)"
            @mousewheel="vbarScroll($event)"
        >
            <div
                :class="{'log-row':true,'active':row.pos == active?true:false}"
                v-for="(row) in logList"
                :key="row.pos"
                :id="row.pos"
                @click="activeHandler(row)"
            >
                <span v-html="queryStr?row.searchLogTxt:row.logTxt"></span>
            </div>
        </div>
    </div>
</template>

<script>

/**
 * 今日成交表格
 * 默认按成交时间排序
 */
export default {
    name: "LogTable",
    props: {
    },
    data() {
        this.prePage = [];
        this.curPage = [];
        this.nextPage = [];
        this.curScroll = 0;
        this.loading = false;
        this.watcher = null;
        this.changePage = "";// nextPage,prePage,curPage
        this.scrollTop = -1;
        this.preHeight = 0;
        this.curHeight = 0;
        this.nextHeight = 0;
        this.activeEnd = -1;
        return {
            queryStr: "",
            logList: [],
            active: -1,//未选中
            logPath: "",
            isTail: false // 尾部跟踪
        };
    },
    created() {
        smart.on("RUN_PYTHON", this.init);
    },
    watch: {
        logList: function () {
            this.$nextTick(() => {
                if (this.changePage == "nextPage") {//下一页
                    let newScrollTop = this.scrollTop - this.preHeight;
                    if (this.nextHeight > 0) {//存在下一页
                        this.preHeight = this.curHeight;
                        this.curHeight = this.nextHeight;
                    }
                    this.nextHeight = this.$refs.logBody.scrollHeight - this.curHeight - this.preHeight;//下一页的高度
                    this.$refs.logBody.scrollTop = newScrollTop;
                } else if (this.changePage == "nextPageAppend") {//下一页新增
                    this.nextHeight = this.$refs.logBody.scrollHeight - this.curHeight - this.preHeight;//下一页的高度
                } else if (this.changePage == "tailPage") {//tailPage末尾页
                    if (this.nextHeight > 0) {//存在下一页
                        this.preHeight = this.curHeight;
                        this.curHeight = this.nextHeight;
                    }
                    this.nextHeight = this.$refs.logBody.scrollHeight - this.curHeight - this.preHeight;//下一页的高度
                    //滚动条定位到最后一行
                    let newScrollTop = this.$refs.logBody.scrollHeight - this.$refs.logBody.offsetHeight;
                    this.$refs.logBody.scrollTop = newScrollTop > 0 ? newScrollTop - 1 : 0;
                } else if (this.changePage == "tailPageAppend") {//尾页新增
                    this.nextHeight = this.$refs.logBody.scrollHeight - this.curHeight - this.preHeight;//下一页的高度
                    //滚动条定位到最后一行
                    let newScrollTop = this.$refs.logBody.scrollHeight - this.$refs.logBody.offsetHeight;
                    this.$refs.logBody.scrollTop = newScrollTop > 0 ? newScrollTop - 1 : 0;
                } else if (this.changePage == "prePage") {//上一页
                    if (this.preHeight > 0) {//存在上一页，则依次错位赋值
                        this.nextHeight = this.curHeight;
                        this.curHeight = this.preHeight;
                    }
                    this.preHeight = this.$refs.logBody.scrollHeight - this.curHeight - this.nextHeight;//上一页的高度
                    this.$refs.logBody.scrollTop = this.preHeight;
                } else if (this.changePage == "curPage") {//当前页
                    this.curHeight = this.$refs.logBody.scrollHeight;//当前页的高度
                    let logTotalHeight = this.$refs.logBody.scrollHeight;
                    let logViewHeight = this.$refs.logBody.offsetHeight;
                    let scrollTop = logTotalHeight - logViewHeight;//滚动到对底部留1像素防止触发下一页加载
                    // console.log("curPage:", logTotalHeight, logViewHeight, scrollTop);
                    this.$refs.logBody.scrollTop = scrollTop < 0 ? 0 : scrollTop - 1;
                } else if (this.changePage == "searchNextPage") {//searchNextPage
                    this.curHeight = this.$refs.logBody.scrollHeight;//当前页的高度
                    this.adjustActiveRowPosition();
                } else if (this.changePage == "searchPrePage") {//searchPrePage
                    this.curHeight = this.$refs.logBody.scrollHeight;//当前页的高度
                    this.adjustActiveRowPosition();
                }
            })
        }
    },
    mounted: function () {

    },
    beforeDestroy() { },
    methods: {
        /**
         * 用户登录后展示用户的数据并开始监听事件
         */
        async init(reason) {
            this.watcher = await smart.logger.watchLogFile(smart.config.plugin_id + "py.log");
            this.logPath = this.watcher.logFilePath;

            this.watcher.on("init", (lines, isAppend, isEnd) => { // 一整页更新
                this.changePage = "curPage";
                if (this.queryStr) {
                    // 处理关键字
                    this.wrapLogList(lines);
                }
                this.prePage = [];
                this.curPage = lines;
                this.nextPage = [];
                this.logList = lines;

                //重置初始化参数
                this.curScroll = 0;
                this.loading = false;
                this.scrollTop = -1;
                this.preHeight = 0;
                this.curHeight = 0;
                this.nextHeight = 0;

                if (isEnd) {
                    this.isTail = true;
                    this.watcher.tailLog(true);
                }
            })

            this.watcher.on("prePage", lines => { // 一整页更新
                if (lines.length > 0) {
                    this.scrollTop = this.$refs.logBody.scrollTop;
                    this.changePage = "prePage";
                    if (this.queryStr) {
                        // 处理关键字
                        this.wrapLogList(lines, true);
                    }
                    if (this.prePage.length > 0) {
                        this.nextPage = this.curPage.length > 0 ? this.curPage : this.nextPage;
                        this.curPage = this.prePage
                        this.prePage = lines;
                    } else {
                        // 未初始化则初始化前一页
                        this.prePage = lines;
                    }

                    this.logList = this.prePage.concat(this.curPage, this.nextPage)
                } else {
                    // this.$Message.warning("没有上一页!");
                }

                this.loading = false;
            });

            this.watcher.on("nextPage", (lines, isAppend, isEnd) => { // 下一页更新
                if (lines.length > 0) {
                    this.scrollTop = this.$refs.logBody.scrollTop;
                    this.changePage = "nextPage";
                    if (this.queryStr) {
                        // 处理关键字
                        this.wrapLogList(lines);
                    }
                    if (this.nextPage.length > 0) {
                        //判断当前nextPage的大小是否满足一页，不满足则新增的填充到nextPage
                        if (isAppend) {
                            this.changePage = "nextPageAppend";
                            //增量添加
                            this.nextPage = this.nextPage.concat(lines);
                        } else {
                            this.prePage = this.curPage.length > 0 ? this.curPage : this.prePage;
                            this.curPage = this.nextPage;
                            this.nextPage = lines;
                        }
                    } else {
                        // 未初始化则初始化下一页
                        this.nextPage = lines;
                    }

                    this.logList = this.prePage.concat(this.curPage, this.nextPage)
                } else {
                    // this.$Message.warning("没有下一页!");
                }
                if (isEnd) {
                    //自动跟踪日志新增记录
                    this.isTail = true;
                    this.watcher.tailLog(true);
                }

                this.loading = false;
            });

            this.watcher.on("tailPage", (lines, isAppend, isEnd) => { // 下一页更新
                if (lines.length > 0) {
                    this.scrollTop = this.$refs.logBody.scrollTop;
                    this.changePage = "tailPage";
                    if (this.queryStr) {
                        // 处理关键字
                        this.wrapLogList(lines);
                    }
                    if (this.nextPage.length > 0) {
                        //判断当前nextPage的大小是否满足一页，不满足则新增的填充到nextPage
                        if (isAppend) {
                            this.changePage = "tailPageAppend";
                            //增量添加
                            this.nextPage = this.nextPage.concat(lines);
                        } else {
                            this.prePage = this.curPage.length > 0 ? this.curPage : this.prePage;
                            this.curPage = this.nextPage;
                            this.nextPage = lines;
                        }
                    } else {
                        // 未初始化则初始化下一页
                        this.nextPage = lines;
                    }

                    this.logList = this.prePage.concat(this.curPage, this.nextPage)
                } else {
                    // this.$Message.warning("没有下一页!");
                }

                this.loading = false;
            });

            this.watcher.on("searchNextPage", (lines, startPos, endPos) => { // 一整页更新
                if (lines.length > 0) {
                    if (typeof startPos == "undefined") {
                        this.active = -1;
                        this.activeEnd = -1;
                    } else {
                        this.active = startPos;
                        this.activeEnd = endPos;
                    }
                    this.wrapLogList(lines);
                    this.prePage = [];
                    this.nextPage = [];
                    this.changePage = "searchNextPage";
                    this.curPage = lines;
                    this.logList = lines;
                } else {
                    // this.$Message.warning("向下搜索没有更多!");
                }
                this.loading = false;
            });

            this.watcher.on("searchPrePage", (lines, startPos, endPos) => { // 一整页更新
                if (lines.length > 0) {
                    if (typeof startPos == "undefined") {
                        this.active = -1;
                        this.activeEnd = -1;
                    } else {
                        this.active = startPos;
                        this.activeEnd = endPos;
                    }
                    this.wrapLogList(lines);
                    this.prePage = [];
                    this.nextPage = [];
                    this.changePage = "searchPrePage";
                    this.curPage = lines;
                    this.logList = lines;
                } else {
                    // this.$Message.warning("向上搜索没有更多!");
                }
                this.loading = false;
            });
            // watcher.enableTailLog(true);
        },
        /**
         * 清空日志
         */
        clear() {
            this.logList = [];
        },
        onSearch(queryStr) {
            if (!queryStr) {
                // 默认最新100条
                if (this.loading) return;
                this.loading = true;
                this.watcher.init();
                this.queryStr = "";
                return;
            }
            if (this.queryStr != queryStr) {
                this.queryStr = queryStr;
                //停止日志最新跟踪
                this.isTail = false;
                this.watcher.tailLog(false);
                //是否选中行，选中行则从指定的位置开始向下搜索
                this.wrapLogList(this.logList);

                if (this.active != -1) {//有选中
                    this.onSearchDown(this.active);// 继续往下找
                } else {
                    this.onSearchDown(0);// 继续往下找
                }
            } else {
                //正在同样的搜索条件
                this.onSearchDown(this.activeEnd);// 默认往下找
            }
        },
        adjustActiveRowPosition() {
            let activeDom = document.getElementById(this.active);
            if (!activeDom) return;//没有选中行，则不进行居中显示处理
            let logBodyHeight = this.$refs.logBody.offsetHeight;
            let activeScrollTop = activeDom.offsetTop - logBodyHeight / 2;//新滚动定位

            //选中行位于顶部，不能居中
            if (activeScrollTop < 0) {
                activeScrollTop = 1;
            }

            //选中行位于底部，不能居中
            if (activeScrollTop + logBodyHeight > this.$refs.logBody.scrollHeight) {// 超过总高度
                activeScrollTop = this.$refs.logBody.scrollHeight - logBodyHeight - 1;
            }

            this.$refs.logBody.scrollTop = activeScrollTop;
        },
        onSearchDown(startPosition) { // 从上往下搜索
            if (!this.queryStr) {
                this.$Message.warning("请输入关键字!");
                return;
            }
            if (this.loading) return;
            if (typeof startPosition == "undefined" || startPosition instanceof MouseEvent) {
                startPosition = this.activeEnd;
            }
            this.loading = true;
            this.watcher.searchNextPage(this.queryStr, startPosition);
        },
        onSearchUp() { // 从上往下搜索
            if (!this.queryStr) {
                this.$Message.warning("请输入关键字!");
                return;
            }
            if (this.loading) return;

            this.loading = true;
            this.watcher.searchPrePage(this.queryStr, this.active - 1);
        },
        wrapLogList(list, isHead) {
            list.forEach(item => {
                item.searchLogTxt = item.logTxt.replace(new RegExp(this.queryStr, 'g'), '<span class="key-word">' + this.queryStr + '</span>');
                if (item.searchLogTxt != item.logTxt) {
                    item.isSearched = true;
                } else {
                    item.isSearched = false;
                }
            });
        },
        getSearchRows() {
            let searchRows = [];
            this.logList.forEach(item => {
                if (item.isSearched) {
                    searchRows.push(item.pos);
                }
            });

            return searchRows;
        },
        activeHandler(row) {
            this.active = row.pos;
            this.activeEnd = row.posEnd;
        },
        vbarScroll(event) {
            if (!(event instanceof WheelEvent)) return;
            const scrollTop = event.currentTarget.scrollTop;
            const logBodyHeight = this.$refs.logBody.offsetHeight;
            const logScrollHeight = this.$refs.logBody.scrollHeight;
            const maxScrollHeight = logScrollHeight - logBodyHeight;
            if ((event.deltaY > 0) || (scrollTop > this.curScroll)) { // 往下
                if (!this.loading && scrollTop >= maxScrollHeight) {
                    this.loading = true;
                    this.watcher.nextPage();
                }
            } else if ((event.deltaY < 0) || (scrollTop < this.curScroll)) { // 往上
                this.isTail = false;
                this.watcher.tailLog(false);//停止日志最新跟踪
                if (!this.loading && scrollTop <= 0) {
                    this.loading = true;
                    this.watcher.prePage();
                }
            }

            this.curScroll = scrollTop;
        },
        tailChange(checked) {
            if (this.isTail) {
                this.loading = true;
                this.watcher.init();
            } else {
                this.watcher.tailLog(this.isTail);//停止日志最新跟踪
            }

        }
    }
};
</script>

<style lang='scss'  scoped>
.log-row {
    padding: 5px 20px;
    background: none;
    font-size: 14px;
    &.active {
        background: #0a4f86;
    }
}

.option-bar {
    position: absolute;
    right: 180px;
    top: 0;
    width: 280px;
}
</style>
<style>
.key-word {
    background: #fff;
    color: #043964;
    border-radius: 4px;
}

.log-row.active .key-word {
    background: #f5f542;
}
</style>
