# Digital Goods API Plugin for Actions on Google Client Library Node.js

This plugin makes it easier to use Digital Goods API by extending the functionality
of the official Actions on Google client library for Node.js. Particularly, it makes
it simple to check for available SKUs and consume them if needed.

Currently, plugin supports only Actions built with Dialogflow.

[![NPM Version](https://img.shields.io/npm/v/actions-on-google.svg)](https://www.npmjs.org/package/actions-on-google-digital-goods-plugin-nodejs)

## Setup Instructions

Install the library with either `npm install actions-on-google-digital-goods-plugin-nodejs` or `yarn add actions-on-google-digital-goods-plugin-nodejs` if you use yarn.

### Usage
```javascript
const { digitalGoodsHelper } = require('actions-on-google-digital-goods-plugin-nodejs')
// user-defined configurations (here only for demonstration purposes)
const { packageName, pathToServiceAccount } = require('./config')
const app = dialogflow({ debug: true }).use(digitalGoodsHelper({
  packageName: packageName,
  auth: require(pathToServiceAccount),
  keepInConv: true,
  consumableIds: ['gas'],
  skus: {
    SKU_TYPE_IN_APP: ['premium', 'gas'],
    SKU_TYPE_SUBSCRIPTION: ['gold_monthly', 'gold_yearly']
  }
}))

app.intent('asking for a purchase', async conv => {
  // skus will be a map of Sku objects indexed by its sku id.
  // they are also get stored as conv.data.skus if keepInConv flag has
  // been set to true during plugin initialization.
  const skus = await conv.digitalGoods.getSkus()
  conv.ask(`Would you like to buy any of: ${Object.keys(skus)}?`)
})

app.intent('initiate the purchase', async (conv, { sku }) => {
  conv.ask('Great! Here you go.');
  conv.digitalGoods.purchaseSku(sku);
});

app.intent('describe purchase status', async conv => {
  const status = conv.arguments.get('COMPLETE_PURCHASE_VALUE');
  if (status === 'PURCHASE_STATUS_OK') {
    // If no arguments supplied to canConsume and consume, they will try to
    // look up in conv.data.purchasedItemSkuId, which is automatically set
    // if using conv.purchaseSku method. Otherwise, you will need to supply
    // the sku id yourself.
    if (conv.digitalGoods.canConsumeSku()) {
      await conv.digitalGoods.consumeSku()
    }
  }
  // check other statuses
})
```

## References & Issues
+ Questions? Go to [StackOverflow](https://stackoverflow.com/questions/tagged/actions-on-google), [Assistant Developer Community on Reddit](https://www.reddit.com/r/GoogleAssistantDev/) or [Support](https://developers.google.com/assistant/support).
+ For bugs, please report an issue on Github.
+ Actions on Google [Documentation](https://developers.google.com/assistant)
+ Actions on Google [Codelabs](https://codelabs.developers.google.com/?cat=Assistant).

## Make Contributions
Please read and follow the steps in the [CONTRIBUTING.md](CONTRIBUTING.md).

## License
See [LICENSE](LICENSE).

## Terms
Your use of this sample is subject to, and by using or downloading the sample files you agree to comply with, the [Google APIs Terms of Service](https://developers.google.com/terms/).
