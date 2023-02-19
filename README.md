<p align="center">
  <a href="https://imgbb.com/"><img src="https://i.ibb.co/VBhDKrt/logo.png" alt="logo" width="200" border="0" /></a>
</p>

## Description

probe.ai docker client to run in your own environment.

## Setup BigQuery Connection

1. Download bigquery project config json file from google console. [Steps here](https://www.metabase.com/docs/latest/databases/connections/bigquery)

2. Rename json file to `bigquery.json` and paste it on the project root

3. Create new file in project root `.env`

4. Copy content of `.env.sample` and update bigquery config accordingly

Here's an example of bigquery values needed in the .env file that you can find on your bigquery project
<img width="793" alt="probe-ai" src="https://user-images.githubusercontent.com/30016913/219969290-ccf8a96f-e4e2-4b4c-80f5-9ff81ed8531c.png">

## Running the app

```bash
$ chmod +x reload.sh

$ ./reload.sh
```

## Updating the app

```bash
$ ./reload.sh
```
