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

  const [collectionTagSelected, setCollectionTagSelected] = useState('TOUTES LES SAISONS');
  const [brandSelected, setBrandSelected] = useState('TOUTES LES MARQUES');
  const [storeSelected, setStoreSelected] = useState(1);
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
  const [totalMargePercent, setTotalMargePercent] = useState(0)

  const [filteredSalesList, setFilteredSalesList] = useState([]);

  const { products, brands, categories, loaderDisplay, setLoaderDisplay, credentials, apiUrl, setApiUrl, fetchData, userName, passWord, setUserName, setPassWord, authModalDisplay, textError } = useContext(ProductsContext);

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
    setStores (storesList)
  }

  useEffect(() => {
    calcTotals();
  }, [filteredSalesList]);

  /* -----------------------------------------------------
  1È ÉTAPE :: RÉCUPÉRATION DES VENTES POUR PLUSIEURS JOURS
  ----------------------------------------------------- */

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
            await new Promise(resolve => setTimeout(resolve, 500));
            const htPrice = parseFloat(sale.product_price) / (1 + parseFloat(sale.vat));
            const roundedHtPrice = htPrice.toFixed(2);
            const saleTag = await getTagsProducts(sale.product_id);
            
            // Utilisation de find pour obtenir le tag correspondant
            const collectionTag = collectionTags.find(tag => tag.tag_id === saleTag[0]?.tag_id) || '';
            const saleTagName = collectionTag ? collectionTag.tag : '';

            // Utilisation de find pour obtenir le store correspondant
            const store = await stores.find(store => store.store_id === sale.store_id);
            const storeName = store ? store.store_name : 'aucune boutique';

            // Utilisation de find pour obtenir le produit correspondant puis la marque et la catégorie
            const product = await products?.find(product => product.product_id === sale.product_id);
            const brand = await brands?.find(brand => brand.brand_id === product?.product_brand) || '';
            const brandName = brand.brand_name ? brand.brand_name : '';
            
            const category = await categories?.find(category => category.category_id === product?.product_category) || '';
            const categoryName = category ? category.category_name : '';
            const parentCategory = category ?.category_id_parent || '';
            const parentNameCategory = categoryParentNames?.find(item => item.id === parentCategory) || '';
            const parentName = parentNameCategory?.name || '';
            const supplyPrice = parseFloat(product?.product_supply_price) || 0;
            const marge = (roundedHtPrice - supplyPrice).toFixed(2);
            const margePercent = ((marge/supplyPrice)*100).toFixed(0);

            

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

      const datedFilteredSales = filteredSales
        .filter (sale => {
            const tagCondition = collectionTagSelected === 'TOUTES LES SAISONS' || sale.product_tag === collectionTagSelected;
            const brandCondition = brandSelected === 'TOUTES LES MARQUES' || sale.product_brand === brandSelected;
            const categoriesCondition = categorySelected === 'TOUTES LES CATEGORIES' || sale.product_category_id_parent === parseFloat(categorySelected);
            return tagCondition && brandCondition && categoriesCondition;
          })

      setFilteredSalesList(datedFilteredSales);
      console.log(datedFilteredSales.length)
    } catch (error) {

      console.error('Erreur lors de la récupération des ventes :', error);
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
    if (filteredSalesList && filteredSalesList.length > 0) {
        const csvData = jsonToCsv(filteredSalesList);
        downloadCsv(csvData, 'filteredSales.csv');
    } else {
        console.warn('No sales data available to download.');
    }
  }

  async function calcTotals () {
    const quantityAdded = filteredSalesList.reduce((total, item) => {
      return total + item.quantity;
    }, 0);

    const ttcPriceAdded = filteredSalesList.reduce((total, item) => {
      return total + parseFloat(item.product_price);
    }, 0);

    const htPriceAdded = filteredSalesList.reduce((total, item) => {
      return total + parseFloat(item.product_htPrice);
    }, 0);

    const discountAdded = filteredSalesList.reduce((total, item) => {
      return total + parseFloat(item.discount);
    }, 0);

    const margeAdded = filteredSalesList.reduce((total, item) => {
      return total + parseFloat(item.marge);
    }, 0);

    const supplyPriceAdded = filteredSalesList.reduce((total, item) => {
      return total + parseFloat(item.product_supply_priceHt);
    }, 0);

    const margePercentTotal = ((margeAdded/supplyPriceAdded)*100)

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
  }

  async function generateFilteredSalesList() {
    setLoaderDisplay(true);
    await resetFields();
    await generateDatedList();
    setLoaderDisplay(false);
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
          <p className='main_totalResults'>QUANTITÉ TOTALE : <strong className='main_totalResults--strong'>{totalQuantity}</strong> <br/>
          CA TOTAL TTC: <strong>{totalTtcPrice.toFixed(0)} </strong> <br/>
          CA TOTAL HT: <strong>{totalHtPrice.toFixed(0)} </strong> <br/>
          PRIX D'ACHAT TOTAL HT: <strong>{totalSupplyPrice.toFixed(0)} </strong> <br/>
          TOTAL REMISES: <strong>{totalDiscount.toFixed(0)} </strong> <br/>
          MARGE TOTALE: <strong>{totalMarge.toFixed(0)} </strong> <br/>
          MARGE TOTALE EN %: <strong>{totalMargePercent.toFixed(0)}% </strong>
          </p>
        }   
        { filteredSalesList && filteredSalesList.length > 0 &&
        <List
            salesList = {filteredSalesList}/>
        }
        { !filteredSalesList || filteredSalesList.length === 0 &&
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