# Use a base image with Nginx and njs pre-installed
FROM nginx:alpine

# Install any additional dependencies if needed
# RUN apk update && apk add --no-cache ...

# Create a directory for our njs scripts and configuration
RUN mkdir /etc/nginx/njs

RUN mkdir /var/cache/tags
RUN mkdir -p /data/nginx
# make cache folder writable by everyone
RUN chmod 777 /var/cache/tags

# Copy our custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy our njs scripts
COPY njs/ /etc/nginx/njs/

# Expose the port Nginx will listen on
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]