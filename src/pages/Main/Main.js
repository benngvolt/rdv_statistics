
import './Main.scss'
import { storesList, categoryParentNames } from '../../utils/constants';
import React, { useState, useContext, useEffect } from 'react'
import logo from '../../assets/logo.png'
import FiltersForm from '../../components/FiltersForm/FiltersForm'
import List from '../../components/List/List';
import AuthModal from '../../components/AuthModal/AuthModal';
import { ProductsContext } from '../../utils/ProductsContext'
import Loader from '../../components/Loader/Loader';

function Main () {

  const { products, brands, categories, loaderDisplay, setLoaderDisplay, credentials, apiUrl, setApiUrl, fetchData, setUserName, setPassWord, authModalDisplay, textError } = useContext(ProductsContext);
  const [collectionTagSelected, setCollectionTagSelected] = useState('TOUTES LES SAISONS');
  const [brandSelected, setBrandSelected] = useState('TOUTES LES MARQUES');
  const [storeSelected, setStoreSelected] = useState('0');
  const [startDateSelected, setStartDateSelected] = useState('');
  const [endDateSelected, setEndDateSelected] = useState('');
  const [categorySelected, setCategorySelected] = useState('TOUTES LES CATEGORIES');
  const [collectionTags, setCollectionTags] = useState([]);
  const [stores, setStores] = useState ([]);

  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalTtcPrice, setTotalTtcPrice] = useState(0);
  const [totalHtPrice, setTotalHtPrice] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [totalSupplyPrice, setTotalSupplyPrice] = useState(0);
  const [totalMarge, setTotalMarge] = useState(0);
  const [totalMargePercent, setTotalMargePercent] = useState(0);

  const [salesList, setSalesList] = useState([]);

  const [filteredSalesList, setFilteredSalesList] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState(brands);
  const [finalFilteredSalesList, setFinalFilteredSalesList] = useState([])

  const startDate = new Date(startDateSelected); // mois en JavaScript commence à 0 (0 = janvier)
  const endDate = new Date(endDateSelected); // mois en JavaScript commence à 0 (0 = janvier)
  const store_id = storeSelected;

  const filterBrands = function() {
    if (categorySelected === 'TOUTES LES CATEGORIES' && collectionTagSelected === 'TOUTES LES SAISONS' && storeSelected === '0' && brandSelected === 'TOUTES LES MARQUES') {
        console.log(categorySelected)
        console.log(collectionTagSelected)
        console.log(storeSelected)
        console.log(brandSelected)
        console.log("cas1")
        const filterBrandsUpdated = brands.filter(brand => 
        finalFilteredSalesList.some(sale => sale.product_brand === brand.brand_name)
        );
        return filterBrandsUpdated;
    } else {
      console.log("cas2")
      try {   
        const datedFilteredSales = finalFilteredSalesList
          .filter(sale => storeSelected === '0' || sale.store_id === parseFloat(storeSelected))
          .filter(sale => collectionTagSelected === 'TOUTES LES SAISONS' || sale.product_tag === collectionTagSelected)
          .filter(sale => categorySelected === 'TOUTES LES CATEGORIES' || sale.product_category_id_parent === parseFloat(categorySelected));
    
        const filterBrandsUpdated = brands.filter(brand => 
          datedFilteredSales.some(sale => sale.product_brand === brand.brand_name)
        );
        return filterBrandsUpdated;
        } catch (error) {
          console.error('Erreur lors de la génération de la liste filtrée des ventes :', error);
        }
    }
  }

  useEffect(() => { 
    generateFilteredSalesList();
  }, [storeSelected, collectionTagSelected, categorySelected, brandSelected]);

  useEffect(() => {
    calcTotals();
    setFilteredBrands(filterBrands);
    console.log(filteredBrands);
  }, [finalFilteredSalesList, filteredSalesList])
  
  /* -----------------------------------
  ----------  RÉCUPÉRATION DES PRODUITS
  ------------------------------------ */
  
  async function launchRequest() {
    await fetchData();
    await getTags().then(tags => {
      let collectionTags = []
      if (tags) {
        let collectionTagsList = tags[1].tag_details
        collectionTagsList.forEach(tag => {
            collectionTags.push(tag);
            });
      setCollectionTags(collectionTags)
      }
    })
    setStores(storesList)
  }


