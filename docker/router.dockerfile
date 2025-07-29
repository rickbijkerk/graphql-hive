# syntax=docker/dockerfile:1
FROM scratch AS pkg
FROM scratch AS config

FROM rust:1.85 AS build

# Required by Apollo Router
RUN apt-get update
RUN apt-get -y install npm protobuf-compiler cmake
RUN rm -rf /var/lib/apt/lists/*
RUN update-ca-certificates
RUN rustup component add rustfmt

WORKDIR /usr/src
# Create blank project
RUN USER=root cargo new router

# Copy Cargo files
COPY --from=pkg Cargo.toml /usr/src/router/
COPY --from=config Cargo.lock /usr/src/router/

WORKDIR /usr/src/router
# Get the dependencies cached, so we can use dummy input files so Cargo wont fail
RUN echo 'fn main() { println!(""); }' > ./src/main.rs
RUN echo 'fn main() { println!(""); }' > ./src/lib.rs
RUN cargo build --release

# Copy in the actual source code
COPY --from=pkg src ./src
RUN touch ./src/main.rs
RUN touch ./src/lib.rs

# Real build this time
RUN cargo build --release

# Runtime
FROM debian:12-slim AS runtime

RUN apt-get update
RUN apt-get -y install ca-certificates
RUN rm -rf /var/lib/apt/lists/*

LABEL org.opencontainers.image.title=$IMAGE_TITLE
LABEL org.opencontainers.image.version=$RELEASE
LABEL org.opencontainers.image.description=$IMAGE_DESCRIPTION
LABEL org.opencontainers.image.authors="The Guild"
LABEL org.opencontainers.image.vendor="Kamil Kisiela"
LABEL org.opencontainers.image.url="https://github.com/graphql-hive/console"
LABEL org.opencontainers.image.source="https://github.com/graphql-hive/console"

RUN mkdir -p /dist/config
RUN mkdir /dist/schema

# Copy in the required files from our build image
COPY --from=build --chown=root:root /usr/src/router/target/release/router /dist
COPY --from=pkg router.yaml /dist/config/router.yaml

WORKDIR /dist

ENV APOLLO_ROUTER_CONFIG_PATH="/dist/config/router.yaml"

ENTRYPOINT ["./router"]
