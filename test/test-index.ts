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

