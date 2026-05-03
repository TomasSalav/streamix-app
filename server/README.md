# Streamix API

Backend Flask para plataforma de videos tipo YouTube.

## Instalacion

```bash
pip install -r requirements.txt
```

## Configuracion

Crear `.env` en `server/`:

```
SECRET_KEY=tu-secret-key
DB_USER=usuario
DB_PASSWORD=password
DB_HOST=localhost
DB_NAME=streamix
```

## Ejecutar

```bash
python run.py
```

## Documentacion Swagger

Acceder a: `http://localhost:5050/api/docs/`

## Rutas Principales

- `/api/auth/*` - Autenticacion (signup, login, logout, me)
- `/api/users/*` - CRUD usuarios
- `/api/videos/*` - CRUD videos
- `/api/comments/*` - Comentarios
- `/api/videos/<id>/reactions` - Likes/dislikes
- `/api/users/<id>/subscribe` - Suscripciones
- `/api/videos/<id>/views` - Vistas