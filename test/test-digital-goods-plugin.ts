import ava, { TestInterface } from 'ava'
import {DialogflowConversation} from 'actions-on-google'
import {
  actionsRequestAfterPurchase,
  getEntitlementsFromActionsRequest,
  setEntitlementsForActionsRequest,
  createMockSku,
  createMockSkuId,
  OPTIONS,
  ACCESS_TOKEN,
  PACKAGE_NAME,
} from './lib/stubs'
import * as sinon from 'sinon'
import { DigitalGoodsPlugin, InitOptions } from '../src/digital-goods-plugin'
const digitalGoodsService = require('./../src/digital-goods-service-api')
const auth = require('./../src/auth')

interface AvaContext {
  conv: DialogflowConversation
  options: InitOptions
  expectedSkus: object
}

const test = ava as TestInterface<AvaContext>

test.before(t => {
  t.context.options = OPTIONS
  t.context.expectedSkus = {
    id0: createMockSku({
      skuId: createMockSkuId('SKU_TYPE_IN_APP', 'id0', PACKAGE_NAME),
    }),
    id1: createMockSku({
      skuId: createMockSkuId('SKU_TYPE_SUBSCRIPTION', 'id1', PACKAGE_NAME),
    }),
  }
})

test.beforeEach(t => {
  // Reset conv because it carries a shared state between hooks
  t.context.conv = new DialogflowConversation({
    body: {
      originalDetectIntentRequest: {
      payload: actionsRequestAfterPurchase,
      },
    },
    headers: {},
  })
  // stub internal modules
  sinon.stub(digitalGoodsService, 'getSkus').callsFake(async (...args)=>{
    return t.context.expectedSkus
  })
  sinon.stub(auth, 'getAccessToken').callsFake(
    (...args) => {
      return new Promise((resolve, reject) => resolve(ACCESS_TOKEN))
    },
  )
})

test.afterEach(t => {
  if (digitalGoodsService.getSkus.restore) {
    digitalGoodsService.getSkus.restore()
  }
  if (auth.getAccessToken.restore) {
    auth.getAccessToken.restore()
  }
  if (digitalGoodsService.consume.restore) {
    digitalGoodsService.consume.restore()
  }
})

test.serial(`Test that a product that is an entitlement and is marked as consumable
  is consumed`, async t => {
  const plugin = new DigitalGoodsPlugin(t.context.options, t.context.conv)
  t.assert(getEntitlementsFromActionsRequest(actionsRequestAfterPurchase).length === 2)
  t.true(plugin.canConsumeSku(t.context.options.consumableIds![0]))
})

test.serial(`Test that a product which was not purchased before, but marked as consumable
  is not consumed`, async t => {
  const requestCopy = JSON.parse(JSON.stringify(actionsRequestAfterPurchase))
  setEntitlementsForActionsRequest(requestCopy, [])
  t.assert(getEntitlementsFromActionsRequest(requestCopy).length === 0)
  const conv = new DialogflowConversation({
    body: {
        originalDetectIntentRequest: {
        payload: requestCopy,
      },
    },
    headers: {},
  })
  const plugin = new DigitalGoodsPlugin(t.context.options, conv)
  t.false(plugin.canConsumeSku(t.context.options.consumableIds![0]))
})

test.serial(`Test that a product that is an entitlement, but not marked as consumable
  is not consumed`, async t => {
  const optionsCopy = JSON.parse(JSON.stringify(t.context.options))
  optionsCopy.consumableIds = []
  const plugin = new DigitalGoodsPlugin(optionsCopy, t.context.conv)
  t.false(plugin.canConsumeSku(t.context.options.consumableIds![0]))
})

test.serial(`Test that plugin correctly indicates that sku was purchased
when the sku was indeed purchased`, t => {
  const plugin = new DigitalGoodsPlugin(t.context.options, t.context.conv)
  t.assert(getEntitlementsFromActionsRequest(actionsRequestAfterPurchase))
  t.true(plugin.skuPurchased(
    getEntitlementsFromActionsRequest(actionsRequestAfterPurchase)[0].sku))
})

test.serial(`Test that plugin correctly indicates that sku was purchased
when the sku was not purchased.`, t => {
  const plugin = new DigitalGoodsPlugin(t.context.options, t.context.conv)
  t.false(plugin.skuPurchased('testskunotvalid'))
})

test.serial(`Test that plugin returns a correct structure of skus`, async t => {
  // test body
  const plugin = new DigitalGoodsPlugin(t.context.options, t.context.conv)
  const skus = await plugin.getSkus()
  t.deepEqual(skus, t.context.expectedSkus)
})

test.serial(`Test that plugin saves skus in conv.data if such option is set`, async t => {
  // test body
  const optionsCopy = JSON.parse(JSON.stringify(t.context.options)) as InitOptions
  optionsCopy.keepInConv = true
  const plugin = new DigitalGoodsPlugin(optionsCopy, t.context.conv)
  await plugin.getSkus()
  t.deepEqual(t.context.conv.data.skus, t.context.expectedSkus)
})

test.serial(`Test that plugin doesn't save skus in
 conv.data if such option is not set`, async t => {
  // stub internal modules
  const optionsCopy = JSON.parse(JSON.stringify(t.context.options)) as InitOptions
  optionsCopy.keepInConv = false
  const plugin = new DigitalGoodsPlugin(optionsCopy, t.context.conv)
  await plugin.getSkus()
  t.is(t.context.conv.data.skus, undefined)
})

test.serial(`Test that plugin extracts correct payment metadata from the conv.user`, async t => {
  const stub = sinon.stub(digitalGoodsService, 'consume').callsFake(async (...args)=>{
    // note this is not an actual consume endpoint response
    return new Promise((resolve, reject) => resolve({}))
  })
  const plugin = new DigitalGoodsPlugin(t.context.options, t.context.conv)
  const res = await plugin.consumeSku('premium')
  t.deepEqual(res, {})
  stub.calledWith(
    'test_token',
    actionsRequestAfterPurchase.conversation!.conversationId,
    getEntitlementsFromActionsRequest(actionsRequestAfterPurchase)
      .find(ent => ent.sku === 'premium').inAppDetails!.inAppPurchaseData!.purchaseToken,
  )
  t.is(t.context.conv.data.skus, undefined)
})
