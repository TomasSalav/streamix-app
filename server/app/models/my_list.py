from ..extensions import db
from sqlalchemy.orm import mapped_column, Mapped, relationship
from datetime import datetime


class MyList(db.Model):
    __tablename__ = 'my_list'

    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    id_user: Mapped[int] = mapped_column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    id_video: Mapped[int] = mapped_column(db.Integer, db.ForeignKey('videos.id'), nullable=False)
    created_at: Mapped[datetime] = mapped_column(db.DateTime, default=datetime.utcnow)

    user: Mapped['User'] = relationship('User', back_populates='my_list')
    video: Mapped['Video'] = relationship('Video', back_populates='my_list_entries')

    __table_args__ = (
        db.UniqueConstraint('id_user', 'id_video', name='unique_my_list'),
    )

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'id_user': self.id_user,
            'id_video': self.id_video,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
