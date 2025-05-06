import React, { useState } from 'react';
import { IoSearch } from 'react-icons/io5';
import axios from 'axios';

export const SearchBox = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/products`, {
        params: { query: searchQuery }
      });
      console.log('Results:', response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  return (
    <div className="searchBox w-[300px] h-[40px] relative">
      <IoSearch className="absolute top-3 left-3 z-[10]" />
      <input
        type="text"
        className="w-[100%] h-[100%] px-10 cursor-pointer"
        placeholder="Search here..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()} // Trigger search on Enter key press
      />
    </div>
  );
};
