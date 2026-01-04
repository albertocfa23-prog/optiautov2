# Guía de Despliegue en VPS

Esta guía te ayudará a desplegar OPTIAUTO en tu VPS (Ubuntu/Debian).

## Requisitos Previos

- VPS con Ubuntu 20.04+ o Debian 10+
- Acceso SSH como root o usuario con sudo
- Dominio configurado apuntando a tu VPS (optiauto.agarnet.duckdns.org)
- Al menos 1GB de RAM y 10GB de espacio en disco

## Opción 1: Despliegue Automático (Recomendado)

### Paso 1: Conectarse al VPS

```bash
ssh root@tu-vps-ip
# o
ssh tu-usuario@tu-vps-ip
```

### Paso 2: Descargar y ejecutar el script

```bash
# Descargar el script de despliegue
wget https://raw.githubusercontent.com/albertocfa23-prog/optiautov2/main/deploy.sh

# Dar permisos de ejecución
chmod +x deploy.sh

# Ejecutar como root
sudo bash deploy.sh
```

El script automáticamente:
1. Actualiza el sistema
2. Instala dependencias (Git, Nginx, etc.)
3. Clona el repositorio
4. Descarga PocketBase
5. Configura el servicio systemd
6. Configura Nginx
7. Inicia todos los servicios

### Paso 3: Configurar PocketBase

```bash
# Accede a la interfaz de administración de PocketBase
# http://optiauto.agarnet.duckdns.org/_/

# Sigue las instrucciones de SETUP.md para:
# - Crear cuenta de administrador
# - Crear colección 'vehicles'
# - Configurar campos y reglas de acceso
```

### Paso 4: Obtener Certificado SSL

```bash
sudo certbot --nginx -d optiauto.agarnet.duckdns.org
```

Sigue las instrucciones interactivas de Certbot. El certificado se renovará automáticamente.

### Paso 5: Verificar

Accede a: https://optiauto.agarnet.duckdns.org

## Opción 2: Despliegue Manual

### 1. Actualizar Sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Instalar Dependencias

```bash
sudo apt install -y git curl wget unzip nginx certbot python3-certbot-nginx
```

### 3. Crear Directorios

```bash
sudo mkdir -p /var/www/optiauto
sudo mkdir -p /opt/pocketbase
```

### 4. Clonar Repositorio

```bash
cd /var/www/optiauto
sudo git clone https://github.com/albertocfa23-prog/optiautov2.git .
```

### 5. Descargar PocketBase

```bash
cd /opt/pocketbase
sudo wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_linux_amd64.zip
sudo unzip pocketbase_0.22.0_linux_amd64.zip
sudo chmod +x pocketbase
sudo rm pocketbase_0.22.0_linux_amd64.zip
```

### 6. Crear Servicio Systemd

```bash
sudo nano /etc/systemd/system/pocketbase.service
```

Contenido:

```ini
[Unit]
Description=PocketBase Service
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/opt/pocketbase
ExecStart=/opt/pocketbase/pocketbase serve --http=127.0.0.1:8090
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Habilitar y arrancar:

```bash
sudo systemctl daemon-reload
sudo systemctl enable pocketbase
sudo systemctl start pocketbase
sudo systemctl status pocketbase
```

### 7. Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/optiauto
```

Contenido:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name optiauto.agarnet.duckdns.org;

    root /var/www/optiauto/public;
    index index.html;

    access_log /var/log/nginx/optiauto_access.log;
    error_log /var/log/nginx/optiauto_error.log;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~ ^/_/ {
        proxy_pass http://127.0.0.1:8090;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8090/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }

    client_max_body_size 10M;
}
```

Habilitar sitio:

```bash
sudo ln -s /etc/nginx/sites-available/optiauto /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### 8. Configurar Permisos

```bash
sudo chown -R www-data:www-data /var/www/optiauto
sudo chmod -R 755 /var/www/optiauto
```

### 9. Obtener Certificado SSL

```bash
sudo certbot --nginx -d optiauto.agarnet.duckdns.org
```

## Actualizar la Aplicación

### Actualizar Frontend

```bash
cd /var/www/optiauto
sudo git pull origin main
```

### Actualizar PocketBase (si hay nueva versión)

```bash
cd /opt/pocketbase
sudo systemctl stop pocketbase
sudo wget https://github.com/pocketbase/pocketbase/releases/download/vX.X.X/pocketbase_X.X.X_linux_amd64.zip
sudo unzip -o pocketbase_X.X.X_linux_amd64.zip
sudo rm pocketbase_X.X.X_linux_amd64.zip
sudo systemctl start pocketbase
```

