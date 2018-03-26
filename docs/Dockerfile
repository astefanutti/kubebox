FROM nginx:alpine

ENV LANG C.UTF-8

# Forward request and error logs to Docker log collector
# - Change pid file location & remove nginx user & change port to 8080
# - Modify perms for non-root runtime
RUN ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log && \
    sed -i 's/\/var\/run\/nginx.pid/\/var\/cache\/nginx\/nginx.pid/g' /etc/nginx/nginx.conf && \
    sed -i -e '/user/!b' -e '/nginx/!b' -e '/nginx/d' /etc/nginx/nginx.conf && \
    rm -f /etc/nginx/conf.d/default.conf && \
    chown -R 998 /var/cache/nginx /etc/nginx && \
    chmod -R 777 /var/cache/nginx /etc/nginx

USER 998

WORKDIR /kubebox

# Client
COPY libs /usr/share/nginx/html/libs/
COPY fonts /usr/share/nginx/html/fonts/
COPY index.html kubebox.js /usr/share/nginx/html/

# Server
COPY nginx.conf /etc/nginx/conf.d

EXPOSE 8080