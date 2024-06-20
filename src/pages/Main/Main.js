import './Main.scss'
import { API_URL, USERNAME, PASSWORD, storesList  } from '../../utils/constants';
import React, { useState, useContext, useEffect } from 'react'
import logo from '../../assets/logo.png'
import FiltersForm from '../../components/FiltersForm/FiltersForm'
import List from '../../components/List/List';

import { ProductsContext } from '../../utils/ProductsContext'
import Loader from '../../components/Loader/Loader';

function Main () {

  const [collectionTagSelected, setCollectionTagSelected] = useState('TOUTES LES SAISONS');
  const [brandSelected, setBrandSelected] = useState('TOUTES LES MARQUES');
  const [storeSelected, setStoreSelected] = useState(0);
  const [startDateSelected, setStartDateSelected] = useState('');
  const [endDateSelected, setEndDateSelected] = useState('');
  const [categorySelected, setCategorySelected] = useState('TOUTES LES CATEGORIES');
  const [collectionTags, setCollectionTags] = useState([]);
  const [stores, setStores] = useState ([]);

  const [filteredSalesList, setFilteredSalesList] = useState([]);

  // Encodage des informations en Base64
  const credentials = btoa(`${USERNAME}:${PASSWORD}`);

  const { products, brands, categories, loaderDisplay, setLoaderDisplay } = useContext(ProductsContext);

  useEffect(() => {
    getTags().then(tags => {
      let collectionTags = []
      if (tags) {
        let collectionTagsList = tags[1].tag_details
        collectionTagsList.forEach(tag => {
            collectionTags.push(tag);
            });
      setCollectionTags(collectionTags)
      }
    })
    setStores (storesList)
  }, []);

  /* -----------------------------------------------------
  1È ÉTAPE :: RÉCUPÉRATION DES VENTES POUR PLUSIEURS JOURS
  ----------------------------------------------------- */

  let datedSalesList = [];

  // RÉCUPÉRATION DES VENTES POUR UNE JOURNÉE DONNÉE
  async function getSalesByDate(year, month, day, store_id) {
    try {
      const response = await fetch(`${API_URL}/products_sold/${store_id}/${year}/${month}/${day}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      const sales = await response.json();
      return sales;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  // RÉCUPÉRATION DES VENTES POUR UNE PLUSIEURS DATES
  async function getAllSales(startDate, endDate, store_id) {
    
    let salesList = [];
    
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
    
    while (currentDate <= end) {
      let year = currentDate.getFullYear();
      let month = currentDate.getMonth() + 1; // Les mois commencent à 0 dans JavaScript
      let day = currentDate.getDate();
      
      const sales = await getSalesByDate(year, month, day, store_id);
      if (sales) {
        salesList.push(...sales); // Ajouter les ventes récupérées à la liste
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }
    return salesList;
  }

  // Exemple d'utilisation:
  const startDate = new Date(startDateSelected); // mois en JavaScript commence à 0 (0 = janvier)
  const endDate = new Date(endDateSelected); // mois en JavaScript commence à 0 (0 = janvier)
  const store_id = storeSelected;

  async function generateDatedList() {
    try {
      const sales = await getAllSales(startDate, endDate, store_id);
  
      const filteredSales = await Promise.all(
        sales
          .filter(sale => sale.product_price !== '0.00')
          .map(async sale => {
            const taxeValue = parseFloat(sale.product_price) * parseFloat(sale.vat);
            const htPrice = parseFloat(sale.product_price) - taxeValue;
            const roundedHtPrice = htPrice.toFixed(2);
            const saleTag = await getTagsProducts(sale.product_id);
            
            // Utilisation de find pour obtenir le tag correspondant
            const collectionTag = collectionTags.find(tag => tag.tag_id === saleTag[0]?.tag_id);
            const saleTagName = collectionTag ? collectionTag.tag : '';

            // Utilisation de find pour obtenir le store correspondant
            const store = await stores.find(store => store.store_id === sale.store_id);
            const storeName = store ? store.store_name : 'aucune boutique';

            // Utilisation de find pour obtenir le produit correspondant puis la marque et la catégorie
            const product = await products?.find(product => product.product_id === sale.product_id);
            const brand = await brands?.find(brand => brand.brand_id === product.product_brand);
            const brandName = brand ? brand.brand_name : '';
            
            const category = await categories?.find(category => category.category_id === product.product_category);
            const categoryName = category ? category.category_name : ''

            return {
              ...sale,
              product_htPrice: roundedHtPrice,
              product_tag: saleTagName,
              store_name: storeName,
              product_brand: brandName,
              product_category: categoryName
            };
          })
      );

      const datedFilteredSales = filteredSales
        .filter (sale => {
            const tagCondition = collectionTagSelected === 'TOUTES LES SAISONS' || sale.product_tag === collectionTagSelected;
            const brandCondition = brandSelected === 'TOUTES LES MARQUES' || sale.product_brand === brandSelected;
            const categoriesCondition = categorySelected === 'TOUTES LES CATEGORIES' || sale.product_category.split(' ').includes(categorySelected);
            return tagCondition && brandCondition && categoriesCondition;
          })
      setFilteredSalesList(datedFilteredSales);

    } catch (error) {

      console.error('Erreur lors de la récupération des ventes :', error);
    }
  }


  
  /* ------------------------------------------
  2è ÉTAPE :: RÉCUPÉRATION DES TAGS COLLECTIONS
  ------------------------------------------ */

  async function getTags() {
      try {
      const response = await fetch(`${API_URL}/tags/products`, {
          method: 'GET',
          headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
          }
      });
      if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      const tags = await response.json();
      return tags;
      } catch (error) {
      console.error(error);
      return null;
      }
  }

  /* -------------------------------------------------
  3è ÉTAPE :: RÉCUPÉRATION DES COLLECTIONS PAR PRODUIT
  ------------------------------------------------- */

  async function getTagsProducts(product_id) {
    try {
      const response = await fetch(`${API_URL}/products_tags/${product_id}`, {
          method: 'GET',
          headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
          }
      });
      if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      const tagProduct = await response.json();
      return tagProduct;
      } catch (error) {
      console.error(error);
      return null;
    }
  }

  async function generateFilteredSalesList() {
    await generateDatedList();
  }

  /* TÉLÉCHARGEMENT D'UN FICHIER CSV */

  function jsonToCsv(jsonData) {
    const array = typeof jsonData !== 'object' ? JSON.parse(jsonData) : jsonData;
    const headers = Object.keys(array[0]);
    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(','));

    // Add data rows
    array.forEach(row => {
        const values = headers.map(header => {
            const escaped = ('' + row[header]).replace(/"/g, '""'); // Escape quotes
            return `"${escaped}"`; // Wrap values in quotes
        });
        csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }

  function downloadCsv(csvData, filename) {
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', filename);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  }

  const handleDownloadCsv = () => {
    if (filteredSalesList && filteredSalesList.length > 0) {
        const csvData = jsonToCsv(filteredSalesList);
        downloadCsv(csvData, 'filteredSales.csv');
    } else {
        console.warn('No sales data available to download.');
    }
  }

  return (
      <main className='main'>
        <img className='main_img' src={logo}/>
        <p className='main_title'>STATS GEN</p>
        <FiltersForm 
            setCategorySelected = {setCategorySelected}
            setStartDateSelected = {setStartDateSelected}
            setEndDateSelected = {setEndDateSelected}
            setStoreSelected= {setStoreSelected}
            storeSelected= {storeSelected}
            stores= {stores}
            setBrandSelected= {setBrandSelected}
            setCollectionTagSelected={setCollectionTagSelected}
            collectionTagSelected={collectionTagSelected}
            collectionTags={collectionTags}
            brandSelected={brandSelected}
            brands={brands}
        />
        <button className='main_genButton' type='button' onClick={() => generateFilteredSalesList()}>GÉNÉRER</button>
        { filteredSalesList && filteredSalesList.length > 0 &&
        <button className='main_csvButton' type='button' onClick={handleDownloadCsv}>.CSV</button>
        }
        { filteredSalesList && filteredSalesList.length > 0 &&
        <List
            salesList = {filteredSalesList}/>
        }
        <Loader 
          loaderDisplay={loaderDisplay} 
          className='loader--translucent'
        />
      </main>
  )
}

export default Main