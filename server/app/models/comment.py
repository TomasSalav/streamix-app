from ..extensions import db
from sqlalchemy.orm import mapped_column, Mapped, relationship
from datetime import datetime


class Comment(db.Model):
    __tablename__ = 'comments'

    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    content: Mapped[str] = mapped_column(db.Text, nullable=False)
    id_user: Mapped[int] = mapped_column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    id_video: Mapped[int] = mapped_column(db.Integer, db.ForeignKey('videos.id'), nullable=False)
    created_at: Mapped[datetime] = mapped_column(db.DateTime, default=datetime.utcnow)

    user: Mapped['User'] = relationship('User', back_populates='comments')
    video: Mapped['Video'] = relationship('Video', back_populates='comments')

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'content': self.content,
            'id_user': self.id_user,
            'id_video': self.id_video,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'user': {
                'username': self.user.username if self.user else 'Usuario Desconocido',
                'avatar_url': self.user.avatar_url if self.user else None
            }
        }