/*------------------------------------------------------------------------------------------------------------
-----------  GÉNÉRER LES VENTES TOTALES SUR LES DATES ESCOMPTÉES ---------------------------------------------
------------------------------------------------------------------------------------------------------------*/

  async function generateDatedSalesList() {
    setLoaderDisplay(true);
    await generateDatedList();

    console.log(categorySelected)
    console.log(collectionTagSelected)
    console.log(brandSelected)
    setLoaderDisplay(false);
  }
  
  // RÉCUPÉRATION DES VENTES POUR UNE JOURNÉE DONNÉE
  async function getSalesByDate(year, month, day, store_id) {
    try {
      const response = await fetch(`${apiUrl}/products_sold/${store_id}/${year}/${month}/${day}`, {
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
    store_id = 0

    while (currentDate <= end) {
      let year = currentDate.getFullYear();
      let month = currentDate.getMonth() + 1; // Les mois commencent à 0 dans JavaScript
      let day = currentDate.getDate();

      const sales = await getSalesByDate(year, month, day, store_id);
      if (sales) {
        salesList.push(...sales); // Ajouter les ventes récupérées à la liste
      }
      currentDate.setDate(currentDate.getDate() + 1); // Passer au jour suivant
    }
    // setSalesList(salesList);
    return salesList;
  }
  
  async function generateDatedList() {
    try {
      const sales = await getAllSales(startDate, endDate, store_id);

      const maxSimultaneousRequests = 5; // Limite le nombre de requêtes simultanées
  
      const datedSales = [];
      let currentIndex = 0;
  
      while (currentIndex < sales.length) {
        const currentBatch = sales.slice(currentIndex, currentIndex + maxSimultaneousRequests);
  
        const batchResults = await Promise.all(
          currentBatch.map(async sale => {
  
            const htPrice = parseFloat(sale.product_price) / (1 + parseFloat(sale.vat));
            const roundedHtPrice = htPrice.toFixed(2);
  
            const [saleTag, store, product] = await Promise.all([
              getTagsProducts(sale.product_id),
              stores.find(store => store.store_id === sale.store_id),
              products.find(product => product.product_id === sale.product_id)
            ]);
  
            const collectionTag = collectionTags.find(tag => tag.tag_id === saleTag?.[0]?.tag_id) || '';
            const saleTagName = collectionTag ? collectionTag.tag : '';
  
            const storeName = store ? store.store_name : 'aucune boutique';
  
            const brand = brands?.find(brand => brand.brand_id === product?.product_brand) || '';
            const brandName = brand.brand_name ? brand.brand_name : '';
  
            const category = categories.find(category => category.category_id === product?.product_category) || '';
            const categoryName = category ? category.category_name : '';
            const parentCategory = category?.category_id_parent || '';
            const parentNameCategory = categoryParentNames.find(item => item.id === parentCategory) || '';
            const parentName = parentNameCategory?.name || '';
            const supplyPrice = parseFloat(product?.product_supply_price) || 0;
            const marge = (roundedHtPrice - supplyPrice).toFixed(2);
            const margePercent = ((marge / roundedHtPrice) * 100).toFixed(0);
  
            return {
              ...sale,
              product_htPrice: roundedHtPrice,
              product_tag: saleTagName,
              store_name: storeName,
              product_brand: brandName,
              product_category: categoryName,
              product_category_id_parent: parentCategory,
              product_category_name_parent: parentName,
              product_supply_priceHt: supplyPrice,
              marge: marge,
              margePercent: margePercent
            };
          })
        );
        datedSales.push(...batchResults);
        currentIndex += maxSimultaneousRequests;
      }
      setSalesList(datedSales);
      setFilteredSalesList(datedSales.filter(sale => sale.product_price !== '0.00'));
      setFinalFilteredSalesList(datedSales.filter(sale => sale.product_price !== '0.00'))
    } catch (error) {
      console.error('Erreur lors de la génération de la liste filtrée des ventes :', error);
    }
  }

  /*------------------------------------------------------------------------------------------------------------
  -----------  APPLIQUER LES FILTRES ---------------------------------------------------------------------------
  ------------------------------------------------------------------------------------------------------------*/
  
  async function generateFilteredSalesList() {
    setLoaderDisplay(true);
    await generateDatedFilteredList();
    setLoaderDisplay(false);
  }

  async function generateDatedFilteredList() {
    
    try {
      const datedFilteredSales = filteredSalesList
        .filter(sale => storeSelected === '0' || sale.store_id === parseFloat(storeSelected))
        .filter(sale => collectionTagSelected === 'TOUTES LES SAISONS' || sale.product_tag === collectionTagSelected)
        .filter(sale => brandSelected === 'TOUTES LES MARQUES' || sale.product_brand === brandSelected)
        .filter(sale => categorySelected === 'TOUTES LES CATEGORIES' || sale.product_category_id_parent === parseFloat(categorySelected));
      setFinalFilteredSalesList(datedFilteredSales);
      
    } catch (error) {
      console.error('Erreur lors de la génération de la liste filtrée des ventes :', error);
    }
  }
  
  /* ------------------------------------------
  2è ÉTAPE :: RÉCUPÉRATION DES TAGS COLLECTIONS
  ------------------------------------------ */

  async function getTags() {
      try {
      const response = await fetch(`${apiUrl}/tags/products`, {
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
      const response = await fetch(`${apiUrl}/products_tags/${product_id}`, {
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
    if (finalFilteredSalesList && finalFilteredSalesList.length > 0) {
        const csvData = jsonToCsv(finalFilteredSalesList);
        downloadCsv(csvData, 'filteredSales.csv');
    } else {
        console.warn('No sales data available to download.');
    }
  }

  async function calcTotals () {
    const quantityAdded = finalFilteredSalesList.reduce((total, item) => {
      return total + item.quantity;
    }, 0);

    const ttcPriceAdded = finalFilteredSalesList.reduce((total, item) => {
      return total + parseFloat(item.product_price);
    }, 0);

    const htPriceAdded = finalFilteredSalesList.reduce((total, item) => {
      return total + parseFloat(item.product_htPrice);
    }, 0);

    const discountAdded = finalFilteredSalesList.reduce((total, item) => {
      return total + parseFloat(item.discount);
    }, 0);

    const margeAdded = finalFilteredSalesList.reduce((total, item) => {
      return total + parseFloat(item.marge);
    }, 0);

    const supplyPriceAdded = finalFilteredSalesList.reduce((total, item) => {
      return total + parseFloat(item.product_supply_priceHt);
    }, 0);

    const margePercentTotal = ((margeAdded/htPriceAdded)*100)

    setTotalQuantity(quantityAdded);
    setTotalTtcPrice(ttcPriceAdded);
    setTotalHtPrice(htPriceAdded);
    setTotalDiscount(discountAdded);
    setTotalMarge(margeAdded);
    setTotalMargePercent(margePercentTotal);
    setTotalSupplyPrice(supplyPriceAdded);
  }

  async function resetFields() {
    setTotalQuantity(0)
    setTotalHtPrice(0)
    setTotalTtcPrice(0)
    setTotalDiscount(0)
    setTotalMarge(0)
    setTotalMargePercent(0);
    setTotalSupplyPrice(0);
    setFilteredSalesList([]);
    setFinalFilteredSalesList([]);
    setSalesList([])
    setBrandSelected('TOUTES LES MARQUES')
    setCategorySelected('TOUTES LES CATEGORIES')
    setCollectionTagSelected('TOUTES LES SAISONS')
    setStoreSelected('0')
  }

  function goBackDateSelection() {
    resetFields()   
  }

  function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }

  return (
      <main className='main'>
        <img className='main_img' src={logo}/>
        <p className='main_title'>STATS GEN</p>
        {salesList && salesList.length > 0 &&
          <p className='main_date'> du {formatDate(startDateSelected)} au {formatDate(endDateSelected)}</p>
        }
        <FiltersForm 
            salesList = {salesList}
            setCategorySelected = {setCategorySelected}
            categorySelected={categorySelected}
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
            products={products}
            generateFilteredSalesList={generateFilteredSalesList}
            filteredSalesList={filteredSalesList}
            filteredBrands={filteredBrands}
            setFilteredBrands={setFilteredBrands}
            filterBrands={filterBrands}
        />
        {salesList && salesList.length > 0 &&
          <button className='main_genButton main_genButton--generate' type='button' onClick={() => goBackDateSelection()}>CHANGER LA PÉRIODE</button>
        }
        {!salesList || salesList.length === 0 &&
          <button className='main_genButton main_genButton--loadSales' type='button' onClick={() => generateDatedSalesList()}>GÉNÉRER LES VENTES</button>
        }
        { finalFilteredSalesList && finalFilteredSalesList.length > 0 &&
        <button className='main_csvButton' type='button' onClick={handleDownloadCsv}>.CSV</button>
        }
        { finalFilteredSalesList && finalFilteredSalesList.length > 0 &&
          <p className='main_totalResults'> QUANTITÉ TOTALE : <strong className='main_totalResults--strong'>{totalQuantity}</strong> <br/>
          CA TOTAL TTC: <strong>{totalTtcPrice.toFixed(0)} </strong> <br/>
          CA TOTAL HT: <strong>{totalHtPrice.toFixed(0)} </strong> <br/>
          PRIX D'ACHAT TOTAL HT: <strong>{totalSupplyPrice.toFixed(0)} </strong> <br/>
          TOTAL REMISES: <strong>{totalDiscount.toFixed(0)} </strong> <br/>
          MARGE TOTALE: <strong>{totalMarge.toFixed(0)} </strong> <br/>
          MARGE TOTALE EN %: <strong>{totalMargePercent.toFixed(0)}% </strong>
          </p>
        }   
        { finalFilteredSalesList && finalFilteredSalesList.length > 0 &&
        <List
            salesList = {finalFilteredSalesList}/>
        }
        { !finalFilteredSalesList || finalFilteredSalesList.length === 0 && filteredSalesList.length !== 0 &&
          <p className='main_alertText'>Aucune vente ne correspond à cette recherche</p>
        }
        <Loader 
          loaderDisplay={loaderDisplay} 
          className='loader--translucent'
        />
        <div className={authModalDisplay===true?'main_authModal main_authModal--displayOn':'main_authModal main_authModal--displayOff'}>
          <AuthModal setPassWord={setPassWord} setUserName={setUserName} setApiUrl={setApiUrl}/>
          {textError===true &&
            <p className='main_authModal_textError'><em>Identifiant et/ou clé non valides</em></p>
          }
          <button className='main_authModal_button' type="button" onClick={() => launchRequest()} >VALIDER</button>
        </div>
      </main>
  )
}

export default Main