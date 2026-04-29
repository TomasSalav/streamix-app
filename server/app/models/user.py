from ..extensions import db
from sqlalchemy.orm import mapped_column, Mapped
from werkzeug.security import generate_password_hash, check_password_hash
import re

class User(db.Model):
    __tablename__ = 'user'

    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    username: Mapped[str] = mapped_column(db.String(50), unique=True, nullable=False)
    _email: Mapped[str] = mapped_column(db.String(120), unique=True, nullable=False)
    _password: Mapped[str] = mapped_column(db.String(128), nullable=False)
    created_at: Mapped[str] = mapped_column(db.Datetime, default=db.func.now())

    @property
    def email(self):
        return self._email
    
    @email.setter
    def email(self, value):
        if not self.validate_email(value):
            return
        self.email = value

    @property
    def password(self):
        return self._password
    
    def _validate_email(self, email):
        regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(regex, email)

    @password.setter
    def password(self, value):
        self.password = generate_password_hash(value)

    def check_password(self, password):
        return check_password_hash(self.password, password)
    
