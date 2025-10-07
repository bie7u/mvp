from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.utils.crypto import get_random_string
from django.utils import timezone
from datetime import timedelta

from .models import User
from .serializers import (
    UserSerializer, UserProfileUpdateSerializer, ChangePasswordSerializer,
    UserInviteSerializer, UserRegistrationSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer
)
from .permissions import IsRootAdmin, IsClientAdminOrRootAdmin

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for User model"""
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'invite']:
            return [IsClientAdminOrRootAdmin()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_root_admin():
            return User.objects.all()
        elif user.is_client_admin():
            return User.objects.filter(company=user.company)
        else:
            return User.objects.filter(id=user.id)
    
    @action(detail=False, methods=['post'], permission_classes=[IsClientAdminOrRootAdmin])
    def invite(self, request):
        """Invite a new user"""
        serializer = UserInviteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Determine company
        company = serializer.validated_data.get('company')
        if not company:
            if request.user.is_root_admin():
                return Response(
                    {"error": "Root admin must specify a company"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            company = request.user.company
        
        # Check if user is allowed to invite to this company
        if request.user.is_client_admin() and company != request.user.company:
            return Response(
                {"error": "Cannot invite users to other companies"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Create invitation
        token = get_random_string(64)
        user = User.objects.create(
            email=serializer.validated_data['email'],
            username=serializer.validated_data['email'],
            first_name=serializer.validated_data['first_name'],
            last_name=serializer.validated_data['last_name'],
            role=serializer.validated_data['role'],
            company=company,
            is_invited=True,
            is_active=False,
            invitation_token=token,
            invitation_sent_at=timezone.now()
        )
        
        # Send invitation email
        invitation_link = f"{settings.FRONTEND_URL}/register?token={token}" if hasattr(settings, 'FRONTEND_URL') else f"http://localhost:3000/register?token={token}"
        
        send_mail(
            subject='Invitation to Football Predictions Platform',
            message=f'''
            Hello {user.first_name},
            
            You have been invited to join the Football Predictions Platform for {company.name}.
            
            Please click the link below to complete your registration:
            {invitation_link}
            
            This invitation will expire in 7 days.
            
            Best regards,
            Football Predictions Team
            ''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        
        return Response(
            {"message": "Invitation sent successfully", "user_id": user.id},
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['post'], permission_classes=[IsClientAdminOrRootAdmin])
    def resend_invitation(self, request, pk=None):
        """Resend invitation to a user"""
        user = self.get_object()
        
        if not user.is_invited or user.is_active:
            return Response(
                {"error": "User is not pending invitation"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check permissions
        if request.user.is_client_admin() and user.company != request.user.company:
            return Response(
                {"error": "Cannot resend invitation for users in other companies"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Generate new token
        token = get_random_string(64)
        user.invitation_token = token
        user.invitation_sent_at = timezone.now()
        user.save()
        
        # Send invitation email
        invitation_link = f"{settings.FRONTEND_URL}/register?token={token}" if hasattr(settings, 'FRONTEND_URL') else f"http://localhost:3000/register?token={token}"
        
        send_mail(
            subject='Invitation to Football Predictions Platform',
            message=f'''
            Hello {user.first_name},
            
            Your invitation to join the Football Predictions Platform for {user.company.name} has been resent.
            
            Please click the link below to complete your registration:
            {invitation_link}
            
            This invitation will expire in 7 days.
            
            Best regards,
            Football Predictions Team
            ''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        
        return Response({"message": "Invitation resent successfully"})
    
    @action(detail=False, methods=['get', 'put', 'patch'])
    def profile(self, request):
        """Get or update user profile"""
        if request.method == 'GET':
            serializer = UserSerializer(request.user)
            return Response(serializer.data)
        else:
            serializer = UserProfileUpdateSerializer(
                request.user,
                data=request.data,
                partial=request.method == 'PATCH'
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change user password"""
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        
        return Response({"message": "Password changed successfully"})


class UserRegistrationView(generics.CreateAPIView):
    """View for user registration via invitation"""
    
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer


class PasswordResetRequestView(generics.GenericAPIView):
    """View for requesting password reset"""
    
    permission_classes = [AllowAny]
    serializer_class = PasswordResetRequestSerializer
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = User.objects.get(email=serializer.validated_data['email'])
        
        # Generate reset token
        token = get_random_string(64)
        user.invitation_token = token  # Reuse invitation_token field for reset
        user.invitation_sent_at = timezone.now()
        user.save()
        
        # Send reset email
        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}" if hasattr(settings, 'FRONTEND_URL') else f"http://localhost:3000/reset-password?token={token}"
        
        send_mail(
            subject='Password Reset Request',
            message=f'''
            Hello {user.first_name},
            
            You have requested to reset your password.
            
            Please click the link below to reset your password:
            {reset_link}
            
            This link will expire in 24 hours.
            
            If you did not request this, please ignore this email.
            
            Best regards,
            Football Predictions Team
            ''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        
        return Response({"message": "Password reset email sent"})


class PasswordResetConfirmView(generics.GenericAPIView):
    """View for confirming password reset"""
    
    permission_classes = [AllowAny]
    serializer_class = PasswordResetConfirmSerializer
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            user = User.objects.get(
                invitation_token=serializer.validated_data['token'],
                is_active=True
            )
            
            # Check token expiry (24 hours)
            if user.invitation_sent_at:
                expiry = user.invitation_sent_at + timedelta(hours=24)
                if timezone.now() > expiry:
                    return Response(
                        {"error": "Reset token has expired"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid reset token"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(serializer.validated_data['new_password'])
        user.invitation_token = ''
        user.invitation_sent_at = None
        user.save()
        
        return Response({"message": "Password reset successfully"})

