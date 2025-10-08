import React, { useState, useEffect } from 'react';
import { companiesAPI, usersAPI, leaguesAPI } from '../../services/api';

const RootAdminPanel = () => {
  const [activeTab, setActiveTab] = useState('companies');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Root Admin Panel</h1>
        
        <div className="bg-white shadow sm:rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('companies')}
                className={`${
                  activeTab === 'companies'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Companies
              </button>
              <button
                onClick={() => setActiveTab('leagues')}
                className={`${
                  activeTab === 'leagues'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Leagues
              </button>
              <button
                onClick={() => setActiveTab('statistics')}
                className={`${
                  activeTab === 'statistics'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Statistics
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'companies' && <CompaniesTab />}
            {activeTab === 'leagues' && <LeaguesTab />}
            {activeTab === 'statistics' && <StatisticsTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

const CompaniesTab = () => {
  const [companies, setCompanies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await companiesAPI.getCompanies();
      setCompanies(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await companiesAPI.createCompany(formData);
      setFormData({ name: '', description: '' });
      setShowForm(false);
      fetchCompanies();
    } catch (error) {
      console.error('Error creating company:', error);
      alert('Failed to create company');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        await companiesAPI.deleteCompany(id);
        fetchCompanies();
      } catch (error) {
        console.error('Error deleting company:', error);
        alert('Failed to delete company');
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Companies</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          {showForm ? 'Cancel' : 'Add Company'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                rows="3"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Create Company
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employees</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {companies.map((company) => (
              <tr key={company.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {company.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {company.employee_count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(company.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => handleDelete(company.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const LeaguesTab = () => {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeagues();
  }, []);

  const fetchLeagues = async () => {
    try {
      const response = await leaguesAPI.getLeagues();
      setLeagues(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching leagues:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Leagues</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leagues.map((league) => (
          <div key={league.id} className="border rounded-lg p-4">
            <h3 className="font-semibold">{league.league_display_name}</h3>
            <p className="text-sm text-gray-600">{league.country}</p>
            <p className="text-sm text-gray-600">Season: {league.season}</p>
            <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
              league.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {league.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatisticsTab = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Platform Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-primary-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-primary-900">Total Users</h3>
          <p className="text-3xl font-bold text-primary-600 mt-2">0</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900">Total Predictions</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">0</p>
        </div>
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900">Active Companies</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
        </div>
      </div>
    </div>
  );
};

export default RootAdminPanel;
