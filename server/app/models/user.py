from ..extensions import db
from sqlalchemy.orm import mapped_column, Mapped, relationship
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import re


class User(db.Model):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    username: Mapped[str] = mapped_column(db.String(50), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(db.String(120), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(db.String(256), nullable=False)
    avatar_url: Mapped[str] = mapped_column(db.String(500), nullable=True)
    bio: Mapped[str] = mapped_column(db.Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(db.DateTime, default=datetime.utcnow)

    videos: Mapped[list['Video']] = relationship('Video', back_populates='user', cascade='all, delete-orphan')
    comments: Mapped[list['Comment']] = relationship('Comment', back_populates='user', cascade='all, delete-orphan')
    reactions: Mapped[list['Reaction']] = relationship('Reaction', back_populates='user', cascade='all, delete-orphan')
    subscriptions_as_subscriber: Mapped[list['Subscription']] = relationship(
        'Subscription',
        foreign_keys='Subscription.id_subscriber',
        back_populates='subscriber',
        cascade='all, delete-orphan'
    )
    subscriptions_as_subscribed: Mapped[list['Subscription']] = relationship(
        'Subscription',
        foreign_keys='Subscription.id_subscribed',
        back_populates='subscribed',
        cascade='all, delete-orphan'
    )
    views: Mapped[list['View']] = relationship('View', back_populates='user', cascade='all, delete-orphan')
    watch_later: Mapped[list['WatchLater']] = relationship('WatchLater', back_populates='user', cascade='all, delete-orphan')
    my_list: Mapped[list['MyList']] = relationship('MyList', back_populates='user', cascade='all, delete-orphan')

    def set_password(self, password: str):
        if not self._validate_email(self.email):
            raise ValueError('Invalid email format')
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def _validate_email(self, email: str) -> bool:
        regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(regex, email))

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'avatar_url': self.avatar_url,
            'bio': self.bio,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }