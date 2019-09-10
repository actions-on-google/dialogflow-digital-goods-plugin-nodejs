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
  DialogflowConversation,
  GoogleActionsV2Entitlement,
  CompletePurchase,
} from 'actions-on-google'
import { getSkus, consume } from './digital-goods-service-api'
import { getAccessToken } from './auth'

/** @public */
export type SkuDetails =  {
  'SKU_TYPE_IN_APP'?: string[],
  'SKU_TYPE_SUBSCRIPTION'?: string[],
}

/** @public */
export interface InitOptions {
  /**
   * Package corresponding to an Android app
   * @public
   */
  packageName: string,
  /**
   * Optional auth info. 3 cases possible:
   * 1. an access token
   * 2. a service account object
   * 3. nothing, which will indicate plugin to look for Google Application Credentials
   * @public
   */
  auth?: string | object,
  /**
   * Optional flag to indicate whether to store skus in conv.data; by default this is set to true.
   * @public
   */
  keepInConv?: boolean,
  /**
   * Optional array of ids corresponding to consumable items in your app.
   * If nothing is passed, then plugin assumes an empty list.
   * @public
   */
   consumableIds?: string[],
  /**
   * An object containing Sku ids indexed by a Sku type.
   * @public
   */
  skus: SkuDetails
}

export class DigitalGoodsPlugin {
  conv: DialogflowConversation
  options: InitOptions

  constructor(options: InitOptions, conv: DialogflowConversation) {
    this.conv = conv
    this.options = options
  }
  // Public API
  /**
   * Fetches available Skus for the given play project.
   * @return {object<string, Sku>} object of SKUs
   */
  async getSkus(): Promise<{[s:string]: object}> {
    const accessToken = await getAccessToken(this.options.auth)
    const convToken = this.conv.request!.conversation!.conversationId!
    const skus = await getSkus(convToken, accessToken, this.options.packageName, this.options.skus)
    if (this.options.keepInConv) {
      this.conv.data.skus = Object.assign({}, skus)
    }
    return skus
  }
  /**
   * Checks whether developer has purchased a sku with a skuId.
   * @param {string} skuId
   * @return {boolean} true if already purchased a sku
   */
  skuPurchased(skuId: string): boolean {
    return this.getEntitlementForSelectedSku(skuId) !== null
  }
  /**
   * Consumes a Sku corresponding to a given sku id.
   * @param {string} skuId
   * @return {object} consume API response
   */
  async consumeSku(skuId?: string): Promise<object> {
    if (!skuId && !this.conv.data.lastPurchasedSkuId) {
      throw new Error(`skuId is not passed, and lastPurchasedSkuId is not in conv.data.
      You must either pass skuId as an argument, or use purchaseSku method.`)
    }
    skuId = skuId ? skuId : this.conv.data.lastPurchasedSkuId
    const accessToken = await getAccessToken(this.options.auth)
    const entitlementForSelectedSKU = this.getEntitlementForSelectedSku(skuId!)
    const convToken = this.conv.request!.conversation!.conversationId!
    return consume(
      convToken,
      accessToken,
      // this silence is safe because consumeSku should be called after canConsumeSku which will
      // guarantee that those properties are present.
      entitlementForSelectedSKU!.inAppDetails!.inAppPurchaseData!.purchaseToken)
  }
  /**
   * Checks whether developer can consume a sku given by a sku id.
   * @param {string} skuId
   * @return {boolean} true if can consume a sku
   */
  canConsumeSku(skuId?: string): boolean {
    if (!skuId && !this.conv.data.lastPurchasedSkuId) {
      throw new Error(`skuId is not passed, and lastPurchasedSkuId is not in conv.data.
      You must either pass skuId as an argument, or use purchaseSku method.`)
    }
    skuId = skuId ? skuId : this.conv.data.lastPurchasedSkuId
    const entitlementForSelectedSKU = this.getEntitlementForSelectedSku(skuId!)
    // Selected sku is in our list of consumables and user already
    // purchased the item.
    return (this.options.consumableIds !== undefined
      && this.options.consumableIds.indexOf(skuId!) !== -1)
      && entitlementForSelectedSKU !== null
  }
  /**
   * Starts the purchase sku flow.
   * @param {string} skuId
   */
  purchaseSku(skuId: string) {
    if (!('skus' in this.conv.data)) {
      throw new Error(`"skus" is not in conv.data.
       You must set keepInConv to true and use getSkus before calling this method.`)
    }
    if (this.options.keepInConv) {
      this.conv.data.lastPurchasedSkuId = skuId
    }
    this.conv.ask(new CompletePurchase({
      skuId: this.conv.data.skus[skuId].skuId,
    }))
  }
  // Private
  /**
   * Helper function that will search for a entitlement corresponding to a sku id.
   * @param {string} skuId
   * @return {object | null} an entitlement
   */
  private getEntitlementForSelectedSku(skuId: string): GoogleActionsV2Entitlement | null {
    for (const entitlemenGroup of this.conv.user.entitlements) {
      for (const entitlement of entitlemenGroup.entitlements!) {
        if (entitlement.sku === skuId) {
          return entitlement
        }
      }
    }
    return null
  }
}
