from channels.generic.websocket import WebsocketConsumer
import json


class ShipConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()

    def disconnect(self, close_code):
        pass

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        ship_id = text_data_json['ship_id']

        self.send(text_data=json.dumps({
            'ship_id': ship_id,
        }))
