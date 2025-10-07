from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from companies.models import Company

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    
    company_name = serializers.CharField(source='company.name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name',
            'nickname', 'profile_photo', 'role', 'company', 'company_name',
            'email_notifications', 'date_joined', 'is_active'
        ]
        read_only_fields = ['id', 'date_joined', 'role']


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for user profile updates"""
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'nickname', 
            'profile_photo', 'email_notifications'
        ]


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change"""
    
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value


class UserInviteSerializer(serializers.Serializer):
    """Serializer for user invitation"""
    
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    role = serializers.ChoiceField(
        choices=[User.Role.CLIENT_ADMIN, User.Role.EMPLOYEE],
        default=User.Role.EMPLOYEE
    )
    company = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(),
        required=False
    )
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email already exists")
        return value


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration via invitation"""
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True, required=True)
    invitation_token = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'username', 'first_name', 'last_name',
            'password', 'password_confirm', 'invitation_token', 'nickname'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords don't match"})
        return attrs
    
    def validate_invitation_token(self, value):
        try:
            user = User.objects.get(invitation_token=value, is_invited=True, is_active=False)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid invitation token")
        return value
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        token = validated_data.pop('invitation_token')
        password = validated_data.pop('password')
        
        # Get the invited user
        user = User.objects.get(invitation_token=token)
        
        # Update user details
        for key, value in validated_data.items():
            setattr(user, key, value)
        
        user.set_password(password)
        user.is_active = True
        user.is_invited = False
        user.invitation_token = ''
        user.save()
        
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request"""
    
    email = serializers.EmailField()
    
    def validate_email(self, value):
        try:
            User.objects.get(email=value, is_active=True)
        except User.DoesNotExist:
            raise serializers.ValidationError("User with this email does not exist")
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for password reset confirmation"""
    
    token = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
    new_password_confirm = serializers.CharField()
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"password": "Passwords don't match"})
        return attrs
