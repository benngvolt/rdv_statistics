import './FiltersForm.scss'
import {useRef, useState, useEffect, useContext } from 'react'

// import HomePage from '../../components/HomePage/HomePage'

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
                <label htmlFor='inputStartDate'>DATE DE DÉBUT</label>
                <input
                    type='date'
                    id='inputStartDate'
                    // value={date.day}
                    onChange={(e) => {
                        const startDate = e.target.value;
                        setStartDateSelected(startDate);
                    }}
                />
            </div>
            <div className="form_field" >
                <label htmlFor='inputEndDate'>DATE DE FIN</label>
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
                <label htmlFor='inputStore'>BOUTIQUE</label>
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
                <label htmlFor='inputCollectionTag'>SAISON</label>
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
                    {brands?.map((brand, index)=>(
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
                    <option key='men' value='MEN'>MEN</option>
                    <option key='women' value='WOMEN'>WOMEN</option>
                </select>
            </div>
        </form>
    )
}

export default FiltersForm