import '@testing-library/jest-dom'

import { setupIonicReact } from '@ionic/react'
setupIonicReact()

// Mock matchmedia
window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    }
  }
