# Prerequisite
docker for the os
## clone the repo
## run `docker-compose up`
### This should start mysql and node container and start setting up data in users table along with streaming
### Run container in detached mode, bash in to the container and play with index.js either from container or local. Db data setup will be lost once mysql container goes down atm. update docker-compose to mount volumes if your local disk has space.
