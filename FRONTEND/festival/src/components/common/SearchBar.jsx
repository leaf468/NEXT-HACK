import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";

const SearchBar = ({ onSearch, placeholder = "검색어를 입력하세요" }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            onSearch(searchTerm);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSubmit(e);
        }
    };

    return (
        <div className="search-bar">
            <input
                type="text"
                className="search-input"
                placeholder={placeholder}
                value={searchTerm}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                aria-label="검색어 입력"
            />
            <button
                className="search-button"
                onClick={handleSubmit}
                aria-label="검색"
            >
                <FaSearch style={{ marginRight: "5px" }} />
                검색
            </button>
        </div>
    );
};

export default SearchBar;
