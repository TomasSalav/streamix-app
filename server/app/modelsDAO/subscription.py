from ..extensions import db
from sqlalchemy.orm import mapped_column, Mapped

class Subscription(db.Model):
    __tablename__ = 'subscription'
    
    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    id_user_subscriber: Mapped[int] = mapped_column(db.Integer, db.ForeignKey('users.id'))
    id_user_subscribed: Mapped[int] = mapped_column(db.Integer, db.ForeignKey('users.id'))
    
    def set_subcription(self, id_user_subscriber, id_user_subscribed):
        if id_user_subscriber == id_user_subscribed:
            raise ValueError("A user cannot subscribe to themselves.")
        self.id_user_subscriber = id_user_subscriber
        self.id_user_subscribed = id_user_subscribed