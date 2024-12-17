<template>
    <div class="sx-layout">
        <div class="sx-layout-north border-bottom">
            <EntrustTable />
            <DealTable />
        </div>
        <div class="sx-layout-center" style="height: calc(67%);">
            <LogTable />
        </div>
    </div>
</template>

<script>
import EntrustTable from "@/js/EntrustTable.vue";
import DealTable from "@/js/DealTable.vue";
import LogTable from "@/js/LogTable.vue";

export default {
    components: {
        EntrustTable,
        DealTable,
        LogTable
    },
    data: function () {
        return {
            dashboardState: {
                log: "show"
            }
        };
    },
    created() {
        console.log("App created");
    },
    methods: {
    }
};
</script>
<style lang="scss" scoped>
$border-color: #4e535b;
$bottom-color: #222224;
$bottom-height: 28px;
.sx-layout-north {
    display: flex;
    height: 33%;
    // flex-grow: 1;
    overflow: hidden;
}

.sx-layout-center {
    display: flex;
    height: calc(67% - #{$bottom-height});
    overflow: hidden;
}

.sx-layout-south {
    flex-basis: $bottom-height;
    line-height: $bottom-height;
    background-color: $bottom-color;
    border-top: 1px solid $border-color;
    border-bottom: 1px solid $border-color;

    .status-item {
        padding-left: 20px;
        padding-right: 20px;
    }
}
</style>