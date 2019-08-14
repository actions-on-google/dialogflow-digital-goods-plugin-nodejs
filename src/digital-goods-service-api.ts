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

// Note: using isomorphic-fetch because it simplifies testing due to fetch-mock
// having an easier setup. Reference: http://www.wheresrhys.co.uk/fetch-mock/#usageglobal-non-global
require('isomorphic-fetch')
import { SkuDetails } from './digital-goods-plugin'

const endpoints = {
  get_skus: (packageName: string) => {
    return `https://actions.googleapis.com/v3/packages/${packageName}/skus:batchGet`
  },
  consume_entitlement: (convId: string) => {
    return `https://actions.googleapis.com/v3/conversations/${convId}/entitlement:consume`
  },
}

/**
 * Gets SKUs from the Play Store.
 * @param {string} conversationId
 * @param {string} accessToken
 * @param {string} packageName
 * @param {Object} skuDetails
 * @return {Object<string, SKU>} array of SKUs -- instead object of SKUs
 */
async function getSkus(conversationId: string, accessToken: string, packageName: string,
  skuDetails: SkuDetails): Promise<{ [s: string]: object; }> {
  const skus = {}
  // eslint-disable-next-line
  for (const skuType in skuDetails) {
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        conversationId,
        skuType,
        ids: [skuDetails[skuType]],
      }),
    }
    const res = await fetch(endpoints['get_skus'](packageName), options)
    const resJson = await res.json()
    for (const sku of resJson.skus) {
      skus[sku.skuId.id] = sku
    }
  }
  return skus
}

/**
 * Calls consume endpoint for the particular Sku as defined by the purchaseToken.
 * @param {string} conversationId
 * @param {string} purchaseToken
 * @return {Object} response from the consume endpoint.
 */
const consume = async (conversationId: string, accessToken: string, purchaseToken: string):
 Promise<object> => {
  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      purchaseToken,
    }),
  }
  const url = endpoints['consume_entitlement'](conversationId)
  const res = await fetch(url, options)
  return await res.json()
}

export {
  getSkus,
  consume,
}
