from .extensions import db
from datetime import datetime

class User(db.Model):
    __tablename__ = "users"
    id            = db.Column(db.Integer, primary_key=True)
    username      = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name    = db.Column(db.String(50), nullable=False)
    last_name     = db.Column(db.String(50), nullable=False)
    age           = db.Column(db.SmallInteger)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)

    events   = db.relationship('Event', back_populates='creator', cascade="all, delete-orphan")
    rsvps    = db.relationship('RSVP', back_populates='user', cascade="all, delete-orphan")
    comments = db.relationship('Comment', back_populates='user', cascade="all, delete-orphan")

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
    updated_at   = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    creator  = db.relationship("User", back_populates="events")
    license  = db.relationship("LicenseType")
    comments = db.relationship("Comment", back_populates="event", cascade="all, delete-orphan")
    rsvps    = db.relationship("RSVP", back_populates="event", cascade="all, delete-orphan")

class RSVP(db.Model):
    __tablename__ = "rsvps"
    id           = db.Column(db.Integer, primary_key=True)
    user_id      = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    event_id     = db.Column(db.Integer, db.ForeignKey("events.id"), nullable=False)
    status       = db.Column(db.Enum('pending','accepted','declined'), default='pending', nullable=False)
    responded_at = db.Column(db.DateTime)
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)

    user  = db.relationship("User", back_populates="rsvps")
    event = db.relationship("Event", back_populates="rsvps")

class Comment(db.Model):
    __tablename__ = "comments"
    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    event_id   = db.Column(db.Integer, db.ForeignKey("events.id"), nullable=False)
    rating     = db.Column(db.SmallInteger)
    content    = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user  = db.relationship("User", back_populates="comments")
    event = db.relationship("Event", back_populates="comments")
    
    def seed_license_types():
   
        existing = LicenseType.query.first()
        if existing:
            return 

        default_licenses = [
            {"code": "CC-BY",      "description": "Creative Commons Attribution"},
            {"code": "CC-BY-SA",   "description": "Attribution-ShareAlike"},
            {"code": "CC-BY-ND",   "description": "Attribution-NoDerivs"},
            {"code": "CC-BY-NC",   "description": "Attribution-NonCommercial"},
            {"code": "CC-BY-NC-SA","description": "Attribution-NonCommercial-ShareAlike"},
            {"code": "CC-BY-NC-ND","description": "Attribution-NonCommercial-NoDerivs"},
        ]

        for lic in default_licenses:
            lt = LicenseType(code=lic["code"], description=lic["description"])
            db.session.add(lt)

        db.session.commit()