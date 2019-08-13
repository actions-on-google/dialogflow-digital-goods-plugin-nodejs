/**
 * Copyright 2019 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import test from 'ava'
import * as fetchMock from 'fetch-mock'
import {
  createMockSku,
  createMockSkuId,
  CONV_ID,
  ACCESS_TOKEN,
  PACKAGE_NAME,
} from './lib/stubs'
import { getSkus, consume } from './../src/digital-goods-service-api'

test.afterEach(t => {
  fetchMock.reset()
})

test.serial('getSkus returns an object of Skus', async t => {
  const expectedSkus = {
    id0: createMockSku({
      skuId: createMockSkuId('SKU_TYPE_IN_APP', 'id0', PACKAGE_NAME),
    }),
    id1: createMockSku({
      skuId: createMockSkuId('SKU_TYPE_SUBSCRIPTION', 'id1', PACKAGE_NAME),
    }),
  }
  fetchMock.post(
    `https://actions.googleapis.com/v3/packages/${PACKAGE_NAME}/skus:batchGet`,
    { skus: Object.values(expectedSkus) })
  const res = await getSkus(CONV_ID, ACCESS_TOKEN, PACKAGE_NAME, {
    SKU_TYPE_IN_APP: ['id0'],
    SKU_TYPE_SUBSCRIPTION: ['id1'],
  })
  t.deepEqual(res, expectedSkus)
})

test.serial('consume executes succesfully', async t => {
  fetchMock.post(
    `https://actions.googleapis.com/v3/conversations/${CONV_ID}/entitlement:consume`,
    {}) // not an actual value of consume response
  const res = await consume(CONV_ID, ACCESS_TOKEN, 'test-token')
  t.deepEqual(res, {})
})
