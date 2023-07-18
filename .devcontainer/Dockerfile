FROM ubuntu:focal

# Set the working directory in the container
WORKDIR /workspaces/beyond

ENV LANG="C.UTF-8"

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get upgrade -y \
    && apt-get install git curl apt-transport-https ca-certificates gnupg -y \
    && apt-get clean -y

RUN curl -sL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add -
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash - 


RUN echo "deb https://deb.nodesource.com/node_18.x buster main" > /etc/apt/sources.list.d/nodesource.list \
    && echo "deb-src https://deb.nodesource.com/node_18.x buster main" >> /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get clean -y

RUN apt-get install nodejs -y

# Restore man command
RUN yes | unminimize 2>&1
