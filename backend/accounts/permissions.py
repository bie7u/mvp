from rest_framework import permissions


class IsRootAdmin(permissions.BasePermission):
    """Permission for root admin only"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_root_admin()


class IsClientAdminOrRootAdmin(permissions.BasePermission):
    """Permission for client admin or root admin"""
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            (request.user.is_client_admin() or request.user.is_root_admin())
        )


class IsCompanyMember(permissions.BasePermission):
    """Permission for company members"""
    
    def has_object_permission(self, request, view, obj):
        if request.user.is_root_admin():
            return True
        
        if hasattr(obj, 'company'):
            return obj.company == request.user.company
        
        return False
