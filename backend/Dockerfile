FROM oven/bun:1.2-alpine

WORKDIR /app

COPY package.json ./

RUN bun install --frozen-lockfile || bun install

COPY . .

EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]
