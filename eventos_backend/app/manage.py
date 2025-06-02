from flask.cli import FlaskGroup
from app import create_app, db
import os

from app.models import User, LicenseType, Event, RSVP, Comment

app = create_app()
cli = FlaskGroup(app)

if __name__ == "__main__":
    cli()