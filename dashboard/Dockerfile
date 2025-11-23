# Copyright 2018-2024 the Kubeapps contributors.
# SPDX-License-Identifier: Apache-2.0

FROM oven/bun:1.1.45 AS build
WORKDIR /app

COPY package.json bun.lockb /app/
RUN bun install --frozen-lockfile

RUN mkdir /app/src
COPY . /app
RUN bun run prettier-check && bun run ts-compile-check
RUN bun run build

FROM bitnami/nginx:1.27.2
COPY --from=build /app/build /app
