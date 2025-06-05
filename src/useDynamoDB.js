// src/composables/useDynamoDB.js
import { ref } from 'vue'
import { Auth } from '@aws-amplify/auth'
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'

const items = ref([])
const fetchError = ref('')
const itemsFetched = ref(false)

/**
 * fetchItems(startTs: string, endTs: string) →
 *    1) Reads the currently authenticated Cognito user to use as partition key.
 *    2) Converts those credentials into AWS creds (via Auth.currentCredentials()).
 *    3) Queries the 'postData' table where:
 *         • partitionKey = username
 *         • uStopTime BETWEEN startTs AND endTs
 *    4) Unmarshalls and places results into `items`.
 */
async function fetchItems(startTs, endTs) {
  fetchError.value = ''
  items.value = []
  itemsFetched.value = false

  try {
    // 1) Who is logged in?
    const currentUser = await Auth.currentAuthenticatedUser()
    const username = currentUser.username // this becomes our "customerName" in DynamoDB

    // 2) Get AWS credentials from Cognito Identity Pool
    const credentials = await Auth.currentCredentials()
    const client = new DynamoDBClient({
      region: 'us-east-2',
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
      },
    })

    // 3) Build the QueryCommand
    const queryParams = {
      TableName: 'postData',
      KeyConditionExpression:
        'customerName = :customerName AND uStopTime BETWEEN :start AND :end',
      ExpressionAttributeValues: {
        ':customerName': { S: username },
        ':start': { S: startTs },
        ':end': { S: endTs },
      },
      ScanIndexForward: false, // sort descending if you want newest first
    }

    const command = new QueryCommand(queryParams)
    const response = await client.send(command)

    // 4) Unmarshall items if present
    if (response.Items && response.Items.length > 0) {
      items.value = response.Items.map((raw) => unmarshall(raw))
    } else {
      items.value = []
    }
    itemsFetched.value = true
  } catch (err) {
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
