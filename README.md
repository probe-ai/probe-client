<p align="center">
  <a href="https://imgbb.com/"><img src="https://i.ibb.co/VBhDKrt/logo.png" alt="logo" width="200" border="0" /></a>
</p>

## Description

probe.ai docker client to run in your own environment.

## Quick Links

- [Setup BigQuery Connection](#setup-bigquery-connection)
- [Setup Snowflake Connection](#setup-snowflake-connection)
- [Setup Postgres Connection](#setup-postgres-connection)
- [Running the app](#running-the-app)
- [Updating the app](#updating-the-app)

## Setup BigQuery Connection

1. Download bigquery project config json file from google console. [Steps here](https://www.metabase.com/docs/latest/databases/connections/bigquery)

2. Rename json file to `bigquery.json` and paste it on the project root

3. Create new file in project root `.env`

4. Copy content of `.env.sample` and update bigquery config accordingly

Here's an example of bigquery values needed in the .env file that you can find on your bigquery project:

![dddl](https://user-images.githubusercontent.com/30016913/219969360-1f7039b5-5b6e-483b-ac11-0e484bb20487.png)

## Setup Snowflake Connection

1. Create new file in project root `.env`

2. Copy content of `.env.sample` and update snowflake config accordingly

3, Here;s an example of Snowflake values needed in the .env file that you can find on your Snowflake app:

- `SNOWFLAKE_ACCOUNT`
 <img width="828" alt="image" src="https://user-images.githubusercontent.com/70322519/222150606-320403c9-37ce-4a0d-9abc-bf7589c7d603.png">


- `SNOWFLAKE_WAREHOUSE`
  Get it from Admin Panel under `Admin > Warehouses`.

- For other variables

<img width="1438" alt="image" src="https://user-images.githubusercontent.com/70322519/221109324-03005acc-a332-4456-85f4-dfd99274a1f6.png">

Notes:

- Make sure to add network policy to allow access to snowflake from your local machine

  - You can do this by adding a new network policy in the snowflake console, under `Admin > Security `. [Read more](https://docs.snowflake.com/en/user-guide/network-policies)

- After starting the app, wait for connection to be established before running any queries.
  - You can check the status of connection in logs

## Setup Postgres Connection

1. Create new file in project root `.env`

2. Copy content of `.env.sample` and update postgres config accordingly

## Running the app

```bash
$ chmod +x reload.sh

$ ./reload.sh
```

## Updating the app

```bash
$ ./reload.sh
```
