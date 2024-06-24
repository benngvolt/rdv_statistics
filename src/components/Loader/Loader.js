import './Loader.scss'

function Loader ({loaderDisplay, className}) {

    return (
        <div className={loaderDisplay === false ? `${className} loader loader--displayOff` : `${className} loader loader--displayOn` }>
            <p className='loader_text'>RÉCUPÉRATION DES DONNÉES...</p>
            <svg className="circular" viewBox="25 25 50 50">
                <circle className="path" cx="50" cy="50" r="20" fill="none" strokeWidth="2" strokeMiterlimit="10"/>
            </svg> 
        </div>
    )
}

export default Loader