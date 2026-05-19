from ..extensions import db
from sqlalchemy.orm import mapped_column, Mapped, relationship
from datetime import datetime


class View(db.Model):
    __tablename__ = 'views'

    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    id_video: Mapped[int] = mapped_column(db.Integer, db.ForeignKey('videos.id'), nullable=False)
    id_user: Mapped[int] = mapped_column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    viewed_at: Mapped[datetime] = mapped_column(db.DateTime, default=datetime.utcnow)

    video: Mapped['Video'] = relationship('Video', back_populates='views')
    user: Mapped['User'] = relationship('User', back_populates='views')

    __table_args__ = (
        db.UniqueConstraint('id_video', 'id_user', name='unique_video_view'),
    )

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'id_video': self.id_video,
            'id_user': self.id_user,
            'viewed_at': self.viewed_at.isoformat() if self.viewed_at else None
        }
