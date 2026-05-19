from ..extensions import db
from sqlalchemy.orm import mapped_column, Mapped, relationship
import enum


class ReactionType(enum.Enum):
    LIKE = 'like'
    DISLIKE = 'dislike'


class Reaction(db.Model):
    __tablename__ = 'reactions'

    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    reaction_type: Mapped[str] = mapped_column(db.String(10), nullable=False)
    id_user: Mapped[int] = mapped_column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    id_video: Mapped[int] = mapped_column(db.Integer, db.ForeignKey('videos.id'), nullable=False)

    user: Mapped['User'] = relationship('User', back_populates='reactions')
    video: Mapped['Video'] = relationship('Video', back_populates='reactions')

    __table_args__ = (
        db.UniqueConstraint('id_user', 'id_video', name='unique_user_video_reaction'),
    )

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'reaction_type': self.reaction_type,
            'id_user': self.id_user,
            'id_video': self.id_video
        }
