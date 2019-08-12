
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

import {auth} from 'google-auth-library'

/**
 * Factory funciton to return an access token based on the authentication info
 * provded by the caller. This can either be an access token itself, a service account object
 * or nothing, which will default to Google Application Credentials lookup.
 *
 * @param {string | object | undefined} auth
 */
async function getAccessToken(auth?: string | object): Promise<string> {
  if (!auth) {
    return (await getJwtTokens()).access_token // look for in Google Application Credentials.
  } else if (typeof auth === 'string') {
    return auth
  } else {
    return (await getJwtTokens(auth)).access_token
  }
}

/**
 * Utility function to return authentication tokens from JWT.
 * @return {Promise<Object>} promise that resolves to credentials.
 */
const getJwtTokens = async (serviceAccount?: object) => {
  if (!serviceAccount) {
    const keysEnvVar = process.env['GOOGLE_APPLICATION_CREDENTIALS']
    if (!keysEnvVar) {
      throw new Error('The $GOOGLE_APPLICATION_CREDENTIALS environment variable was not found')
    }
    serviceAccount = JSON.parse(keysEnvVar)
  }
  // tslint:disable-next-line no-any
  const client = auth.fromJSON(serviceAccount!) as any
  client.scopes = ['https://www.googleapis.com/auth/actions.purchases.digital']
  return await client.authorize()
}

export { getAccessToken }
