# utils/decorators.py
from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from users.models import UserRole, RolePermission

def permission_required(permission_code):
    """
    Checks if the logged-in user has the given permission via their role.
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            user = request.user

            if not user.is_authenticated:
                return Response(
                    {"error": "Authentication required"},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Get all role IDs for the current user
            user_roles = UserRole.objects.filter(user_id=user.id).values_list("role_id", flat=True)

            if not user_roles.exists():
                return Response(
                    {"error": "No role assigned"},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Check if any of the user's roles have this permission
            has_perm = RolePermission.objects.filter(
                role_id__in=user_roles,
                permission__code=permission_code
            ).exists()

            if not has_perm:
                return Response(
                    {"error": "Permission denied"},
                    status=status.HTTP_403_FORBIDDEN
                )

            return view_func(request, *args, **kwargs)

        return _wrapped_view
    return decorator