## Comandos Útiles

### PocketBase

```bash
# Ver logs en tiempo real
sudo journalctl -u pocketbase -f

# Ver últimas 100 líneas de logs
sudo journalctl -u pocketbase -n 100

# Reiniciar servicio
sudo systemctl restart pocketbase

# Ver estado
sudo systemctl status pocketbase

# Detener servicio
sudo systemctl stop pocketbase

# Iniciar servicio
sudo systemctl start pocketbase
```

### Nginx

```bash
# Verificar configuración
sudo nginx -t

# Reiniciar
sudo systemctl restart nginx

# Ver logs de acceso
sudo tail -f /var/log/nginx/optiauto_access.log

# Ver logs de errores
sudo tail -f /var/log/nginx/optiauto_error.log
```

### Git

```bash
# Ver estado del repositorio
cd /var/www/optiauto
sudo git status

# Ver últimos commits
sudo git log --oneline -10

# Hacer pull de cambios
sudo git pull origin main
```

## Backup

### Backup de Base de Datos

```bash
# Crear backup
sudo cp -r /opt/pocketbase/pb_data /opt/pocketbase/pb_data_backup_$(date +%Y%m%d_%H%M%S)

# Backup automático (cron diario)
sudo crontab -e
# Agregar:
0 2 * * * cp -r /opt/pocketbase/pb_data /opt/pocketbase/pb_data_backup_$(date +\%Y\%m\%d)
```

### Restaurar Backup

```bash
sudo systemctl stop pocketbase
sudo rm -rf /opt/pocketbase/pb_data
sudo cp -r /opt/pocketbase/pb_data_backup_FECHA /opt/pocketbase/pb_data
sudo chown -R www-data:www-data /opt/pocketbase/pb_data
sudo systemctl start pocketbase
```

## Monitoreo

### Verificar que todo funciona

```bash
# Verificar servicios
sudo systemctl status pocketbase nginx

# Verificar puertos abiertos
sudo ss -tulpn | grep -E ':(80|443|8090)'

# Verificar uso de recursos
htop
# o
top
```

### Logs de Aplicación

```bash
# Ver todos los logs relacionados
sudo journalctl -u pocketbase -u nginx --since "1 hour ago"
```

## Troubleshooting

### PocketBase no inicia

```bash
# Ver logs detallados
sudo journalctl -u pocketbase -n 100 --no-pager

# Verificar permisos
sudo chown -R www-data:www-data /opt/pocketbase

# Iniciar manualmente para ver errores
cd /opt/pocketbase
sudo -u www-data ./pocketbase serve --http=127.0.0.1:8090
```

### Nginx muestra 502 Bad Gateway

```bash
# Verificar que PocketBase esté corriendo
sudo systemctl status pocketbase

# Verificar que escuche en el puerto correcto
sudo ss -tulpn | grep 8090

# Reiniciar ambos servicios
sudo systemctl restart pocketbase nginx
```

### No se pueden subir imágenes

```bash
# Verificar tamaño máximo en Nginx
sudo nano /etc/nginx/sites-available/optiauto
# Buscar: client_max_body_size 10M;

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Error de certificado SSL

```bash
# Renovar certificado
sudo certbot renew

# Forzar renovación
sudo certbot renew --force-renewal
```

## Seguridad

### Firewall (UFW)

```bash
# Habilitar firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Ver estado
sudo ufw status
```

### Fail2Ban (opcional)

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## Estructura de Archivos en VPS

```
/var/www/optiauto/           # Frontend
├── public/
│   ├── index.html
│   ├── styles.css
│   └── js/
├── README.md
└── SETUP.md

/opt/pocketbase/             # Backend
├── pocketbase               # Ejecutable
└── pb_data/                 # Base de datos (se crea automáticamente)
    ├── data.db
    └── storage/             # Imágenes subidas

/etc/nginx/sites-available/  # Configuración Nginx
└── optiauto

/etc/systemd/system/         # Servicio
└── pocketbase.service

/var/log/nginx/              # Logs
├── optiauto_access.log
└── optiauto_error.log
```

## Soporte

Si tienes problemas:
1. Revisa los logs: `sudo journalctl -u pocketbase -f`
2. Verifica la configuración de Nginx: `sudo nginx -t`
3. Consulta la documentación de PocketBase: https://pocketbase.io/docs/

---

**Última actualización**: 2026-01-04
