<template>
    <div class="sx-widget-box border-right">
        <div class="sx-widget-header overflow-hidden">
            <span class="sx-widget-title float-left text-truncate">今日成交</span>
            <div class="sx-widget-toolbar">
                <TableFilter @on-search="onSearch" placeholder="订单ID/代码" />
                <i class="f f-refresh mouse-over" title="刷新" @click="handleRefresh"></i>
                <i class="f f-cube mouse-over" title="统计" @click="popupStatisticsPanel"></i>
            </div>
        </div>
        <div class="sx-widget-body">
            <sx-big-table ref="table" primaryKey="_rowid" :columns="columns" highlight-row name="DealBT" />
        </div>
    </div>
</template>

<script>

/**
 * 今日成交表格
 * 默认按成交时间排序
 */
export default {
    name: "DealTable",
    props: {
        xtpBusinessType: {
            type: String,
            default: "all"
        }
    },
    data() {
        var columns = [
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
                render: (h, par) => {
                    return h("div", par.data);
                },
                fixed: "left"
            },
            {
                title: "证券代码",
                key: "instrument_id",
                width: 90,
                sortable: true,
                className: "info",
                align: "center",
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
                title: "成交价格",
                key: "price",
                width: 100,
                align: "right",
                sortable: true,
                className: "y-yellow",
                render: (h, par) => {
                    return h("div", par.data);
                }
            },
            {
                title: "成交数量",
                key: "volume",
                width: 140,
                align: "right",
                sortable: true,
                className: "y-error",
                statistics: "sum", // 求和
                render: (h, par) => {
                    return h("div", par.data == (0 || null) ? 0 : par.data.Format("0,0"));
                }
            },
            {
                title: "成交金额",
                key: "trade_amount",
                width: 140,
                align: "right",
                sortable: true,
                className: "y-yellow",
                statistics: "sum", // 求和
                render: (h, par) => {
                    return h("div", par.data == (0 || null) ? 0 : par.data.Format("0,0.00"));
                }
            },
            {
                title: "成交时间",
                key: "trade_time",
                width: 160,
                sortable: true,
                align: "center",
                render: (h, par) => {
                    return h("div", par.data.toDate("yyyy-MM-dd hh:mm:ss"));
                }
            },
            {
                title: "成交类型",
                key: "xtp_trade_type_name",
                sortable: true,
                width: 100,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "成交类型值",
                key: "xtp_trade_type",
                sortable: true,
                width: 100,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
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
                title: "渠道",
                key: "traffic_name",
                sortable: true,
                width: 100,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "自定义编号",
                key: "client_id",
                width: 320,
                align: "center",
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
                title: "合约类型",
                key: "instrument_type",
                sortable: true,
                width: 100,
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
                title: "母单编号",
                key: "parent_order_id",
                sortable: true,
                width: 360,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            }, {
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
                title: "渠道标识",
                key: "traffic",
                sortable: true,
                width: 100,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "exec_id",
                key: "xtp_exec_id",
                sortable: true,
                width: 200,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "report_index",
                key: "xtp_report_index",
                sortable: true,
                width: 160,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "order_exch_id",
                key: "xtp_order_exch_id",
                sortable: true,
                width: 160,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
            {
                title: "branch_pbu",
                key: "xtp_branch_pbu",
                sortable: true,
                width: 160,
                align: "center",
                render: (h, params) => {
                    return h("div", params.data);
                }
            },
        ];

        return {
            columns: columns,
            onUpdateTradeReport: null,
            // 因为初始化只能做一次，所以加一个锁
            isInited: false
        };
    },
    created() { },
    mounted: function () {
        let self = this;
        this.onUpdateTradeReport = function (trade) {
            if (self.filterHandler(trade)) {
                self.$refs.table.changeRows([trade]);
            }
        };
        this.$nextTick(() => {
            this.init(2);
            smart.current_account.addEventListener(smart.Event.ON_TRADE, this.onUpdateTradeReport);
        });
    },
    beforeDestroy() { },
    methods: {
        /**
         * 用户登录后展示用户的数据并开始监听事件
         */
        init(reason) {
            // debugger;
            let list = smart.current_account.trade_list.filter(this.filterHandler);
            list.sort((firstEl, secondEl) => {
                const firstVal = firstEl.trade_time;
                const secondVal = secondEl.trade_time;
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
        },
        filterHandler(it) {
            let pluginId = smart.config.plugin_id;
            //过滤出本插件的委托
            if (it.traffic_sub_id == pluginId) {
                return true;
            }
            return false;
        },
        /**
         * 用户注销后删除用户的数据并停止监听事件
         */
        clear() {
            this.isInited = false;
            this.$refs.table.clear();
        },
        popupStatisticsPanel() {
            this.$refs.table.popupStatisticsPanel();
        },
        handleRefresh() {
            this.init();
        },
        onSearch(queryStr) {
            if (queryStr) {
                this.$refs.table.search(item => {
                    return (
                        (item.instrument_id && item.instrument_id.indexOf(queryStr) !== -1) ||
                        (item.order_id && item.order_id.indexOf(queryStr) !== -1)
                    );
                });
            } else {
                this.$refs.table.search(null);
            }
        },
    }
};
</script>

<style>
</style>
