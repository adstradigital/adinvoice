from functools import wraps
from django.http import JsonResponse

def super_admin_required(func):
    @wraps(func)
    def wrapper(request, *args, **kwargs):
        if request.user.is_authenticated and request.user.is_superuser:
            return func(request, *args, **kwargs)
        return JsonResponse({'error': 'Super admin access required'}, status=403)
    return wrapper

def client_admin_required(func):
    @wraps(func)
    def wrapper(request, *args, **kwargs):
        if request.user.is_authenticated and hasattr(request.user, 'tenant'):
            return func(request, *args, **kwargs)
        return JsonResponse({'error': 'Client admin access required'}, status=403)
    return wrapper
