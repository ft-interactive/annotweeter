## Thanks to Sebp for his excellent "ELK" base image.
FROM sebp/elk

## Copy Logstash config files
COPY 03-twitter.conf /etc/logstash/conf.d/03-twitter.conf

## Remove old Logstash configs
RUN rm /etc/logstash/conf.d/11-nginx.conf
RUN rm /etc/logstash/conf.d/02-beats-input.conf
RUN rm /etc/logstash/conf.d/30-output.conf

## Install NodeJS
RUN apt-get update
RUN apt-get install nodejs npm -y
RUN npm install -g n
RUN n latest

## Copy and run database seeder script
COPY seed_db.js /root/seed_db.js
COPY package.json /root/package.json
RUN npm --prefix /root install /root
#RUN node --harmony /root/seed_db.js
