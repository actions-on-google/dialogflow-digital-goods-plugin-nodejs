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

import {
  GoogleActionsTransactionsV3SkuId,
  GoogleTypeMoney,
  GoogleActionsTransactionsV3SkuIdSkuType,
  GoogleActionsV2AppRequest,
} from 'actions-on-google'

import { InitOptions } from './../../src/digital-goods-plugin'

const PACKAGE_NAME = 'test.package.name'
const CONV_ID = '123'
const ACCESS_TOKEN ='abc123'

interface MockSkuInitOptions {
  title?: string,
  description?: string,
  skuId: GoogleActionsTransactionsV3SkuId,
  formattedPrice?: '<empty price>',
  price?: GoogleTypeMoney
}

interface MockSkuId {
  skuType: GoogleActionsTransactionsV3SkuIdSkuType,
  id: string,
  packageName: string
}

interface MockSku {
  title: string,
  description: string,
  skuId: GoogleActionsTransactionsV3SkuId,
  formattedPrice: string,
  price: GoogleTypeMoney
}

function createMockSku(options: MockSkuInitOptions): MockSku {
  return {
    title: options.title ? options.title : '<empty title>',
    description: options.description ? options.description : '<empty description>',
    skuId: options.skuId,
    formattedPrice: options.formattedPrice ? options.formattedPrice : '<empty price>',
    price: options.price ? options.price : {},
  }
}

function createMockSkuId(skuType: GoogleActionsTransactionsV3SkuIdSkuType,
  id: string,
  packageName?: string) {
  return {
    skuType,
    id,
    packageName,
  }
}

const actionsRequestAfterPurchase: GoogleActionsV2AppRequest = {
  conversation: {
      conversationId: 'conversationId',
      conversationToken: '[\"build-the-order\",\"_actions_on_google\"]',
      type: 'ACTIVE',
  },
  inputs: [
      {
          arguments: [
              {
                  name: 'text',
                  rawText: 'no',
                  textValue: 'no',
              },
          ],
          intent: 'actions.intent.TEXT',
          rawInputs: [
              {
                  inputType: 'KEYBOARD',
                  query: 'no',
              },
          ],
      },
  ],
  isInSandbox: true,
  surface: {
      capabilities: [
          {
              name: 'actions.capability.AUDIO_OUTPUT',
          },
          {
              name: 'actions.capability.WEB_BROWSER',
          },
          {
              name: 'actions.capability.ACCOUNT_LINKING',
          },
          {
              name: 'actions.capability.MEDIA_RESPONSE_AUDIO',
          },
          {
              name: 'actions.capability.SCREEN_OUTPUT',
          },
      ],
  },
  user: {
      lastSeen: 'asds',
      locale: 'en-US',
      packageEntitlements: [
          {
              entitlements: [
                  {
                      inAppDetails: {
                          inAppDataSignature: 'signature==',
                          inAppPurchaseData: {
                              autoRenewing: true,
                              orderId: 'id0',
                              packageName: 'packageName',
                              productId: 'gold_yearly',
                              purchaseState: 0,
                              purchaseTime: -1,
                              purchaseToken: 'token--',
                          },
                      },
                      sku: 'id0',
                      skuType: 'SUBSCRIPTION',
                  },
                  {
                      inAppDetails: {
                          inAppDataSignature: 'signature==',
                          inAppPurchaseData: {
                              orderId: 'orderId1',
                              packageName: 'packageName',
                              productId: 'premium',
                              purchaseState: 0,
                              purchaseTime: -1,
                              purchaseToken: 'token--',
                          },
                      },
                      sku: 'premium',
                      skuType: 'IN_APP',
                  },
              ],
              packageName: 'packageName',
          },
      ],
      userStorage: '{\"data\":{}}',
      userVerificationStatus: 'VERIFIED',
  },
}

function getEntitlementsFromActionsRequest(request) {
  return request!.user!.packageEntitlements![0].entitlements
}
function setEntitlementsForActionsRequest(request, newEntitlements) {
  request!.user!.packageEntitlements![0].entitlements = newEntitlements
}

const OPTIONS: InitOptions = {
  packageName: 'test-package',
  auth: {},
  keepInConv: true,
  consumableIds: ['premium'],
  skus: {
    SKU_TYPE_IN_APP: ['premium', 'gas'],
    SKU_TYPE_SUBSCRIPTION: ['gold_monthly', 'gold_yearly'],
  },
}

export {
  createMockSku,
  createMockSkuId,
  MockSkuId,
  MockSku,
  PACKAGE_NAME,
  CONV_ID,
  ACCESS_TOKEN,
  actionsRequestAfterPurchase,
  getEntitlementsFromActionsRequest,
  setEntitlementsForActionsRequest,
  OPTIONS,
}
