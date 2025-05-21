import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

const DataContext = createContext();

function getKey(type, year, months) {
  // months: array of numbers (1-based)
  return `${type}:${year}:${months.sort((a, b) => a - b).join(',')}`;
}

export const DataProvider = ({ children }) => {
  // Cache: { [key]: { loading, error, data } }
  const [cache, setCache] = useState({});

  // Get report from cache or fetch if missing
  const getReport = async (type, year, months) => {
    const key = getKey(type, year, months);
    if (cache[key] && cache[key].data) {
      return cache[key].data;
    }
    // Set loading
    setCache(prev => ({ ...prev, [key]: { loading: true, error: null, data: null } }));
    try {
      let url = '';
      if (type === 'school') url = `${config.apiUrl}/reports/school`;
      else if (type === 'rehearsals') url = `${config.apiUrl}/reports/rehearsals`;
      else throw new Error('Invalid report type');
      const res = await axios.get(url, { params: { month: months.join(','), year } });
      setCache(prev => ({ ...prev, [key]: { loading: false, error: null, data: res.data } }));
      return res.data;
    } catch (err) {
      setCache(prev => ({ ...prev, [key]: { loading: false, error: 'Failed to fetch report.', data: null } }));
      throw err;
    }
  };

  // Force refresh (re-fetch from backend)
  const refreshReport = async (type, year, months) => {
    const key = getKey(type, year, months);
    setCache(prev => ({ ...prev, [key]: { loading: true, error: null, data: null } }));
    try {
      let url = '';
      if (type === 'school') url = `${config.apiUrl}/reports/school`;
      else if (type === 'rehearsals') url = `${config.apiUrl}/reports/rehearsals`;
      else throw new Error('Invalid report type');
      const res = await axios.get(url, { params: { month: months.join(','), year } });
      setCache(prev => ({ ...prev, [key]: { loading: false, error: null, data: res.data } }));
      return res.data;
    } catch (err) {
      setCache(prev => ({ ...prev, [key]: { loading: false, error: 'Failed to fetch report.', data: null } }));
      throw err;
    }
  };

  // Expose loading/error/data for a given report
  const useReport = (type, year, months) => {
    const key = getKey(type, year, months);
    return cache[key] || { loading: false, error: null, data: null };
  };

  useEffect(() => {
    // Fetch and cache full school report for current year in background
    const year = new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    getReport('school', year, months);
  }, []);

  // Expose a method to get cached school data for a year
  const getCachedSchoolYear = (year) => {
    const key = getKey('school', year, Array.from({ length: 12 }, (_, i) => i + 1));
    return cache[key]?.data || null;
  };

  return (
    <DataContext.Provider value={{ getReport, refreshReport, useReport, getCachedSchoolYear }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => useContext(DataContext); 