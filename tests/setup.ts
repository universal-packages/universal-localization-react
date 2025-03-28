// node > 19 has some issues with fetch closing sockets on consecutive requests
if (process.env.CI || process.versions.node.startsWith('20')) {
  jest.retryTimes(10)
  jest.setTimeout(10000)
}

// Import testing-library
import '@testing-library/jest-dom'

// Reset modules between tests to ensure a clean state for locale-related tests
beforeEach(() => {
  jest.resetModules()
})
