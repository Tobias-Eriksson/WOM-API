# Set the base image.
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the application source code to the working directory
COPY . .

#Generate prisma schema
RUN npx prisma generate

#Port for api
EXPOSE 3070

CMD ["npm", "run", "dev"]