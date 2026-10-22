FROM node:24.22.1 AS builder

# Reject vendor images that still embed a vulnerable Node release.
RUN node -e "const [major, minor, patch] = process.versions.node.split('.').map(Number); if (major !== 24 || minor < 22 || !Number.isInteger(patch) || (minor === 22 && patch < 1)) throw new Error('Node 24.22.1 or later in the 24.x branch is required');"

COPY /packages ./packages
COPY /package*.json ./
COPY /tsconfig.json ./
COPY /main.ts ./
RUN npm --quiet set progress=false \
    && npm install --only=prod --no-optional --no-audit \
    && npm update \
    && npm run build

FROM lwthiker/curl-impersonate

COPY --from=builder /usr/local/bin /usr/local/bin
RUN node -e "const [major, minor, patch] = process.versions.node.split('.').map(Number); if (major !== 24 || minor < 22 || !Number.isInteger(patch) || (minor === 22 && patch < 1)) throw new Error('Node 24.22.1 or later in the 24.x branch is required');"
COPY --from=builder /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/npm
COPY --from=builder /node_modules ./node_modules
COPY --from=builder /packages ./packages
COPY --from=builder /package*.json ./
COPY --from=builder /main.js ./
COPY /.actor ./.actor

RUN echo "Installed NPM packages:" \
    && (npm list --only=prod --no-optional --all || true) \
    && echo "Node.js version:" \
    && node --version \
    && echo "NPM version:" \
    && npm --version

# run compiled code
CMD npm run start:prod
