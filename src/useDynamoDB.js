// src/useDynamoDB.js
import { ref } from 'vue'
import { Auth } from '@aws-amplify/auth'
import {
  DynamoDBClient,
  GetItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'

const items = ref([])
const fetchError = ref('')
const itemsFetched = ref(false)

async function fetchItems(startTs, endTs) {
  // Reset state
  items.value = []
  fetchError.value = ''
  itemsFetched.value = false

  try {
    // 1) Get Cognito user & lowercase it
    const currentUser = await Auth.currentAuthenticatedUser()
    const cognitoUsername = currentUser.username // e.g. "jrlawnsnow"
    const userNameLower = cognitoUsername.toLowerCase() // → "jrlawnsnow"
    console.log('[useDynamoDB] Cognito username      =', cognitoUsername)
    console.log('[useDynamoDB] Derived userNameLower =', userNameLower)

    // 2) Build a DynamoDBClient with your Amplify credentials
    const credentials = await Auth.currentCredentials()
    const client = new DynamoDBClient({
      region: 'us-east-2',
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
      },
    })

    // 3) Get the mixed-case key from the lookup table
    const lookupParams = {
      TableName: 'nameLookUp', // ← must exactly match the table name in the console
      Key: {
        userNameLower: { S: userNameLower },
      },
    }
    const lookupCommand = new GetItemCommand(lookupParams)
    const lookupResult = await client.send(lookupCommand)

    if (!lookupResult.Item || !lookupResult.Item.userNameMixed) {
      throw new Error(
        `No entry in UserLookup for userNameLower="${userNameLower}"`
      )
    }
    const userNameMixed = lookupResult.Item.userNameMixed.S // e.g. "JRLawnSnow"
    console.log('[useDynamoDB] userNameMixed (from lookup) =', userNameMixed)

    // 4) Query postData with that mixed-case key
    const queryParams = {
      TableName: 'postData', // ← also confirm "postData" exactly matches your main table’s name
      KeyConditionExpression:
        'customerName = :cn AND uStopTime BETWEEN :start AND :end',
      ExpressionAttributeValues: {
        ':cn': { S: userNameMixed },
        ':start': { S: startTs },
        ':end': { S: endTs },
      },
      ScanIndexForward: false,
    }
    console.log(
      '[useDynamoDB] querying postData with params:',
      JSON.stringify(queryParams, null, 2)
    )
    const queryCommand = new QueryCommand(queryParams)
    const response = await client.send(queryCommand)

    // 5) Unmarshall results
    if (response.Items && response.Items.length > 0) {
      items.value = response.Items.map((raw) => unmarshall(raw))
      console.log(
        `[useDynamoDB] postData query returned ${items.value.length} items`
      )
    } else {
      items.value = []
      console.log('[useDynamoDB] postData query returned ZERO items')
    }
    itemsFetched.value = true
  } catch (err) {
    console.error('[useDynamoDB] error fetching items:', err)
    fetchError.value = err.message || 'Error fetching items'
    itemsFetched.value = true
  }
}

export function useDynamoDB() {
  return {
    items,
    fetchError,
    itemsFetched,
    fetchItems,
  }
}
