# run.py

from flask import Flask, request, jsonify
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt_identity
)
from datetime import datetime

from app.config     import Config
from app.extensions import db, migrate, jwt, bcrypt, cors
from app.models     import User, LicenseType, Event, RSVP, Comment

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    cors.init_app(app)
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)

    # Rutas de autenticación
    @app.route('/auth/register', methods=['POST'])
    def register():
        data = request.get_json()
        pw_hash = bcrypt.generate_password_hash(data['password']).decode()
        user = User(
            username=data['username'],
            password_hash=pw_hash,
            first_name=data['first_name'],
            last_name=data['last_name'],
            age=data.get('age')
        )
        db.session.add(user)
        db.session.commit()
        return jsonify(msg="Usuario creado"), 201

    @app.route('/auth/login', methods=['POST'])
    def login():
        data = request.get_json()
        user = User.query.filter_by(username=data['username']).first()
        if not user or not bcrypt.check_password_hash(user.password_hash, data['password']):
            return jsonify(error="Credenciales inválidas"), 401
        token = create_access_token(identity=str(user.id))
        return jsonify(access_token=token, username=user.username), 200

    # Rutas de eventos
    @app.route('/events', methods=['GET'])
    @jwt_required()
    def list_events():
        events = Event.query.all()
        return jsonify([
            {
                "id": e.id,
                "creator_id": e.creator_id,
                "title": e.title,
                "description": e.description,
                "event_date": e.event_date.isoformat(),
                "location": e.location,
                "license_code": e.license_code
            } for e in events
        ])

    @app.route('/events', methods=['POST'])
    @jwt_required()
    def create_event():
        user_id = get_jwt_identity()
        data = request.get_json()
        ev = Event(
            creator_id=user_id,
            title=data['title'],
            description=data.get('description'),
            event_date=datetime.fromisoformat(data['event_date']),
            location=data.get('location'),
            license_code=data['license_code']
        )
        db.session.add(ev)
        db.session.commit()
        return jsonify(msg="Evento creado", id=ev.id), 201

    # Rutas de RSVP
    @app.route('/rsvps/<int:event_id>', methods=['POST'])
    @jwt_required()
    def rsvp(event_id):
        user_id = get_jwt_identity()
        r = RSVP(user_id=user_id, event_id=event_id)
        db.session.add(r)
        db.session.commit()
        return jsonify(msg="RSVP creado"), 201

    # Rutas de comentarios
    @app.route('/comments/<int:event_id>', methods=['POST'])
    @jwt_required()
    def add_comment(event_id):
        user_id = get_jwt_identity()
        data = request.get_json()
        c = Comment(
            user_id=user_id,
            event_id=event_id,
            rating=data.get('rating'),
            content=data.get('content')
        )
        db.session.add(c)
        db.session.commit()
        return jsonify(msg="Comentario agregado"), 201
    
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
