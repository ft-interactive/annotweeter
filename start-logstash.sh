#!/bin/bash

## Check Slack plugin is installed; if not, install.
logstash/bin/logstash-plugin list | grep -q "logstash-output-slack"
if [[ $? -ne 0 ]]
then
  logstash/bin/logstash-plugin install logstash-output-slack
fi

## Start Logstash
logstash/bin/logstash -f logstash.conf
