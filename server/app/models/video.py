from ..extensions import db
from sqlalchemy.orm import mapped_column, Mapped

class Video(db.Model):
    __tablename__ = 'video'

    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    title: Mapped[str] = mapped_column(db.String(100), nullable=False)
    description: Mapped[str] = mapped_column(db.String(), nullable=False)
    created_at: Mapped[str] = mapped_column(db.Datetime, default=db.func.now())
    id_user: Mapped[int] = mapped_column(db.Integer, db.ForeignKey('users.id'))