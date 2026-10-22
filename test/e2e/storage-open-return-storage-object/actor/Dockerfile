FROM apify/actor-node:24-beta

# Reject vendor images that still embed a vulnerable Node release.
RUN node -e "const [major, minor, patch] = process.versions.node.split('.').map(Number); if (major !== 24 || minor < 22 || !Number.isInteger(patch) || (minor === 22 && patch < 1)) throw new Error('Node 24.22.1 or later in the 24.x branch is required');"

COPY packages ./packages
COPY package*.json ./

RUN npm --quiet set progress=false \
	&& npm install --only=prod --no-optional --no-audit \
	&& npm update --no-audit \
	&& echo "Installed NPM packages:" \
	&& (npm list --only=prod --no-optional --all || true) \
	&& echo "Node.js version:" \
	&& node --version \
	&& echo "NPM version:" \
	&& npm --version

COPY . ./
