FROM nginx:alpine

COPY index.html /usr/share/nginx/html/index.html

EXPOSE 8080

# Configure nginx to use port 8080 (Cloud Run requirement)
RUN sed -i 's/listen\s*80;/listen 8080;/g' /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
