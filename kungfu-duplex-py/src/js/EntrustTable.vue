<template>
    <div class="sx-widget-box border-right">
        <div class="sx-widget-header">
            <span class="sx-widget-title">
                <a v-if="todayFinish" @click="handleCheckTodayUnfinished">
                    <i class="ivu-icon ivu-icon-calendar" title="今日委托"></i>今日委托
                </a>
                <a v-else @click="handleCheckTodayFinished">
                    <i class="ivu-icon ivu-icon-clock" title="未完成委托"></i>未完成委托
                </a>（点击可切换）
            </span>
            <div class="sx-widget-toolbar">
                <TableFilter @on-search="onSearch" placeholder="订单ID/代码" />
                <i class="f f-refresh" title="刷新" @click="handleRefresh"></i>
                <i class="f f-cube" title="统计" @click="popupStatisticsPanel"></i>

                <Button type="error" size="small" @click="handleCancelAllOrders" title="撤单">撤单</Button>
            </div>
        </div>
        <div class="sx-widget-body">
            <big-table
                ref="table"
                primaryKey="order_id"
                :columns="columns"
                :highlightRow="true"
                name="EntrustBT"
                @on-row-dblclick="rowDblclick"
                @on-selection-change="list => pendingCancelList = list"
            />
        </div>
    </div>
</template>

<script>

let OrderStatus = smart.Type.OrderStatus;
/**
 * 今日委托表格
 * 默认按委托时间排序
 */
