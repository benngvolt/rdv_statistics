import React, { createContext, useState, useEffect } from 'react';
import { API_URL, USERNAME, PASSWORD  } from './constants';

export const ProductsContext = createContext();

export const ProductsProvider = ({ children }) => {

    const [products, setProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loaderDisplay, setLoaderDisplay] = useState(false);
 
    const credentials = btoa(`${USERNAME}:${PASSWORD}`);

    /*REQUÊTE PRODUITS*/
    
    const fetchAllProducts = async () => {
        let allProducts = [];
        let currentPage = 1;
        let hasMorePages = true;
        while (hasMorePages) {
            setLoaderDisplay(true);
            try {
                const response = await fetch(`${API_URL}/products?p=${currentPage}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Basic ${credentials}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data && data.length > 0) {
                    allProducts = [...allProducts, ...data];
                    currentPage += 1;
                    console.log(`Products page: ${currentPage - 1}`);
                } else {
                    hasMorePages = false;
                    setLoaderDisplay(false);
                }
            } catch (error) {
                console.log(`Error fetching page ${currentPage}:`, error.message);
                hasMorePages = false;
            }
        }
        return allProducts;
    };

    /*REQUÊTE MARQUES*/

    const fetchAllBrands = async () => {
        let allBrands = [];
        let currentPage = 1;
        let hasMorePages = true;

        while (hasMorePages) {
            setLoaderDisplay(true);
            try {
                const response = await fetch(`${API_URL}/brands?p=${currentPage}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Basic ${credentials}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data && data.length > 0) {
                    allBrands = [...allBrands, ...data];
                    currentPage += 1;
                    console.log(`Brands page: ${currentPage - 1}`);
                } else {
                    hasMorePages = false;
                    setLoaderDisplay(false);
                }
            } catch (error) {
                console.log(`Error fetching page ${currentPage}:`, error.message);
                hasMorePages = false;
            }
        }
        return allBrands;
    };

    /*REQUÊTE CATEGORIES*/

    const fetchAllCategories = async () => {
        let allCategories = [];
        let currentPage = 1;
        let hasMorePages = true;

        while (hasMorePages) {
            setLoaderDisplay(true);
            try {
                const response = await fetch(`${API_URL}/categories?p=${currentPage}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Basic ${credentials}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data && data.length > 0) {
                    allCategories = [...allCategories, ...data];
                    currentPage += 1;
                    console.log(`Categories page: ${currentPage - 1}`);
                } else {
                    hasMorePages = false;
                    setLoaderDisplay(false);
                }
            } catch (error) {
                console.log(`Error fetching page ${currentPage}:`, error.message);
                hasMorePages = false;
            }
        }
        return allCategories;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const allProducts = await fetchAllProducts();
                const allBrands = await fetchAllBrands();
                const allCategories = await fetchAllCategories();
                setProducts(allProducts);
                setBrands(allBrands);
                setCategories(allCategories);
            } catch (error) {
                console.log(error.message);
            }
        };
        fetchData();
    }, []); // Add loadProducts as a dependency to re-fetch when it changes

    

    return (
        <ProductsContext.Provider value={{ 
            products, 
            setProducts, 
            brands,
            setBrands,
            categories,
            setCategories,
            loaderDisplay, 
            setLoaderDisplay
        }}>
            {children}
        </ProductsContext.Provider>
    );
};