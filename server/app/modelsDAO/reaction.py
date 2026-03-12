from ..extensions import db
from sqlalchemy.orm import mapped_column, Mapped

class Reaction(db.Model):
    __tablename__ = 'reaction'

    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    reaction_type: Mapped[str] = mapped_column(db.String(10), nullable=False)
    id_user: Mapped[int] = mapped_column(db.Integer, db.ForeignKey('users.id'))
    id_video: Mapped[int] = mapped_column(db.Integer, db.ForeignKey('videos.id'))