export default {
    name: "EntrustTable",
    props: {},
    data: function () {
        var columns = [
            {
                type: "selection",
                width: 40,
                align: "center",
                fixed: "left"
            },
            {
                title: "序号",
                type: "index",
                width: 60,
                fixed: "left",
                align: "center",
                className: "no-padding"
            },
            {
                title: "方向",
                key: "side_name",
                width: 170,
                align: "center",
                sortable: true,
                render: (h, params) => {
                    return h("div", params.data);
                },
                fixed: "left"
            },
            {
                title: "证券代码",
                key: "instrument_id",
                width: 90,
                align: "center",
                sortable: true,
                fixed: "left"
            },
            {
                title: "证券名称",
                key: "instrument_name",
                width: 140,
                sortable: true,
                align: "left",
                className: "y-yellow"
            },
            {
                title: "报单状态",
                key: "status_name",
                width: 90,
                sortable: true,
                align: "left",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "价格条件",
                key: "price_type_name",
                width: 300,
                sortable: true,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "委托价格",
                key: "limit_price",
                width: 90,
                align: "right",
                sortable: true,
                className: "y-yellow",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "委托数量",
                key: "volume",
                width: 140,
                align: "right",
                sortable: true,
                className: "y-error",
                statistics: "sum", // 求和
                render: (h, params) => {
                    return h("div", params.data == (0 || null) ? 0 : params.data.Format("0,0"));
                }
            },
            {
                title: "成交数量",
                key: "volume_traded",
                width: 140,
                align: "right",
                className: "y-yellow",
                sortable: true,
                statistics: "sum", // 求和
                render: (h, params) => {
                    return h("div", params.data == (0 || null) ? 0 : params.data.Format("0,0"));
                }
            },
            {
                title: "剩余数量",
                key: "volume_left",
                width: 140,
                align: "right",
                sortable: true,
                className: "y-error",
                statistics: "sum", // 求和
                render: (h, params) => {
                    return h("div", params.data == (0 || null) ? 0 : params.data.Format("0,0"));
                }
            },
            {
                title: "成交金额",
                key: "trade_amount",
                width: 140,
                align: "right",
                sortable: true,
                className: "info y-yellow",
                statistics: "sum", // 求和
                render: (h, params) => {
                    return h("div", params.data == (0 || null) ? 0 : params.data.Format("0,0.00"));
                }
            },
            {
                title: "委托时间",
                key: "insert_time",
                width: 160,
                align: "center",
                sortable: true,
                render: (h, params) => {
                    return h("div", params.data != undefined ? params.data.toDate("yyyy-MM-dd hh:mm:ss") : "");
                }
            },
            {
                title: "错误原因",
                key: "error_msg",
                sortable: true,
                width: 400,
                align: "left",
                render: (h, params) => {
                    return h("div", { attrs: { title: params.data } }, params.data);
                }
            },
            {
                title: "错误ID",
                key: "error_id",
                sortable: true,
                width: 90,
                align: "center",
                statistics: "countNotEmpty", // 非空计数
                render: (h, params) => {
                    return h("div", params.data == 0 ? "" : params.data);
                }
            },
            {
                title: "订单ID",
                key: "order_id",
                sortable: true,
                width: 170,
                align: "center"
            },
            {
                title: "自定义编号",
                key: "client_id",
                sortable: true,
                width: 400,
                align: "center"
            },
            {
                title: "数据接收时间",
                key: "rcv_time",
                sortable: true,
                width: 200,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data != undefined ? params.data.toDate("yyyy-MM-dd hh:mm:ss") : "");
                }
            },
            {
                title: "交易日",
                key: "trading_day",
                sortable: true,
                width: 100,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "交易所ID",
                key: "exchange_id",
                sortable: true,
                width: 100,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "交易所名称",
                key: "exchange_id_name",
                sortable: true,
                width: 200,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "资金账号",
                key: "account_id",
                sortable: true,
                width: 180,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "买卖方向(alphax值)",
                key: "side",
                sortable: true,
                width: 160,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "开平方向(alphax值)",
                key: "offset",
                sortable: true,
                width: 160,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "价格类型(alphax值)",
                key: "price_type",
                sortable: true,
                width: 160,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "成交量类型(期货)",
                key: "volume_condition",
                sortable: true,
                width: 200,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "成交量类型名称(期货)",
                key: "volume_condition_name",
                sortable: true,
                width: 200,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "成交时间类型(期货)",
                key: "time_condition",
                sortable: true,
                width: 200,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "成交时间类型名称(期货)",
                key: "time_condition_name",
                sortable: true,
                width: 200,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "母单编号",
                key: "parent_order_id",
                sortable: true,
                width: 360,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "业务子标识",
                key: "traffic_sub_id",
                sortable: true,
                width: 200,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "撤单时间",
                key: "cancel_time",
                sortable: true,
                width: 200,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data != undefined ? params.data.toDate("yyyy-MM-dd hh:mm:ss") : "");
                }
            },
            {
                title: "撤单自定义编号",
                key: "order_cancel_client_id",
                sortable: true,
                width: 200,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "所撤原单的编号",
                key: "order_cancel_xtp_id",
                sortable: true,
                width: 200,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "xtp证券业务类型",
                key: "xtp_business_type",
                sortable: true,
                width: 260,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "xtp证券业务类型名称",
                key: "xtp_business_type_name",
                sortable: true,
                width: 200,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "xtp市场类型",
                key: "xtp_market_type",
                sortable: true,
                width: 200,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "xtp市场类型名称",
                key: "xtp_market_name",
                sortable: true,
                width: 200,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "xtp价格类型",
                key: "xtp_price_type",
                sortable: true,
                width: 200,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "xtp价格类型名称",
                key: "xtp_price_type_name",
                sortable: true,
                width: 200,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "xtp开平方向",
                key: "xtp_position_effect_type",
                sortable: true,
                width: 300,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "xtp开平方向名称",
                key: "xtp_position_effect_type_name",
                sortable: true,
                width: 150,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "xtp交易方向",
                key: "xtp_side_type",
                sortable: true,
                width: 200,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "xtp交易方向名称",
                key: "xtp_side_type_name",
                sortable: true,
                width: 200,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "xtp委托状态值",
                key: "xtp_order_status",
                sortable: true,
                width: 360,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "xtp委托状态名称",
                key: "xtp_order_status_name",
                sortable: true,
                width: 200,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "合约类型名称",
                key: "instrument_type_name",
                sortable: true,
                width: 120,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "渠道",
                key: "traffic_name",
                sortable: true,
                width: 150,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "渠道标识",
                key: "traffic",
                sortable: true,
                width: 150,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            }
        ];
        return {
            todayFinish: true,//默认今日全部委托
            filter: { id: "" },
            columns: columns,
            pendingCancelList: [],
            // 因为初始化只能做一次，所以加一个锁
            isInited: false
        };
    },
    mounted: function () {
        // 使用用户的自定列设置，必须在mounted方法处理
        let self = this;

        function onUpdateOrder(order) {
            let pluginId = smart.config.plugin_id;
            //过滤出本插件的委托
            if (order.traffic_sub_id == pluginId) {
                let changeRows = [];
                let delRows = [];
                if (!self.todayFinish) {//未完成的委托
                    if ([OrderStatus.Submitted, OrderStatus.Pending, OrderStatus.PartialFilledActive].includes(order.status)) {//未完成
                        changeRows.push(order);
                    } else {
                        //后来撤单完成的
                        delRows.push(order);
                    }
                } else {//所有委托
                    changeRows.push(order);
                }

                self.$refs.table.changeRows(changeRows, delRows);
            }

        };

        this.$nextTick(() => {
            self.init(2);
            smart.current_account.addEventListener(smart.Event.ON_ORDER, onUpdateOrder);
        });
    },
    methods: {
        /**
         * 用户登录后展示用户的数据并开始监听事件
         */
        init(reason) {
            // debugger;
            console.log("filterHandler list1:", smart.current_account.order_list.length);
            let list = smart.current_account.order_list.filter(this.filterHandler);
            list.sort((firstEl, secondEl) => {
                const firstVal = firstEl.insert_time;
                const secondVal = secondEl.insert_time;
                if (firstVal === secondVal) {
                    return 0;
                } else if (firstVal > secondVal) {
                    return -1;
                } else {
                    return 1;
                }
            });
            this.$refs.table.init({
                total: list.length,
                initData: list
            });
            this.pendingCancelList = [];
        },
        filterHandler(it) {
            let pluginId = smart.config.plugin_id;
            //过滤出本插件的委托
            if (it.traffic_sub_id == pluginId) {
                if (!this.todayFinish) {
                    if ([OrderStatus.Submitted, OrderStatus.Pending, OrderStatus.PartialFilledActive].includes(it.status)) {//未完成
                        return true;
                    } else {
                        return false;
                    }
                }

                return true;
            }
            return false;
        },
        clear() {
            this.$refs.table.clear();
        },
        async handleCancelAllOrders() {
            let pendingCancelList = this.$refs.table.getSelection();
            let chedanList = pendingCancelList.filter(e => {
                return e.xtp_order_status != "XTP_ORDER_STATUS_REJECTED";
            });

            if (chedanList.length <= 0) {
                return;
            }

            const msg = "确认提交撤单委托？";
            this.$Modal.confirm({
                title: "系统提示",
                content: "<p style=\"font-size: 14px;\">" + msg + "</p>",
                okText: "是",
                cancelText: "否",
                onOk: () => {
                    handler();
                }
            });

            function handler() {
                chedanList.forEach(it => {
                    smart.cancel_order(null, it.order_id).then(function (rsp) {
                        console.log("#################cancel_order success:", rsp);
                    }, function (rsp) {
                        console.log("#################cancel_order reject:", rsp);
                    });
                });
            }
        },
        handleRefresh() {
            this.$refs.table && this.$refs.table.clear();
            this.init();
        },
        onSearch(queryStr) {
            this.filter.id = queryStr;
            if (queryStr) {
                this.$refs.table.search(item => {
                    return (
                        (item.instrument_id && item.instrument_id.indexOf(this.filter.id) !== -1) ||
                        (item.order_id && item.order_id.indexOf(this.filter.id) !== -1)
                    );
                });
            } else {
                this.$refs.table.search(null);
            }
        },
        handleCheckTodayFinished() { // 查看当日已完成
            this.todayFinish = true;
            this.$refs.table && this.$refs.table.clear();
            this.init();
        },
        handleCheckTodayUnfinished() {
            this.resetData(/* cleanSearchInfo */ false); // 切换全部/未完成状态，不应该影响关键字的搜索
            this.init();
        },
        popupStatisticsPanel() {
            this.$refs.table.popupStatisticsPanel();
        },
        resetData(cleanSearchInfo = true, resetToday = true) {
            if (resetToday) {
                this.todayFinish = false;
            }
            if (cleanSearchInfo) {
                this.filter.id = "";
            }
            this.$refs.table && this.$refs.table.clear();
            return true;
        },
    }
};
</script>

<style>
</style>
