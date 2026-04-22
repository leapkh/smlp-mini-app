<script setup>
import { onMounted } from 'vue'
import { callHandler, registerHandler } from 'web-bridge-gateway'

onMounted(async () => {
  try {
    const result = await callHandler('setBarTitle', {
      title: 'ABA Mini App',
    })
    console.log('setBarTitle result:', result)
  } catch (error) {
    console.error('setBarTitle failed:', error)
  }
})

// optional example listener
registerHandler('handlerName', (data, callback) => {
  console.log('received from native:', data)

  if (callback) {
    callback({
      success: true,
    })
  }
})
</script>

<template>
  <div>
    <h1>ABA Mini App</h1>
    <p>Bridge test loaded.</p>
  </div>
</template>