FROM nginx:alpine

# Copy all files to nginx html directory
COPY . /usr/share/nginx/html/

EXPOSE 8080

# Configure nginx to use port 8080 (Cloud Run requirement)
RUN sed -i 's/listen\s*80;/listen 8080;/g' /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
