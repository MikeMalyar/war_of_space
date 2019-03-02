from channels.generic.websocket import AsyncWebsocketConsumer
import json


class PlayConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['game_id']
        self.room_group_name = 'chat_%s' % self.room_name

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)

        info = {}
        if text_data_json['obj'] == 'ship':
            info = {
                'type': 'ship',
                'ship_id': text_data_json['ship_id'],
                'speed': text_data_json['speed'],
                'angle': text_data_json['angle'],
                'rotate': text_data_json['rotate'],
                'racing': text_data_json['racing'],
                'x': text_data_json['x'],
                'y': text_data_json['y'],
                'hp': text_data_json['hp'],
                'money': text_data_json['money'],
                'frags': text_data_json['frags'],
                'visible': text_data_json['visible'],
            }

        if text_data_json['obj'] == 'shell':
            info = {
                'type': 'shell',
                'shell_id': text_data_json['shell_id'],
                'ship_id': text_data_json['ship_id'],
                'image': text_data_json['image'],
                'speed': text_data_json['speed'],
                'angle': text_data_json['angle'],
                'x': text_data_json['x'],
                'y': text_data_json['y'],
                'lifetime': text_data_json['lifetime'],
                'time': text_data_json['time'],
                'destroyed': text_data_json['destroyed'],
            }

        if text_data_json['obj'] == 'move_obj':
            info = {
                'type': 'move_obj',
                'obj_id': text_data_json['obj_id'],
                'angle': text_data_json['angle'],
                'rotate': text_data_json['rotate'],
                'x': text_data_json['x'],
                'y': text_data_json['y'],
                'cx': text_data_json['cx'],
                'cy': text_data_json['cy'],
                'orbit_rotate': text_data_json['orbit_rotate'],
                'visible': text_data_json['visible'],
            }

        if text_data_json['obj'] == 'static_obj':
            info = {
                'type': 'static_obj',
                'obj_id': text_data_json['obj_id'],
                'x': text_data_json['x'],
                'y': text_data_json['y'],
                'visible': text_data_json['visible'],
            }

        await self.channel_layer.group_send(
            self.room_group_name, info
        )

    async def ship(self, event):

        await self.send(text_data=json.dumps({
            'obj': 'ship',
            'ship_id': event['ship_id'],
            'speed': event['speed'],
            'angle': event['angle'],
            'rotate': event['rotate'],
            'racing': event['racing'],
            'x': event['x'],
            'y': event['y'],
            'hp': event['hp'],
            'money': event['money'],
            'frags': event['frags'],
            'visible': event['visible'],
        }))

    async def shell(self, event):

        await self.send(text_data=json.dumps({
            'obj': 'shell',
            'shell_id': event['shell_id'],
            'ship_id': event['ship_id'],
            'image': event['image'],
            'speed': event['speed'],
            'angle': event['angle'],
            'x': event['x'],
            'y': event['y'],
            'lifetime': event['lifetime'],
            'time': event['time'],
            'destroyed': event['destroyed'],
        }))

    async def move_obj(self, event):

        await self.send(text_data=json.dumps({
            'obj': 'move_obj',
            'obj_id': event['obj_id'],
            'angle': event['angle'],
            'rotate': event['rotate'],
            'x': event['x'],
            'y': event['y'],
            'cx': event['cx'],
            'cy': event['cy'],
            'orbit_rotate': event['orbit_rotate'],
            'visible': event['visible'],
        }))

    async def static_obj(self, event):

        await self.send(text_data=json.dumps({
            'obj': 'static_obj',
            'obj_id': event['obj_id'],
            'x': event['x'],
            'y': event['y'],
            'visible': event['visible'],
        }))
