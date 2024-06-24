import React, { createContext, useState, useEffect } from 'react';

export const ProductsContext = createContext();

export const ProductsProvider = ({ children }) => {

    const [products, setProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [userName, setUserName] = useState ('');
    const [passWord, setPassWord] = useState ('');
    const [apiUrl, setApiUrl] = useState ('');
    const [textError, setTextError] = useState (false)

    const [loaderDisplay, setLoaderDisplay] = useState(false);
    const [authModalDisplay, setAuthModalDisplay] = useState(true)
 
    const credentials = btoa(`${userName}:${passWord}`);

    /*REQUÊTE PRODUITS*/
    
    const fetchAllProducts = async () => {
        let allProducts = [];
        let currentPage = 1;
        let hasMorePages = true;
        while (hasMorePages) {
            setLoaderDisplay(true);
            setAuthModalDisplay(false);
            try {
                const response = await fetch(`${apiUrl}/products?p=${currentPage}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Basic ${credentials}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    setAuthModalDisplay(true)
                    setLoaderDisplay(false);
                    setTextError(true);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data && data.length > 0) {
                    allProducts = [...allProducts, ...data];
                    currentPage += 1;
                    console.log(`Products page: ${currentPage - 1}`);
                } else {
                    hasMorePages = false;
                    setTextError(false);
                    setLoaderDisplay(false);
                    setAuthModalDisplay(false)
                }
            } catch (error) {
                console.log(`Error fetching page ${currentPage}:`, error.message);
                hasMorePages = false;
                setAuthModalDisplay(true)
                setLoaderDisplay(false);
                setTextError(true);
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
                const response = await fetch(`${apiUrl}/brands?p=${currentPage}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Basic ${credentials}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    setAuthModalDisplay(true)
                    setLoaderDisplay(false);
                    setTextError(true);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data && data.length > 0) {
                    allBrands = [...allBrands, ...data];
                    currentPage += 1;
                    console.log(`Brands page: ${currentPage - 1}`);
                } else {
                    hasMorePages = false;
                    setTextError(false);
                    setLoaderDisplay(false);
                    setAuthModalDisplay(false)
                }
            } catch (error) {
                console.log(`Error fetching page ${currentPage}:`, error.message);
                hasMorePages = false;
                setAuthModalDisplay(true)
                setLoaderDisplay(false);
                setTextError(true);
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
                const response = await fetch(`${apiUrl}/categories?p=${currentPage}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Basic ${credentials}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    setAuthModalDisplay(true)
                    setLoaderDisplay(false);
                    setTextError(true);
                    throw new Error(`HTTP error! status: ${response.status}`);
                    
                }

                const data = await response.json();

                if (data && data.length > 0) {
                    allCategories = [...allCategories, ...data];
                    currentPage += 1;
                    console.log(`Categories page: ${currentPage - 1}`);
                } else {
                    hasMorePages = false;
                    setTextError(false);
                    setLoaderDisplay(false);
                    setAuthModalDisplay(false)
                }
            } catch (error) {
                console.log(`Error fetching page ${currentPage}:`, error.message);
                hasMorePages = false;
                setAuthModalDisplay(true)
                setLoaderDisplay(false);
                setTextError(true);
            }
        }
        return allCategories;
    };

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
            setAuthModalDisplay(true)
            setLoaderDisplay(false);
        }
    };

    return (
        <ProductsContext.Provider value={{ 
            products, 
            setProducts, 
            brands,
            setBrands,
            categories,
            setCategories,
            loaderDisplay, 
            setLoaderDisplay,
            userName,
            setUserName,
            passWord,
            setPassWord,
            credentials,
            apiUrl,
            setApiUrl, 
            fetchData,
            authModalDisplay, 
            setAuthModalDisplay,
            textError
        }}>
            {children}
        </ProductsContext.Provider>
    );
};