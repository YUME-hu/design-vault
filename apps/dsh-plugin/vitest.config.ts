import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    // client.test.ts 因 undici 8.12.3 + Node 24 worker 的 zstd 兼容性问题临时排除，
    // 待 client UI 开发阶段重新引入。
    exclude: ['tests/client.test.ts']
  }
})
