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

// JS-style import to allow for easier stubbing of
// module functions.
const {auth} = require('google-auth-library')
import {getAccessToken} from './../src/auth'
import test from 'ava'
import * as sinon from 'sinon'

test.beforeEach(t => {
  if (auth.fromJSON.restore) {
    auth.fromJSON.restore()
  }
})

test.serial(`Make sure getAccessToken returns access token if an argument is a string`, async t => {
  const token = await getAccessToken('test-token')
  t.is(token, 'test-token')
})

test.serial(`Make sure getAccessToken returns access token if an argument
 is an object`, async t => {
  sinon.stub(auth, 'fromJSON').callsFake(
    (serviceAccount) => {
      // tslint:disable-next-line
      return {'authorize': () => {
        return new Promise((resolve, reject) => resolve({access_token: 'test_token'}))
      }}
    },
  )
  t.is(await getAccessToken({}), 'test_token')
})

test.serial(`Make sure getAccessToken attempts to to read Google Application Credentials
 env variable`, async t => {
    await t.throwsAsync(async () => {
      await getAccessToken()
    })
})
