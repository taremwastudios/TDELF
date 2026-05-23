FROM nginx:alpine
COPY . /usr/share/nginx/html
COPY templates/default.conf.template /etc/nginx/conf.d/default.conf.template
