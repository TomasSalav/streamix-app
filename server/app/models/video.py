from ..extensions import db
from sqlalchemy.orm import mapped_column, Mapped, relationship
from datetime import datetime

class Video(db.Model):
    __tablename__ = 'videos'

    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    title: Mapped[str] = mapped_column(db.String(100), nullable=False)
    description: Mapped[str] = mapped_column(db.Text, nullable=True)
    url: Mapped[str] = mapped_column(db.String(500), nullable=False)
    thumbnail_url: Mapped[str] = mapped_column(db.String(500), nullable=True)
    duration: Mapped[int] = mapped_column(db.Integer, nullable=True)
    views_count: Mapped[int] = mapped_column(db.Integer, default=0)
    likes_count: Mapped[int] = mapped_column(db.Integer, default=0)
    dislikes_count: Mapped[int] = mapped_column(db.Integer, default=0)
    id_user: Mapped[int] = mapped_column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at: Mapped[datetime] = mapped_column(db.DateTime, default=datetime.utcnow)

    user: Mapped['User'] = relationship('User', back_populates='videos')
    comments: Mapped[list['Comment']] = relationship('Comment', back_populates='video', cascade='all, delete-orphan')
    reactions: Mapped[list['Reaction']] = relationship('Reaction', back_populates='video', cascade='all, delete-orphan')
    views: Mapped[list['View']] = relationship('View', back_populates='video', cascade='all, delete-orphan')
    watch_later_entries: Mapped[list['WatchLater']] = relationship('WatchLater', back_populates='video', cascade='all, delete-orphan')
    my_list_entries: Mapped[list['MyList']] = relationship('MyList', back_populates='video', cascade='all, delete-orphan')
    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'url': self.url,
            'thumbnail_url': self.thumbnail_url,
            'duration': self.duration,
            'views_count': self.views_count,
            'likes_count': self.likes_count,
            'dislikes_count': self.dislikes_count,
            'id_user': self.id_user,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'user': {
                'username': self.user.username if self.user else 'Usuario Desconocido',
                'avatar_url': self.user.avatar_url if self.user else None
            }
        }