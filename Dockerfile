# Use centos 6 as the base OS

FROM centos:centos6
MAINTAINER willcmcc

# Install all the things
RUN     yum install -y epel-release git tar which wget python27 unzip curl

# Install node
RUN     yum install -y nodejs npm --enablerepo=epel

# Install forever
RUN     npm install -g forever

RUN     yum install mongodb-server -y; \
        yum install -y gcc-c++ openssl-devel; \
        npm install -g node-gyp


# Make sure we get tubitv into the right place
ADD     .   /home/nodesquids


# Expose port 80 for prod traffic
EXPOSE  80


# Entrypoint runs nginx as a service and node/forever as the primary process
CMD     service mongod start; \
        cd /home/nodesquids ; \
        npm install ; \
        cd public ; \
        cd /home/nodesquids ; \
        forever -o /dev/null --minUptime 1000 --spinSleepTime 1000 index.js


