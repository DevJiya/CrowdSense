# Use the official Nginx image as a base
FROM nginx:alpine

# Copy the static HTML, CSS, and JS files to the Nginx html directory
COPY . /usr/share/nginx/html

# Expose port 80 for Cloud Run
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
