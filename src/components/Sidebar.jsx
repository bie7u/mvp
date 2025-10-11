import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Settings, 
  Building2,
  Trophy
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
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
      roles: ['root_admin', 'client_admin', 'client_user'],
    },
    {
      name: 'Leagues',
      href: '/leagues',
      icon: Trophy,
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
      roles: ['root_admin', 'client_admin'],
    },
  ];

  const allowedNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role)
  );

  return (
    <aside className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {allowedNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`
                }
              >
                <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
