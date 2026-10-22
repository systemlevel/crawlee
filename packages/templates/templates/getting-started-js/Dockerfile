# Specify the base Docker image. You can read more about
# the available images at https://crawlee.dev/docs/guides/docker-images
# You can also use any other image from Docker Hub.
FROM apify/actor-node-playwright-chrome:24-1.58.2

# Reject vendor images that still embed a vulnerable Node release.
RUN node -e "const [major, minor, patch] = process.versions.node.split('.').map(Number); if (major !== 24 || minor < 22 || !Number.isInteger(patch) || (minor === 22 && patch < 1)) throw new Error('Node 24.22.1 or later in the 24.x branch is required');"

# Copy just package.json and package-lock.json
# to speed up the build using Docker layer cache.
COPY --chown=myuser package*.json ./

# Install NPM packages, skip development dependencies to
# keep the image small. Avoid logging too much and print the dependency
# tree for debugging
RUN npm --quiet set progress=false \
    && npm install --omit=dev \
    && echo "Installed NPM packages:" \
    && (npm list --omit=dev --all || true) \
    && echo "Node.js version:" \
    && node --version \
    && echo "NPM version:" \
    && npm --version

# Next, copy the remaining files and directories with the source code.
# Since we do this after NPM install, quick build will be really fast
# for most source file changes.
COPY --chown=myuser . ./


# Run the image.
CMD npm start --silent
