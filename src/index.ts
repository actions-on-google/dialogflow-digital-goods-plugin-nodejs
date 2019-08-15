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

import { Plugin, DialogflowApp, Contexts, DialogflowConversation } from 'actions-on-google'
import { DigitalGoodsPlugin, InitOptions } from './digital-goods-plugin'

// Type describing augmentations for DialogflowConversation
export interface DigitalGoodsHelperConversation extends DialogflowConversation {
  digitalGoods: DigitalGoodsPlugin
}

// Main import of the plugin
export const digitalGoodsHelper = (options: InitOptions): Plugin<
  DialogflowApp<{}, {}, Contexts, DialogflowConversation<{}, {}>>,
  {}> => {
  return (app) => {
    app.middleware(conv => {
      const digitalGoods = new DigitalGoodsPlugin(options, conv)
      return Object.assign(conv, { digitalGoods } as DigitalGoodsHelperConversation)
    })
    return app
  }
}
