from ..extensions import db
from sqlalchemy.orm import mapped_column, Mapped

class Comment(db.Model):
    __tablename__ = 'comment'

    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    content: Mapped[str] = mapped_column(nullable=False)
    id_user: Mapped[int] = mapped_column(db.Integer, db.ForeignKey('user.id'))
    id_video: Mapped[int] = mapped_column(db.Integer, db.ForeignKey('video.id'))
    created_at: Mapped[str] = mapped_column(db.Datetime, default=db.func.now())
    