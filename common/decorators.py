from functools import wraps
from rest_framework.response import Response
from rest_framework import status

def role_required(allowed_roles):
    """
    allowed_roles = ["admin", "staff"]
    """
    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            try:
                user = request.user
                if not user.is_authenticated:
                    return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

                if user.role not in allowed_roles:
                    return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

                return func(request, *args, **kwargs)

            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return wrapper
    return decorator
    