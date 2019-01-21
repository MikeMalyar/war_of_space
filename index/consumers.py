from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
import json


class ShipConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['game_id']
        self.room_group_name = 'chat_%s' % self.room_name

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    def receive(self, text_data):
        text_data_json = json.loads(text_data)

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'ship',
                'ship_id': text_data_json['ship_id'],
                'speed': text_data_json['speed'],
                'angle': text_data_json['angle'],
                'rotate': text_data_json['rotate'],
                'racing': text_data_json['racing'],
                'x': text_data_json['x'],
                'y': text_data_json['y'],
                'hp': text_data_json['hp'],
            }
        )

    def ship(self, event):

        self.send(text_data=json.dumps({
            'ship_id': event['ship_id'],
            'speed': event['speed'],
            'angle': event['angle'],
            'rotate': event['rotate'],
            'racing': event['racing'],
            'x': event['x'],
            'y': event['y'],
            'hp': event['hp'],
        }))
