import {
  GoogleActionsTransactionsV3SkuId,
  GoogleTypeMoney,
  GoogleActionsTransactionsV3SkuIdSkuType,
} from 'actions-on-google'

const PACKAGE_NAME = 'test.package.name'
const CONV_ID = '123'
const ACCESS_TOKEN ='abc123'

interface MockSkuInitOptions {
  title?: string,
  description?: string,
  skuId: GoogleActionsTransactionsV3SkuId,
  formattedPrice?: string,
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

export {
  createMockSku,
  createMockSkuId,
  MockSkuId,
  MockSku,
  PACKAGE_NAME,
  CONV_ID,
  ACCESS_TOKEN,
}
