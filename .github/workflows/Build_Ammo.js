name: Build Ammo.js with ALLOW_MEMORY_GROWTH=1

on:
  workflow_dispatch:      # 手动触发（推荐）
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    container:
      image: emscripten/emsdk:latest   # 官方镜像，带 emcc + cmake

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: 安装额外依赖（匹配官方 Dockerfile）
        run: |
          apt-get update -y
          apt-get install -y --no-install-recommends \
            cmake python3 \
            libgeos-dev ed automake autoconf libtool

      - name: 配置 + 编译（启用内存自动增长）
        run: |
          rm -rf builds
          cmake -B builds \
            -DALLOW_MEMORY_GROWTH=1 \
            -DTOTAL_MEMORY=134217728 \     # 初始堆 128MB（够用就行，不够自动增长）
            # -DCLOSURE=1 \               # 可选：加这行会让最终 JS 更小，但构建稍慢
          cmake --build builds -j$(nproc)

      - name: 上传构建产物
        uses: actions/upload-artifact@v4
        with:
          name: ammo-with-allow-memory-growth
          path: builds/
          retention-days: 30
