from rest_framework import permissions

class IsRootAdmin(permissions.BasePermission):
    """Permission check for root admin role"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'root_admin'

class IsClientAdminOrRootAdmin(permissions.BasePermission):
    """Permission check for client admin or root admin roles"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and \
               request.user.role in ['client_admin', 'root_admin']

class IsEmployeeOwner(permissions.BasePermission):
    """Permission check for employee accessing their own data"""
    
    def has_object_permission(self, request, view, obj):
        return obj == request.user
