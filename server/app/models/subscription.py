from ..extensions import db
from sqlalchemy.orm import mapped_column, Mapped, relationship


class Subscription(db.Model):
    __tablename__ = 'subscriptions'

    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    id_subscriber: Mapped[int] = mapped_column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    id_subscribed: Mapped[int] = mapped_column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    subscriber: Mapped['User'] = relationship('User', foreign_keys=[id_subscriber], back_populates='subscriptions_as_subscriber')
    subscribed: Mapped['User'] = relationship('User', foreign_keys=[id_subscribed], back_populates='subscriptions_as_subscribed')

    __table_args__ = (
        db.UniqueConstraint('id_subscriber', 'id_subscribed', name='unique_subscription'),
    )

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'id_subscriber': self.id_subscriber,
            'id_subscribed': self.id_subscribed
        }