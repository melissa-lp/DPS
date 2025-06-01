# run.py

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt_identity
)

import logging
from sqlalchemy import text
from datetime import datetime, timezone

error_logger = logging.getLogger('error_logger')
error_logger.setLevel(logging.ERROR)

handler = logging.FileHandler('error.log')
handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
error_logger.addHandler(handler)

from datetime import datetime, timezone

from app.config     import Config
from app.extensions import db, migrate, jwt, bcrypt, cors
from app.models     import User, LicenseType, Event, RSVP, Comment

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(app, resources={r"/*": {"origins": "*"}})

    cors.init_app(app)
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)

    @app.route('/auth/register', methods=['POST'])
    def register():
        data = request.get_json() or {}

        username   = data.get('username', '').strip()
        password   = data.get('password', '').strip()
        first_name = data.get('first_name', '').strip()
        last_name  = data.get('last_name', '').strip()
        age        = data.get('age')

        if not username or not password or not first_name or not last_name:
            return jsonify(error="Los campos 'username', 'password', 'first_name' y 'last_name' son obligatorios."), 400

        if User.query.filter_by(username=username).first():
            return jsonify(error="El nombre de usuario ya está en uso."), 409

        try:
            pw_hash = bcrypt.generate_password_hash(password).decode()
        except ValueError:
            return jsonify(error="La contraseña no puede estar vacía."), 400

        user = User(
            username=username,
            password_hash=pw_hash,
            first_name=first_name,
            last_name=last_name,
            age=age if age is not None else None
        )
        db.session.add(user)
        db.session.commit()
        return jsonify(msg="Usuario creado"), 201


    @app.route('/auth/login', methods=['POST'])
    def login():
        data = request.get_json() or {}

        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        if not username or not password:
            return jsonify(error="Los campos 'username' y 'password' son obligatorios."), 400

        user = User.query.filter_by(username=username).first()
        if not user:
            return jsonify(error="Usuario no encontrado"), 404

        if not bcrypt.check_password_hash(user.password_hash, password):
            return jsonify(error="Credenciales inválidas"), 401

        token = create_access_token(identity=str(user.id))
        return jsonify(access_token=token, username=user.username), 200


    @app.route('/me', methods=['GET'])
    @jwt_required()
    def me():
        user_id = get_jwt_identity()
        u = User.query.get(user_id)
        if not u:
            return jsonify(error="Usuario no encontrado"), 404

        return jsonify({
            "id":         u.id,
            "username":   u.username,
            "first_name": u.first_name,
            "last_name":  u.last_name,
            "age":        u.age
        }), 200


    @app.route('/events', methods=['GET'])
    @jwt_required()
    def list_events():
        try:
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            if not user:
                return jsonify(error="Usuario no encontrado"), 404

            events = Event.query.order_by(Event.event_date.asc()).all()

            now = datetime.now(timezone.utc)

            result = []
            for e in events:
                event_data = {
                    "id":           e.id,
                    "creator_id":   e.creator_id,
                    "title":        e.title,
                    "description":  e.description,
                    "event_date":   e.event_date.isoformat(),
                    "location":     e.location,
                    "license_code": e.license_code,
                    "is_past":      e.event_date < now.replace(tzinfo=None)
                }
                result.append(event_data)

            return jsonify(result), 200

        except Exception as ex:
            error_logger.error(f"Error en /events: {str(ex)}", exc_info=True)
            return jsonify(error="Internal server error"), 500


    @app.route('/events', methods=['POST'])
    @jwt_required()
    def create_event():
        user_id = get_jwt_identity()
        data = request.get_json() or {}

        title        = data.get('title', '').strip()
        event_date   = data.get('event_date', '').strip()
        license_code = data.get('license_code', '').strip()

        if not title or not event_date or not license_code:
            return jsonify(error="Los campos 'title', 'event_date' y 'license_code' son obligatorios."), 400

        try:
            ev = Event(
                creator_id=user_id,
                title=title,
                description=data.get('description'),
                event_date=datetime.fromisoformat(event_date),
                location=data.get('location'),
                license_code=license_code
            )
        except ValueError:
            return jsonify(error="Formato de fecha inválido. Use 'YYYY-MM-DDTHH:MM:SS'."), 400

        db.session.add(ev)
        db.session.commit()
        return jsonify(msg="Evento creado", id=ev.id), 201


    @app.route('/my-events', methods=['GET'])
    @jwt_required()
    def my_events():
        """
        Devuelve solo los eventos pasados a los que el usuario autenticado haya confirmado asistencia (status='accepted').
        """
        user_id = get_jwt_identity()

        now = datetime.now(timezone.utc)

        rsvps = (
            RSVP.query
                .join(Event, RSVP.event_id == Event.id)
                .filter(
                    RSVP.user_id == user_id,
                    RSVP.status == 'accepted',
                    Event.event_date < now.replace(tzinfo=None)
                )
                .all()
        )
        events = [rsvp.event for rsvp in rsvps]
        return jsonify([
            {
                "id":           e.id,
                "creator_id":   e.creator_id,
                "title":        e.title,
                "description":  e.description,
                "event_date":   e.event_date.isoformat(),
                "location":     e.location,
                "license_code": e.license_code
            } for e in events
        ]), 200
        
    @app.route('/license-types', methods=['GET'])
    def get_license_types():
        """Get all available Creative Commons license types"""
        try:
            # Query your license_types table
            query = "SELECT code, description FROM license_types ORDER BY code"
            cursor = db.session.execute(text(query))
            licenses = cursor.fetchall()
            
            result = []
            for license in licenses:
                result.append({
                    "code": license[0],
                    "description": license[1]
                })
            
            return jsonify(result), 200
            
        except Exception as ex:
            error_logger.error(f"Error en /license-types: {str(ex)}", exc_info=True)
            return jsonify(error="Error al obtener tipos de licencia"), 500


    @app.route('/stats', methods=['GET'])
    @jwt_required()
    def stats():
        """
        Devuelve estadísticas solo para eventos pasados.
        """
        sql = """
            SELECT
                es.event_id,
                es.event_title,
                es.total_rsvps,
                IFNULL(es.accepted_count, 0)   AS accepted_count,
                IFNULL(es.average_rating, 0)   AS average_rating
            FROM event_stats AS es
            JOIN events e ON e.id = es.event_id
            WHERE e.event_date < NOW()
        """
        consulta = text(sql)
        filas = db.session.execute(consulta).mappings().all()

        resultado = []
        for fila in filas:
            resultado.append({
                "event_id":       int(fila["event_id"]),
                "event_title":    fila["event_title"],
                "total_rsvps":    int(fila["total_rsvps"]),
                "accepted_count": int(fila["accepted_count"]),
                "average_rating": float(fila["average_rating"])
            })

        return jsonify(resultado), 200

    @app.route('/rsvps/<int:event_id>', methods=['GET'])
    @jwt_required()
    def get_rsvp_status(event_id):
        """
        Devuelve el estado de RSVP (pending/accepted/declined) 
        para el usuario autenticado sobre un evento dado.
        Si no existe RSVP, devuelve { "status": null }.
        """
        user_id = get_jwt_identity()
        rsvp = RSVP.query.filter_by(user_id=user_id, event_id=event_id).first()
        if not rsvp:
            return jsonify({"status": None}), 200

        return jsonify({"status": rsvp.status}), 200


    @app.route('/rsvps/<int:event_id>', methods=['POST'])
    @jwt_required()
    def rsvp(event_id):
        """
        Confirma asistencia a un evento solo si dicho evento es futuro.
        """
        user_id = get_jwt_identity()

        ev = Event.query.get(event_id)
        if not ev:
            return jsonify(error="Evento no encontrado"), 404

        if ev.event_date < datetime.utcnow():
            return jsonify(error="No puedes confirmar asistencia a un evento que ya pasó."), 400

        existing = RSVP.query.filter_by(user_id=user_id, event_id=event_id).first()
        if existing:
            return jsonify(error="Ya existe un RSVP para este evento"), 400

        r = RSVP(
            user_id=user_id,
            event_id=event_id,
            status='accepted',
            responded_at=datetime.utcnow()
        )
        db.session.add(r)
        db.session.commit()
        return jsonify(msg="RSVP creado"), 201


    @app.route('/rsvps/<int:event_id>', methods=['DELETE'])
    @jwt_required()
    def cancel_rsvp(event_id):
        """
        Cancela/elimina el RSVP solo si el evento es futuro.
        """
        user_id = get_jwt_identity()
        rsvp = RSVP.query.filter_by(user_id=user_id, event_id=event_id).first()
        if not rsvp:
            return jsonify(error="No existe RSVP para este evento"), 404

        if rsvp.event.event_date < datetime.utcnow():
            return jsonify(error="No puedes cancelar asistencia a un evento que ya pasó."), 400

        db.session.delete(rsvp)
        db.session.commit()
        return jsonify(msg="RSVP eliminado"), 200


    @app.route('/comments/<int:event_id>', methods=['POST'])
    @jwt_required()
    def add_comment(event_id):
        """
        Permite agregar comentario/calificación solo si el evento ya pasó y el usuario asistió (status='accepted').
        """
        user_id = get_jwt_identity()
        data = request.get_json() or {}

        rating  = data.get('rating')
        content = data.get('content', '').strip()
        if rating is None or not content:
            return jsonify(error="Los campos 'rating' y 'content' son obligatorios."), 400

        ev = Event.query.get(event_id)
        if not ev:
            return jsonify(error="Evento no encontrado"), 404

        if ev.event_date > datetime.utcnow():
            return jsonify(error="Solo puedes comentar un evento que ya pasó."), 400

        rsvp = RSVP.query.filter_by(user_id=user_id, event_id=event_id, status='accepted').first()
        if not rsvp:
            return jsonify(error="No puedes comentar si no confirmaste asistencia."), 400

        try:
            c = Comment(
                user_id=user_id,
                event_id=event_id,
                rating=int(rating),
                content=content
            )
        except (ValueError, TypeError):
            return jsonify(error="Rating debe ser un número entre 1 y 5."), 400

        db.session.add(c)
        db.session.commit()
        return jsonify(msg="Comentario agregado"), 201


    @app.route('/comments/<int:event_id>', methods=['GET'])
    @jwt_required()
    def list_comments(event_id):
        """
        Lista todos los comentarios de un evento. (Se usan en detalle/pasados)
        """
        comments = Comment.query.filter_by(event_id=event_id).all()
        return jsonify([
            {
                "id":         c.id,
                "user_id":    c.user_id,
                "username":   c.user.username,
                "rating":     c.rating,
                "content":    c.content,
                "created_at": c.created_at.isoformat()
            } for c in comments
        ]), 200
        
        
    @app.route('/history', methods=['GET'])
    @jwt_required()
    def history():
      
        now = datetime.now(timezone.utc)

        past_events = (
            Event.query
                 .filter(Event.event_date < now.replace(tzinfo=None))
                 .order_by(Event.event_date.desc())
                 .all()
        )

        result = []
        for ev in past_events:
            # RSVPs con status='accepted'
            accepted_rsvps = (
                RSVP.query
                    .join(User, RSVP.user_id == User.id)
                    .filter(RSVP.event_id == ev.id, RSVP.status == 'accepted')
                    .all()
            )

            # Lista de asistentes con nombre completo
            attendees = [
                {
                    "user_id": rsvp.user.id,
                    "full_name": f"{rsvp.user.first_name} {rsvp.user.last_name}",
                    "username": rsvp.user.username
                }
                for rsvp in accepted_rsvps
            ]

            result.append({
                "event_id":    ev.id,
                "event_title": ev.title,
                "event_date":  ev.event_date.isoformat(),
                "attendees":   attendees
            })

        return jsonify(result), 200

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
