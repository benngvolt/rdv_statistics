import './List.scss'
import {useRef, useState, useEffect, useContext } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faSort
} from '@fortawesome/free-solid-svg-icons'

function List ({
    salesList}) 
    {
    
    const [sortedList, setSortedList] = useState(salesList)
    const [isSaleDescending, setIsSaleDescending] = useState(false)

    useEffect(() => {
        setSortedList(salesList);
    }, [salesList]);

 

    async function sortSaleId() {
        if (isSaleDescending){
            setSortedList(salesList.sort((a, b) => a.sale_id - b.sale_id));
            setIsSaleDescending(false);
        } else {
            setSortedList(salesList.sort((a, b) => b.sale_id - a.sale_id));
            setIsSaleDescending(true);
        } 
    }

    function sortDate() {
        if (isSaleDescending) {
            // Tri par ordre ascendant de sale_date
            setSortedList(salesList.sort((a, b) => new Date(a.sale_date) - new Date(b.sale_date)));
            setIsSaleDescending(false);
        } else {
            // Tri par ordre descendant de sale_date
            setSortedList(salesList.sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date)));
            setIsSaleDescending(true);
        }
    }

    function sortProductId() {
        if (isSaleDescending){
            setSortedList(salesList.sort((a, b) => a.product_id - b.product_id));
            setIsSaleDescending(false);
        } else {
            setSortedList(salesList.sort((a, b) => b.product_id - a.product_id));
            setIsSaleDescending(true);
        } 
    }
   
    function sortPriceTtc() {
        if (isSaleDescending){
            setSortedList(salesList.sort((a, b) => a.product_price - b.product_price));
            setIsSaleDescending(false);
        } else {
            setSortedList(salesList.sort((a, b) => b.product_price - a.product_price));
            setIsSaleDescending(true);
        } 
    }
    function sortPriceHt() {
        if (isSaleDescending){
            setSortedList(salesList.sort((a, b) => a.product_htPrice - b.product_htPrice));
            setIsSaleDescending(false);
        } else {
            setSortedList(salesList.sort((a, b) => b.product_htPrice - a.product_htPrice));
            setIsSaleDescending(true);
        } 
    }
    function sortTag() {
        if (isSaleDescending){
            setSortedList(salesList.sort((a, b) => a.product_tag.localeCompare(b.product_tag)));
            setIsSaleDescending(false);
        } else {
            setSortedList(salesList.sort((a, b) => b.product_tag.localeCompare(a.product_tag)));
            setIsSaleDescending(true);
        } 
    }
    
    function sortBrand() {
        if (isSaleDescending){
            setSortedList(salesList.sort((a, b) => a.product_brand.localeCompare(b.product_brand)));
            setIsSaleDescending(false);
        } else {
            setSortedList(salesList.sort((a, b) => b.product_brand.localeCompare(a.product_brand)));
            setIsSaleDescending(true);
        } 
    }
    function sortCategory() {
        if (isSaleDescending){
            setSortedList(salesList.sort((a, b) => a.product_category.localeCompare(b.product_category)));
            setIsSaleDescending(false);
        } else {
            setSortedList(salesList.sort((a, b) => b.product_category.localeCompare(a.product_category)));
            setIsSaleDescending(true);
        } 
    }
    

    return (
        <ul className='salesList'>
            <li className='salesList_item salesList_item--bold'> 
                <p type='button' onClick={() => sortSaleId()}>ID VENTE<span><FontAwesomeIcon icon={faSort} className='button--icon'/></span></p>
                <p type='button' onClick={() => sortDate()}>DATE<span><FontAwesomeIcon icon={faSort} className='button--icon'/></span></p>
                <p type='button' onClick={() => sortProductId()}>ID PRODUIT<span><FontAwesomeIcon icon={faSort} className='button--icon'/></span></p>
                <p>QTÉ</p>
                <p>PRIX ACHAT HT</p>
                <p type='button' onClick={() => sortPriceTtc()}>PRIX VENTE TTC<span><FontAwesomeIcon icon={faSort} className='button--icon'/></span></p>
                <p type='button' onClick={() => sortPriceHt()}>PRIX VENTE HT<span><FontAwesomeIcon icon={faSort} className='button--icon'/></span></p>
                <p>REMISE</p>
                <p>MARGE €</p>
                <p>MARGE %</p>
                <p type='button' onClick={() => sortTag()}>COLLECTION<span><FontAwesomeIcon icon={faSort} className='button--icon'/></span></p>
                <p>BOUTIQUE</p>
                <p type='button'onClick={() => sortBrand()}>MARQUE<span><FontAwesomeIcon icon={faSort} className='button--icon'/></span></p>
                <p>CATEGORIE PARENTE</p>
                <p type='button' onClick={() => sortCategory()}>CATEGORIE<span><FontAwesomeIcon icon={faSort} className='button--icon'/></span></p>
            </li>
          {sortedList?.map((sale, index) => 
            <li key={`${sale.product_id}-${sale.sale_id}-${index}`} className='salesList_item'> 
                <p>{sale.sale_id}</p>
                <p>{sale.sale_date}</p>
                <p>{sale.product_id}</p>
                <p>{sale.quantity}</p>
                <p>{sale.product_supply_priceHt}</p>
                <p>{sale.product_price}</p>
                <p>{sale.product_htPrice}</p>
                <p>{sale.discount}</p>
                <p>{sale.marge}</p>
                <p>{sale.margePercent}%</p>
                <p>{sale.product_tag}</p>
                <p>{sale.store_name}</p>
                <p>{sale.product_brand}</p>
                <p>{sale.product_category_name_parent}</p>
                <p>{sale.product_category}</p>

            </li>
          )}
        </ul>
    )
}

export default List