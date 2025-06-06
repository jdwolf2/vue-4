import { createApp } from 'vue'
import App from './App.vue'
// main.js
import '@syncfusion/ej2-base/styles/material.css'
import '@syncfusion/ej2-vue-grids/styles/material.css'
import { registerLicense } from '@syncfusion/ej2-base'
registerLicense(
  'Ngo9BigBOggjHTQxAR8/V1NMaF5cXmRCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdmWX5ednVdRmNcUUJ+Wko='
)

createApp(App).mount('#app')
