FROM nginx:1.27.0

RUN apt-get update && apt-get install -y openssl

RUN rm /etc/nginx/conf.d/default.conf

RUN mkdir -p /etc/nginx/sites-enabled

COPY localhost.conf /etc/nginx/sites-enabled/
COPY nginx.conf /etc/nginx/nginx.conf

COPY ssl /etc/nginx/ssl

RUN mkdir -p /nginx
WORKDIR /nginx

COPY static /nginx/static
COPY template /nginx/template

CMD ["nginx", "-g", "daemon off;"]
