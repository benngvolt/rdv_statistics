import './AuthModal.scss'
import logo from '../../assets/logo.png'

function AuthModal ({setPassWord, setUserName, setApiUrl}) {

    return (
        <form className='authModal'>
            <img className='authModal_img' src={logo}/>
            <p className='authModal_title'>STATS GEN</p>
            <div className='authModal_field'>
                <label htmlFor='inputApiUrl'>URL</label>
                <input
                    type='text'
                    id='inputApiUrl'
                    onChange={(e) => {
                        const apiUrlValue = e.target.value;
                        setApiUrl(apiUrlValue);
                    }}
                />
            </div>
            <div className='authModal_field'>
                <label htmlFor='inputUserName'>USERNAME</label>
                <input
                    type='text'
                    id='inputUserName'
                    onChange={(e) => {
                        const userNameValue = e.target.value;
                        setUserName(userNameValue);
                    }}
                />
            </div>
            <div className='authModal_field'>
                <label htmlFor='inputPassWord'>KEY</label>
                <input
                    type='password'
                    id='inputPassWord'
                    onChange={(e) => {
                        const passwordValue = e.target.value;
                        setPassWord(passwordValue);
                    }}
                />
            </div>
        </form>
    )
}

export default AuthModal