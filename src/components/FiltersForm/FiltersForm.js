import './FiltersForm.scss'
import {useRef, useState, useEffect, useContext } from 'react'

function FiltersForm ({

    setStartDateSelected,
    setEndDateSelected,
    setStoreSelected,
    storeSelected,
    stores,
    setBrandSelected,
    brandSelected,
    brands,
    setCollectionTagSelected,
    collectionTagSelected,
    collectionTags,
    setCategorySelected,
    categorySelected
    })    
    {

    return (
        <form className="form">
            <div className="form_field">
                <label htmlFor='inputStartDate'>DATE DÉBUT</label>
                <input
                    type='date'
                    id='inputStartDate'
                    onChange={(e) => {
                        const startDate = e.target.value;
                        setStartDateSelected(startDate);
                    }}
                />
            </div>
            <div className="form_field" >
                <label htmlFor='inputEndDate'> DATE FIN </label>
                <input
                    type='date'
                    id='inputEndDate'
                    onChange={(e) => {
                        const endDate = e.target.value;
                        setEndDateSelected(endDate);
                    }}
                />
            </div>
            <div className="form_field">
                <label htmlFor='inputStore'> BOUTIQUE </label>
                <select id='inputStore' 
                        name="store"
                        value={storeSelected}
                        onChange={(e) => setStoreSelected(e.target.value)}>
                    {stores.map((store)=>(
                    <option key={store.store_name} value={store.store_id}>{store.store_name}</option>
                    ))}
                </select>
            </div>
            <div className="form_field">
                <label htmlFor='inputCollectionTag'> SAISON </label>
                <select id='inputCollectionTag' 
                        name="colletionTag"
                        value={collectionTagSelected}
                        onChange={(e) => setCollectionTagSelected(e.target.value)}>
                    <option value="TOUTES LES SAISONS">TOUTES LES SAISONS</option>
                    {collectionTags.map((collectionTag)=>(
                    <option key={collectionTag} value={collectionTag.tag}>{collectionTag.tag}</option>
                    ))}
                </select>
            </div>
            <div className="form_field">
                <label htmlFor='inputBrand'>MARQUE</label>
                <select id='inputBrand' 
                        name="brand"
                        value={brandSelected}
                        onChange={(e) => setBrandSelected(e.target.value)}>
                    <option value="TOUTES LES MARQUES">TOUTES LES MARQUES</option>
                    {brands?.sort((a, b) => a.brand_name.localeCompare(b.brand_name)).map((brand, index)=>(
                    <option key={brand + index} value={brand.brand_name}>{brand.brand_name}</option>
                    ))}
                </select>
            </div>
            <div className="form_field" >
                <label htmlFor='inputCategory'>CATÉGORIE</label>
                <select id='inputCategory' 
                        name="category"
                        value={categorySelected}
                        onChange={(e) => setCategorySelected(e.target.value)}>
                    <option key='toutes' value='TOUTES LES CATEGORIES'>TOUTES LES CATEGORIES</option>
                    <option key='men' value='33'>MEN</option>
                    <option key='women' value='56'>WOMEN</option>
                    <option key='shippingFees' value='59'>SHIPPING FEES</option>
                    <option key='fragrance' value='20'>FRAGRANCES</option>
                    <option key='everydayGoods' value='16'>EVERYDAY GOODS</option>
                </select>
            </div>
        </form>
    )
}

export default FiltersForm