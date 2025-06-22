FROM node:20-slim

# Create a non-root user
RUN apt-get update && apt-get install -y sudo git curl && \
    useradd -m -s /bin/bash coder && \
    echo "coder ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/nopasswd

# Create the directory structure
RUN mkdir -p /home/coder/code-server/lib/vscode

# Copy files with proper directory structure
WORKDIR /home/coder/code-server
COPY package.json npm-shrinkwrap.json postinstall.sh ./
COPY lib/ ./lib/
COPY out/ ./out/
COPY src/ ./src/
COPY ThirdPartyNotices.txt LICENSE README.md ./

# Run npm install at the top level
RUN npm install --unsafe-perm

# Create required directories with proper permissions
RUN mkdir -p /home/coder/.local/share/code-server/coder-logs && \
    mkdir -p /home/coder/.config/code-server && \
    chown -R coder:coder /home/coder/.local && \
    chown -R coder:coder /home/coder/.config && \
    chmod -R 755 /home/coder/.local && \
    chmod -R 755 /home/coder/.config

# Set ownership to the non-root user
RUN chown -R coder:coder /home/coder

# Switch to the non-root user
USER coder

# Create workspace directory
RUN mkdir -p /home/coder/workspace

# Expose the port
EXPOSE 8080

# Set environment variables
ENV AUTH=none
ENV DISABLE_TELEMETRY=1

# Start code-server
CMD ["node", "/home/coder/code-server/out/node/entry.js", "--bind-addr", "0.0.0.0:8080", "--auth", "none"] 