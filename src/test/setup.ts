import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend expect com matchers do jest-dom
expect.extend(matchers)

afterEach(() => {
  cleanup()
})
