// src/useDynamoDB.js
import { ref } from 'vue'
import { Auth } from '@aws-amplify/auth'
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'

const items = ref([])
const fetchError = ref('')
const itemsFetched = ref(false)

async function fetchItems(customerName, skLow, skHigh) {
  fetchError.value = ''
  itemsFetched.value = false
  items.value = []

  try {
    const credentials = await Auth.currentCredentials()
    const dbClient = new DynamoDBClient({
      region: 'us-east-2',
      credentials: Auth.essentialCredentials(credentials),
    })

    const params = {
      TableName: 'postData',
      KeyConditionExpression: '#pk = :pkVal AND #sk BETWEEN :low AND :high',
      ExpressionAttributeNames: { '#pk': 'customerName', '#sk': 'uStopTime' },
      ExpressionAttributeValues: {
        ':pkVal': { S: customerName },
        ':low': { S: skLow.toString() },
        ':high': { S: skHigh.toString() },
      },
    }

    const command = new QueryCommand(params)
    const response = await dbClient.send(command)

    if (response.Items && response.Items.length) {
      items.value = response.Items.map((raw) => unmarshall(raw))
    } else {
      items.value = []
    }
    itemsFetched.value = true
  } catch (err) {
    fetchError.value = err.message || 'Error querying items'
    items.value = []
    itemsFetched.value = true
  }
}

export function useDynamoDB() {
  return { items, fetchError, itemsFetched, fetchItems }
}
