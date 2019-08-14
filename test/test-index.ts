import { digitalGoodsHelper, DigitalGoodsHelperConversation } from './../src/index'
import test from 'ava'
import { dialogflow } from 'actions-on-google'
import * as assert from 'assert'
import { DigitalGoodsPlugin } from '../src/digital-goods-plugin'
import { OPTIONS } from './lib/stubs'

test.serial('Ensure digitalGoodsHelper returns correct object', async t => {
  const plugin = digitalGoodsHelper(OPTIONS)
  const app = dialogflow().use(plugin)
  app.fallback(conv => {
    assert((conv as DigitalGoodsHelperConversation).digitalGoods instanceof DigitalGoodsPlugin)
    conv.close('test')
  })
  t.pass(await app({}, {}))
})

