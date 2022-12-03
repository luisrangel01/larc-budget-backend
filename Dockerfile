# Base image
FROM node:18

ENV TEST_VALUE=helloworldfromdevTATATA \
    PORT=3002 \
    DB_HOST=192.168.86.122 \
    DB_PORT=5432 \
    DB_USERNAME=postgres \
    DB_PASSWORD=postres \
    DB_DATABASE=larc-budget-management \
    JWT_SECRET_EXPIRES_IN=36000 \
    JWT_SECRET=qqL0^kBBo6y%pfEBf9E*!DhtwV47UK

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN npm run build

# Start the server using the production build
CMD [ "node", "dist/main.js" ]
