FROM nginx:1.27.0

# Install OpenSSL
RUN apt-get update && apt-get install -y openssl

# Remove the default Nginx configuration	
RUN rm /etc/nginx/conf.d/default.conf

# Create the sites-enabled directory (optional, as Nginx should already have it)
RUN mkdir -p /etc/nginx/sites-enabled

# Copy the Nginx configuration file
COPY localhost.conf /etc/nginx/sites-enabled/
COPY nginx.conf /etc/nginx/nginx.conf

# Copy SSL certificates
COPY ssl /etc/nginx/ssl

RUN mkdir -p /nginx
WORKDIR /nginx

COPY static /nginx/static
COPY template /nginx/template

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
