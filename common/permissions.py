from rest_framework.response import Response
from rest_framework import status

def role_required(roles=[]):
    def decorator(func):
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

            if request.user.role not in roles:
                return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

            return func(request, *args, **kwargs)
        return wrapper
    return decorator
