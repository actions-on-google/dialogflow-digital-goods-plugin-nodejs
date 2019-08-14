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
