FROM alpine:3.7 as builder

RUN apk update
RUN apk add make openssl-dev pcre-dev zlib-dev wget tar build-base ca-certificates gettext
RUN wget -O njs.tar.gz https://hg.nginx.org/njs/archive/0.1.15.tar.gz && \
    wget -O nginx.tar.gz https://nginx.org/download/nginx-1.13.10.tar.gz && \
    tar xzvf njs.tar.gz && \
    tar xzvf nginx.tar.gz && \
    cd nginx-* && ./configure --with-compat --add-dynamic-module=../njs*/nginx && \
    make modules && \
    rm -f ../*.tar.gz

FROM nginx:1.13.10-alpine

ENV LANG C.UTF-8

COPY --from=builder /nginx-1.13.10/objs/ngx_http_js_module.so /etc/nginx/modules/ngx_http_js_module.so

COPY --from=builder /usr/bin/envsubst /usr/bin/envsubst

# Forward request and error logs to Docker log collector
# - Change pid file location and remove nginx user
# - Modify perms for non-root runtime
RUN ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log && \
    sed -i 's/\/var\/run\/nginx.pid/\/var\/cache\/nginx\/nginx.pid/g' /etc/nginx/nginx.conf && \
    sed -i -e '/user/!b' -e '/nginx/!b' -e '/nginx/d' /etc/nginx/nginx.conf && \
    echo -e "load_module modules/ngx_http_js_module.so;\n$(cat /etc/nginx/nginx.conf)" > /etc/nginx/nginx.conf && \
    rm -f /etc/nginx/conf.d/default.conf && \
    chown -R 998 /var/cache/nginx /etc/nginx && \
    chmod -R 777 /var/cache/nginx /etc/nginx

WORKDIR /kubebox

# Client
COPY libs /usr/share/nginx/html/libs/
COPY fonts /usr/share/nginx/html/fonts/
COPY index.html kubebox.js /usr/share/nginx/html/

# Server
COPY nginx.conf /etc/nginx/conf.d/
COPY nginx.sh ./
COPY nginx.js ./nginx.tpl.js

RUN touch nginx.js && \
    chown 998 nginx.js && chmod 777 nginx.js && \
    ln -sf /kubebox/nginx.js /etc/nginx/conf.d/nginx.js

EXPOSE 8080
USER 998
ENV KUBEBOX_USE_SA_TOKEN=true

CMD ["./nginx.sh"]