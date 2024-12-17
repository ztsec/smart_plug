from smart import *
import time
from datetime import datetime
import logging
from smart.type import AccountType
logger = logging.getLogger()

def init():
    # #接收委托推送 
    # def callback1(order):
    #     logger.debug("get on_order: %s",smart.utils.toString(order))
    # smart.current_account.on_order(callback1)

    # def callback2(order):
    #     logger.debug("get on_trade: %s",smart.utils.toString(order))
    # smart.current_account.on_trade(callback2)

    # def callback3(assets):
    #     logger.debug("get on_assets: %s",smart.utils.toString(assets))
    # smart.current_account.on_assets(callback3)

    # def callback4(position):
    #     logger.debug("get on_position: %s",smart.utils.toString(position))
    # smart.current_account.on_position(callback4)

    def timeCallback():
        logger.info("timer is invoked.")
        smart.callJSFunction("sendMsgOverJs",{"strategy_id":"gridtrading0519","strategy_param":{"key1":"123","key2":"456"}})
    
    #设定1000ms（1秒）的定时
    #smart.add_time_interval( 1000 , timeCallback )
    smart.add_timer( 1000 , timeCallback )
    logger.info("init finished.")

    
    def receiveServerMsg_py(data):
        logger.info("receive server msg: %s",smart.utils.toString(data)   )  
        #logger.info("buy1_amount:%d   sell1_amount:%d ",data["buy1_amount"] , data["sell1_amount"] ) #也可以通过中括号的形式获取某个key的value.
        
    smart.registCallableFunction("receiveServerMsg_py",receiveServerMsg_py)
    smart.callJSFunction("pyNoticeJsStrategyId",{"strategy_id":"strategy1"})  # strategy1 为功夫端策略的id

def show():
   logger.debug("show")
def hide():
    logger.debug("hide")
def close():
    logger.debug("close")

smart.on_init(init)
smart.on_show(show)
smart.on_hide(hide)
smart.on_close(close)