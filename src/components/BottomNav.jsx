import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Settings, 
  Building2,
  Trophy,
  Award
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const BottomNav = () => {
  const { user } = useAuth();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['root_admin', 'client_admin', 'client_user'],
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      roles: ['root_admin'],
    },
    {
      name: 'Leagues',
      href: '/leagues',
      icon: Trophy,
      roles: ['root_admin', 'client_admin', 'client_user'],
    },
    {
      name: 'Ranking',
      href: '/ranking',
      icon: Award,
      roles: ['root_admin', 'client_admin', 'client_user'],
    },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
      roles: ['root_admin', 'client_admin'],
    },
    {
      name: 'Clients',
      href: '/clients',
      icon: Building2,
      roles: ['root_admin'],
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      roles: ['root_admin', 'client_admin', 'client_user'],
    },
  ];

  const allowedNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role)
  );

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="flex justify-around items-center h-16">
        {allowedNavigation.slice(0, 4).map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`
            }
          >
            <item.icon className="h-6 w-6" aria-hidden="true" />
            <span className="text-xs mt-1">{item.name}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
