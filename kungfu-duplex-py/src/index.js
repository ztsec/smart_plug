import Vue from 'vue'
import App from './js/App'
import smartx_ui from '@xtp-smart/ui'
import iView from 'iview';

Vue.use(smartx_ui);
Vue.use(iView);
import '!style-loader!css-loader!iview/dist/styles/iview.css';
import '@xtp-smart/style/dist/css/smartx.min.css'

smart.on_init(function () {
    console.log("onInit");

    const globalApp = new Vue({
        render: h => h(App),
    }).$mount('#app');

    // for(let strategy of smart.strategy_map.values()){
    // 	await strategy.loadData();
    // }

    smart.registCallableFunction("sendMsgOverJs", function (data) {
        console.log("data:", data)
        console.log("data.strategy_id:", data.strategy_id)
        console.log("data.strategy_param:", data.strategy_param)
        console.log("smart.strategy_map:", smart.strategy_map)

        for (let strategy of Object.values(smart.strategy_map)) {
            if (strategy.strategy_id == data.strategy_id) {
                strategy.postStrategyParams(data.strategy_param);
                console.log("found strategy_id :", data.strategy_id);
                console.log("msg has send,msg content: ", data.strategy_param);
                break;
            }
        }
    })


    let port0 = null;

    function testPyHandler(rsp) {
        // console.log("testPyHandler:",rsp)
    }

    // python 通知 js ，python端关心哪些策略
    smart.registCallableFunction("pyNoticeJsStrategyId", async (data) => {
        console.log("receive python income param: ", data);
        let strategy_instance = smart.strategy_map[data.strategy_id + "_alphax"];
        if (!strategy_instance) {
            console.error("没有找到对应的后台策略：", data.strategy_id);
            smart.notice({
                level: 'error',
                title: '加载策略出错',
                msg: "没有找到对应的后台策略：" + data.strategy_id + "，请检查 pyNoticeJsStrategyId 调用或策略列表",
                duration: 0,
                timestamp: Date.now()
            });
            return;
        }
        await strategy_instance.loadData();
        strategy_instance.on(smart.Event.ON_ALPHAX_MSG, (msg) => {
            //console.debug("before invoke js callback2: ",  msg );
            try {
                const payload = { data: msg };
                smart.callPythonFunction(port0, "receiveServerMsg_py", payload, testPyHandler)
            } catch (err) {
                console.error(err.message, msg);
            }
            //console.debug("after invoke js callback2: ",  msg );
        })

    });

    port0 = smart.runPython("./start.py");
});
