#!/bin/bash
# Script de despliegue para OPTIAUTO en VPS

set -e  # Salir si hay algún error

echo "========================================="
echo "  OPTIAUTO - Script de Despliegue"
echo "========================================="

# Variables de configuración
APP_DIR="/var/www/optiauto"
POCKETBASE_DIR="/opt/pocketbase"
POCKETBASE_VERSION="0.22.0"  # Actualizar a la última versión
DOMAIN="optiauto.agarnet.duckdns.org"

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que se está ejecutando como root o con sudo
if [ "$EUID" -ne 0 ]; then
    print_error "Por favor ejecuta este script como root o con sudo"
    exit 1
fi

# 1. Actualizar sistema
print_message "Actualizando sistema..."
apt update && apt upgrade -y

# 2. Instalar dependencias necesarias
print_message "Instalando dependencias..."
apt install -y git curl wget unzip nginx certbot python3-certbot-nginx

# 3. Crear directorios
print_message "Creando directorios..."
mkdir -p $APP_DIR
mkdir -p $POCKETBASE_DIR

# 4. Clonar repositorio (si no existe)
if [ ! -d "$APP_DIR/.git" ]; then
    print_message "Clonando repositorio..."
    git clone https://github.com/albertocfa23-prog/optiautov2.git $APP_DIR
else
    print_message "Actualizando repositorio..."
    cd $APP_DIR
    git pull origin main
fi

# 5. Descargar PocketBase (si no existe)
if [ ! -f "$POCKETBASE_DIR/pocketbase" ]; then
    print_message "Descargando PocketBase..."
    cd $POCKETBASE_DIR
    wget "https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/pocketbase_${POCKETBASE_VERSION}_linux_amd64.zip"
    unzip "pocketbase_${POCKETBASE_VERSION}_linux_amd64.zip"
    chmod +x pocketbase
    rm "pocketbase_${POCKETBASE_VERSION}_linux_amd64.zip"
else
    print_message "PocketBase ya está instalado"
fi

# 6. Configurar permisos
print_message "Configurando permisos..."
chown -R www-data:www-data $APP_DIR
chmod -R 755 $APP_DIR

# 7. Crear servicio systemd para PocketBase
print_message "Creando servicio systemd para PocketBase..."
cat > /etc/systemd/system/pocketbase.service <<EOF
[Unit]
Description=PocketBase Service
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=$POCKETBASE_DIR
ExecStart=$POCKETBASE_DIR/pocketbase serve --http=127.0.0.1:8090
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# 8. Recargar systemd y habilitar servicio
print_message "Habilitando servicio PocketBase..."
systemctl daemon-reload
systemctl enable pocketbase
systemctl restart pocketbase

# 9. Verificar que PocketBase está corriendo
sleep 2
if systemctl is-active --quiet pocketbase; then
    print_message "PocketBase está corriendo correctamente"
else
    print_error "Error al iniciar PocketBase"
    systemctl status pocketbase
    exit 1
fi

# 10. Configurar Nginx
print_message "Configurando Nginx..."
cat > /etc/nginx/sites-available/optiauto <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    # Redirigir HTTP a HTTPS (se activará después de obtener el certificado)
    # return 301 https://\$server_name\$request_uri;

    # Root del frontend
    root $APP_DIR/public;
    index index.html;

    # Logs
    access_log /var/log/nginx/optiauto_access.log;
    error_log /var/log/nginx/optiauto_error.log;

    # Frontend estático
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # PocketBase Admin UI - TODO lo que empiece con /_/
    location ~ ^/_/ {
        proxy_pass http://127.0.0.1:8090;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass \$http_upgrade;
    }

    # PocketBase API
    location /api/ {
        proxy_pass http://127.0.0.1:8090/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass \$http_upgrade;
    }

    # Tamaño máximo de archivos (para subir imágenes)
    client_max_body_size 10M;
}
EOF

# 11. Habilitar sitio en Nginx
print_message "Habilitando sitio en Nginx..."
ln -sf /etc/nginx/sites-available/optiauto /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default  # Eliminar sitio por defecto

# 12. Verificar configuración de Nginx
print_message "Verificando configuración de Nginx..."
nginx -t

# 13. Reiniciar Nginx
print_message "Reiniciando Nginx..."
systemctl restart nginx

# 14. Obtener certificado SSL (comentado para primera ejecución)
print_warning "Para obtener el certificado SSL, ejecuta:"
print_warning "sudo certbot --nginx -d $DOMAIN"

echo ""
print_message "========================================="
print_message "  Despliegue completado exitosamente!"
print_message "========================================="
echo ""
print_message "Próximos pasos:"
echo "  1. Accede a http://$DOMAIN/_/ para configurar PocketBase"
echo "  2. Crea las colecciones según SETUP.md"
echo "  3. Ejecuta: sudo certbot --nginx -d $DOMAIN"
echo "  4. Accede a https://$DOMAIN"
echo ""
print_message "Comandos útiles:"
echo "  - Ver logs de PocketBase: sudo journalctl -u pocketbase -f"
echo "  - Reiniciar PocketBase: sudo systemctl restart pocketbase"
echo "  - Ver estado: sudo systemctl status pocketbase"
echo ""
