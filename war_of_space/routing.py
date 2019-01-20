from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
import index.routing

application = ProtocolTypeRouter({

    'websocket': AuthMiddlewareStack(
        URLRouter(
            index.routing.websocket_urlpatterns
        )
    ),
})