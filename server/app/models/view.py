from ..extensions import db
from sqlalchemy.orm import mapped_column, Mapped

class View(db.Model):
    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    counter: Mapped[str] = mapped_column(db.String(10), nullable=False)
    id_video: Mapped[int] = mapped_column(db.Integer, db.ForeignKey('video.id'))