from .extensions import db
from datetime import datetime

class User(db.Model):
    __tablename__ = "users"
    id           = db.Column(db.Integer, primary_key=True)
    username     = db.Column(db.String(50), unique=True, nullable=False)
    password_hash= db.Column(db.String(255), nullable=False)
    first_name   = db.Column(db.String(50), nullable=False)
    last_name    = db.Column(db.String(50), nullable=False)
    age          = db.Column(db.SmallInteger)
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)

class LicenseType(db.Model):
    __tablename__ = "license_types"
    code        = db.Column(db.String(20), primary_key=True)
    description = db.Column(db.String(100), nullable=False)

class Event(db.Model):
    __tablename__ = "events"
    id           = db.Column(db.Integer, primary_key=True)
    creator_id   = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title        = db.Column(db.String(100), nullable=False)
    description  = db.Column(db.Text)
    event_date   = db.Column(db.DateTime, nullable=False)
    location     = db.Column(db.String(150))
    license_code = db.Column(db.String(20), db.ForeignKey("license_types.code"), nullable=False)
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)

    creator = db.relationship("User", backref="events")
    license = db.relationship("LicenseType")

class RSVP(db.Model):
    __tablename__ = "rsvps"
    id           = db.Column(db.Integer, primary_key=True)
    user_id      = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    event_id     = db.Column(db.Integer, db.ForeignKey("events.id"), nullable=False)
    status       = db.Column(db.Enum('pending','accepted','declined'), default='pending', nullable=False)
    responded_at = db.Column(db.DateTime)
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)

    user  = db.relationship("User", backref="rsvps")
    event = db.relationship("Event", backref="rsvps")

class Comment(db.Model):
    __tablename__ = "comments"
    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    event_id   = db.Column(db.Integer, db.ForeignKey("events.id"), nullable=False)
    rating     = db.Column(db.SmallInteger)
    content    = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user  = db.relationship("User", backref="comments")
    event = db.relationship("Event", backref="comments")