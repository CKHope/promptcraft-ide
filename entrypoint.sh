#!/bin/sh

# Create a config file from environment variables
cat <<EOF > /usr/share/nginx/html/config.json
{
  "VITE_SUPABASE_URL": "${VITE_SUPABASE_URL}",
  "VITE_SUPABASE_ANON_KEY": "${VITE_SUPABASE_ANON_KEY}"
}
EOF

# Start Nginx
exec nginx -g 'daemon off;'